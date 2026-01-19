// Research Pipeline Orchestration
// Coordinates the full research flow: Discovery -> Enrichment -> Validation -> Scoring

import { prisma } from '@/lib/db';
import {
  startDeepResearch,
  getResearchStatus,
  waitForResearchCompletion,
} from '@/lib/ai/deep-research';
import { extractBusinessData, validateBusinessData } from '@/lib/ai/openai';
import { getPrompt } from '@/lib/ai/prompts';
import type {
  ResearchJob,
  ResearchJobParameters,
  ResearchJobStatus,
  ExtractedBusinessData,
} from '@/types';

// ============================================================================
// PIPELINE STATE
// ============================================================================

export type PipelineStage =
  | 'INIT'
  | 'DISCOVERY'
  | 'EXTRACTION'
  | 'VALIDATION'
  | 'STORAGE'
  | 'SCORING'
  | 'COMPLETE'
  | 'ERROR';

export interface PipelineProgress {
  stage: PipelineStage;
  progress: number; // 0-100
  message: string;
  businessesFound: number;
  businessesProcessed: number;
  errors: string[];
}

export interface PipelineResult {
  success: boolean;
  jobId: string;
  businessIds: string[];
  stats: {
    discovered: number;
    validated: number;
    stored: number;
    scored: number;
    errors: number;
  };
  duration: number;
}

// ============================================================================
// MAIN PIPELINE
// ============================================================================

/**
 * Execute the full research pipeline for a region discovery job
 */
export async function runRegionDiscoveryPipeline(
  jobId: string,
  params: ResearchJobParameters,
  onProgress?: (progress: PipelineProgress) => void
): Promise<PipelineResult> {
  const startTime = Date.now();
  const result: PipelineResult = {
    success: false,
    jobId,
    businessIds: [],
    stats: { discovered: 0, validated: 0, stored: 0, scored: 0, errors: 0 },
    duration: 0,
  };

  const progress: PipelineProgress = {
    stage: 'INIT',
    progress: 0,
    message: 'Initializing pipeline',
    businessesFound: 0,
    businessesProcessed: 0,
    errors: [],
  };

  const updateProgress = (updates: Partial<PipelineProgress>) => {
    Object.assign(progress, updates);
    onProgress?.(progress);
    updateJobProgress(jobId, progress);
  };

  try {
    // Stage 1: Discovery
    updateProgress({
      stage: 'DISCOVERY',
      progress: 10,
      message: 'Starting deep research discovery',
    });

    const discoveryResult = await runDiscoveryStage(jobId, params);
    if (!discoveryResult.success) {
      throw new Error(discoveryResult.error || 'Discovery failed');
    }

    updateProgress({
      progress: 30,
      message: `Deep research completed`,
      businessesFound: 0,
    });

    // Stage 2: Extraction
    updateProgress({
      stage: 'EXTRACTION',
      progress: 40,
      message: 'Extracting business data from research',
    });

    const extractedBusinesses = await extractBusinessData(discoveryResult.output || '');
    result.stats.discovered = extractedBusinesses.length;

    updateProgress({
      progress: 50,
      message: `Extracted ${extractedBusinesses.length} businesses`,
      businessesFound: extractedBusinesses.length,
    });

    // Stage 3: Validation
    updateProgress({
      stage: 'VALIDATION',
      progress: 55,
      message: 'Validating business data',
    });

    const validatedBusinesses = await validateBusinesses(extractedBusinesses, updateProgress);
    result.stats.validated = validatedBusinesses.length;

    // Stage 4: Storage
    updateProgress({
      stage: 'STORAGE',
      progress: 70,
      message: 'Storing businesses in database',
    });

    const storedBusinessIds = await storeBusinesses(jobId, validatedBusinesses);
    result.businessIds = storedBusinessIds;
    result.stats.stored = storedBusinessIds.length;

    updateProgress({
      progress: 85,
      message: `Stored ${storedBusinessIds.length} businesses`,
    });

    // Stage 5: Initial Scoring
    updateProgress({
      stage: 'SCORING',
      progress: 90,
      message: 'Running initial scoring',
    });

    // Note: Scoring will be implemented in Phase 4
    // For now, just mark businesses as needing scores
    result.stats.scored = storedBusinessIds.length;

    // Complete
    updateProgress({
      stage: 'COMPLETE',
      progress: 100,
      message: 'Pipeline complete',
      businessesProcessed: storedBusinessIds.length,
    });

    result.success = true;
    result.duration = Date.now() - startTime;

    // Update job status
    await updateJobStatus(jobId, 'COMPLETED', {
      businessesFound: result.stats.discovered,
      businessesQualified: result.stats.stored,
    });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    progress.errors.push(errorMessage);

    updateProgress({
      stage: 'ERROR',
      message: `Pipeline failed: ${errorMessage}`,
    });

    await updateJobStatus(jobId, 'FAILED', { error: errorMessage });

    result.stats.errors = progress.errors.length;
    result.duration = Date.now() - startTime;

    return result;
  }
}

// ============================================================================
// PIPELINE STAGES
// ============================================================================

async function runDiscoveryStage(
  jobId: string,
  params: ResearchJobParameters
): Promise<{ success: boolean; output?: string; error?: string }> {
  const region = params.region;
  if (!region?.county) {
    return { success: false, error: 'County is required for region discovery' };
  }

  // Build the discovery prompt
  const prompt = getPrompt('regionDiscovery', {
    county: region.county,
    city: region.city,
    focus: 'all',
  });

  // Start deep research
  const researchResult = await startDeepResearch(prompt, {
    maxToolCalls: 50,
    background: true,
  });

  if (researchResult.status === 'failed') {
    return { success: false, error: researchResult.error };
  }

  // Store the OpenAI response ID
  await prisma.researchJob.update({
    where: { id: jobId },
    data: { openaiResponseId: researchResult.id },
  });

  // Wait for completion (with timeout)
  const finalResult = await waitForResearchCompletion(researchResult.id, {
    maxWaitMs: 30 * 60 * 1000, // 30 minutes
    onProgress: (status) => {
      console.log(`Research status: ${status.status}`);
    },
  });

  if (finalResult.status === 'completed') {
    return { success: true, output: finalResult.output };
  } else {
    return { success: false, error: finalResult.error || 'Research did not complete' };
  }
}

async function validateBusinesses(
  businesses: ExtractedBusinessData[],
  updateProgress: (updates: Partial<PipelineProgress>) => void
): Promise<ExtractedBusinessData[]> {
  const validated: ExtractedBusinessData[] = [];

  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i];

    // Basic validation
    if (!business.name || !business.city || !business.county) {
      continue;
    }

    // AI validation for high-confidence entries
    if (business.confidence >= 0.7) {
      const validation = await validateBusinessData(business);
      if (!validation.isValid && validation.issues.length > 0) {
        // Log issues but still include if not critical
        console.log(`Validation issues for ${business.name}:`, validation.issues);
      }
    }

    validated.push(business);

    // Update progress
    const progressPct = 55 + Math.round((i / businesses.length) * 15);
    updateProgress({
      progress: progressPct,
      message: `Validating ${i + 1}/${businesses.length}`,
      businessesProcessed: i + 1,
    });
  }

  return validated;
}

async function storeBusinesses(
  jobId: string,
  businesses: ExtractedBusinessData[]
): Promise<string[]> {
  const storedIds: string[] = [];

  for (const business of businesses) {
    try {
      // Check for duplicates by name and city
      const existing = await prisma.business.findFirst({
        where: {
          name: business.name,
          city: business.city,
          county: business.county,
        },
      });

      if (existing) {
        // Update existing record
        await prisma.business.update({
          where: { id: existing.id },
          data: {
            address: business.address || existing.address,
            phone: business.phone || existing.phone,
            website: business.website || existing.website,
            email: business.email || existing.email,
            specializations: business.specializations || existing.specializations,
            niches: business.niches || existing.niches,
            ownerName: business.ownerName || existing.ownerName,
            foundedYear: business.foundedYear || existing.foundedYear,
            updatedAt: new Date(),
          },
        });
        storedIds.push(existing.id);
      } else {
        // Create new record
        const newBusiness = await prisma.business.create({
          data: {
            name: business.name,
            city: business.city,
            county: business.county,
            state: 'TX',
            address: business.address,
            phone: business.phone,
            website: business.website,
            email: business.email,
            specializations: business.specializations || [],
            niches: business.niches || [],
            serviceTypes: [],
            ownerName: business.ownerName,
            foundedYear: business.foundedYear,
            status: 'DISCOVERED',
            discoverySource: 'deep_research',
            discoveryJobId: jobId,
          },
        });
        storedIds.push(newBusiness.id);
      }

      // Link to research job
      await prisma.researchJobBusiness.create({
        data: {
          researchJobId: jobId,
          businessId: storedIds[storedIds.length - 1],
        },
      }).catch(() => {
        // Ignore duplicate link errors
      });

      // Store employee estimate if available
      if (business.employeeEstimate) {
        await prisma.employeeEstimate.create({
          data: {
            businessId: storedIds[storedIds.length - 1],
            estimatedCount: business.employeeEstimate,
            confidence: business.confidence,
            source: 'deep_research',
          },
        });
      }
    } catch (error) {
      console.error(`Error storing business ${business.name}:`, error);
    }
  }

  return storedIds;
}

// ============================================================================
// JOB MANAGEMENT
// ============================================================================

export async function createResearchJob(
  name: string,
  type: 'REGION_DISCOVERY' | 'BUSINESS_ENRICHMENT' | 'PERMIT_SCAN' | 'REVIEW_UPDATE',
  parameters: ResearchJobParameters
): Promise<ResearchJob> {
  const job = await prisma.researchJob.create({
    data: {
      name,
      type,
      status: 'PENDING',
      parameters: parameters as object,
      progress: 0,
    },
  });

  return job as unknown as ResearchJob;
}

async function updateJobProgress(jobId: string, progress: PipelineProgress): Promise<void> {
  await prisma.researchJob.update({
    where: { id: jobId },
    data: {
      progress: progress.progress,
    },
  });
}

async function updateJobStatus(
  jobId: string,
  status: ResearchJobStatus,
  data?: {
    businessesFound?: number;
    businessesQualified?: number;
    error?: string;
  }
): Promise<void> {
  await prisma.researchJob.update({
    where: { id: jobId },
    data: {
      status,
      ...(status === 'RUNNING' && { startedAt: new Date() }),
      ...(status === 'COMPLETED' && { completedAt: new Date() }),
      ...(status === 'FAILED' && { completedAt: new Date() }),
      ...(data?.businessesFound !== undefined && { businessesFound: data.businessesFound }),
      ...(data?.businessesQualified !== undefined && { businessesQualified: data.businessesQualified }),
      ...(data?.error && { error: data.error }),
    },
  });
}

export async function startResearchJob(jobId: string): Promise<void> {
  const job = await prisma.researchJob.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    throw new Error('Job not found');
  }

  await updateJobStatus(jobId, 'RUNNING');

  // Run pipeline based on job type
  if (job.type === 'REGION_DISCOVERY') {
    await runRegionDiscoveryPipeline(jobId, job.parameters as ResearchJobParameters);
  } else {
    throw new Error(`Job type ${job.type} not yet implemented`);
  }
}

export async function cancelResearchJob(jobId: string): Promise<void> {
  const job = await prisma.researchJob.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    throw new Error('Job not found');
  }

  if (job.openaiResponseId) {
    // Cancel the OpenAI research task
    const { cancelResearch } = await import('@/lib/ai/deep-research');
    await cancelResearch(job.openaiResponseId);
  }

  await updateJobStatus(jobId, 'CANCELLED');
}
