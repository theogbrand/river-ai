// OpenAI GPT-4.1 Client
// Used for prompt rewriting, data extraction, and validation

import OpenAI from 'openai';
import { z } from 'zod';
import type { ExtractedBusinessData } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================================================
// SCHEMAS
// ============================================================================

const ExtractedBusinessSchema = z.object({
  name: z.string(),
  city: z.string(),
  county: z.string(),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  email: z.string().optional(),
  specializations: z.array(z.string()).optional(),
  niches: z.array(z.string()).optional(),
  ownerName: z.string().optional(),
  foundedYear: z.number().optional(),
  employeeEstimate: z.number().optional(),
  fleetEstimate: z.number().optional(),
  reviewCount: z.number().optional(),
  averageRating: z.number().optional(),
  licenseNumber: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

const BusinessListSchema = z.object({
  businesses: z.array(ExtractedBusinessSchema),
  totalFound: z.number(),
  notes: z.string().optional(),
});

// ============================================================================
// PROMPT REWRITING
// ============================================================================

/**
 * Improve and clarify a research prompt using GPT-4.1
 */
export async function rewritePrompt(
  originalPrompt: string,
  context?: string
): Promise<string> {
  const systemPrompt = `You are an expert at crafting precise, effective research prompts for AI research systems.
Your task is to take a user's research request and rewrite it to be:
1. More specific and actionable
2. Clearer about expected output format
3. Include relevant context that helps the research agent
4. Eliminate ambiguity

Keep the core intent but improve clarity and structure. Output ONLY the rewritten prompt, nothing else.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: context
          ? `Context: ${context}\n\nOriginal prompt: ${originalPrompt}`
          : originalPrompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  return response.choices[0]?.message?.content || originalPrompt;
}

// ============================================================================
// DATA EXTRACTION
// ============================================================================

/**
 * Extract structured business data from unstructured research output
 */
export async function extractBusinessData(
  researchOutput: string
): Promise<ExtractedBusinessData[]> {
  const systemPrompt = `You are a data extraction specialist. Extract structured business information from the provided research output.

For each business found, extract:
- name: Business name (required)
- city: City location (required)
- county: Texas county (required, infer if possible)
- address: Full street address
- phone: Phone number
- website: Website URL
- email: Email address
- specializations: Array of specializations (residential, commercial, industrial)
- niches: Specific niches (refrigeration, clean rooms, restaurants, etc.)
- ownerName: Owner's name if mentioned
- foundedYear: Year founded as a number
- employeeEstimate: Estimated employee count
- fleetEstimate: Estimated fleet/vehicle count
- reviewCount: Total reviews across platforms
- averageRating: Average rating (1-5 scale)
- licenseNumber: TDLR license number
- confidence: Your confidence in the data accuracy (0-1)

Output valid JSON with this structure:
{
  "businesses": [...],
  "totalFound": number,
  "notes": "any relevant notes about data quality"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: researchOutput },
    ],
    temperature: 0,
    max_tokens: 8000,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return [];
  }

  try {
    const parsed = JSON.parse(content);
    const validated = BusinessListSchema.safeParse(parsed);

    if (validated.success) {
      return validated.data.businesses as ExtractedBusinessData[];
    } else {
      console.error('Validation error:', validated.error);
      return [];
    }
  } catch (error) {
    console.error('JSON parse error:', error);
    return [];
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate and enhance business data
 */
export async function validateBusinessData(
  business: ExtractedBusinessData
): Promise<{
  isValid: boolean;
  issues: string[];
  suggestions: Record<string, unknown>;
}> {
  const systemPrompt = `You are validating HVAC business data for accuracy and completeness.

Check for:
1. Valid Texas location (city must be in Texas)
2. Reasonable business data (employee count, founding year, etc.)
3. Consistent information
4. Missing critical fields

Output JSON:
{
  "isValid": boolean,
  "issues": ["list of issues found"],
  "suggestions": { "field": "suggested correction" }
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(business, null, 2) },
    ],
    temperature: 0,
    max_tokens: 500,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return { isValid: true, issues: [], suggestions: {} };
  }

  try {
    return JSON.parse(content);
  } catch {
    return { isValid: true, issues: [], suggestions: {} };
  }
}

// ============================================================================
// SCORING ASSISTANCE
// ============================================================================

/**
 * Use AI to help score acquisition fit based on qualitative data
 */
export async function assessAcquisitionFit(
  businessData: ExtractedBusinessData,
  additionalContext?: string
): Promise<{
  score: number;
  factors: Array<{ name: string; score: number; explanation: string }>;
  summary: string;
}> {
  const systemPrompt = `You are an M&A analyst specializing in small business acquisitions, particularly HVAC service companies.

Evaluate the business for acquisition fit based on:
1. Family ownership indicators (preferred: family-owned, 2nd/3rd generation)
2. Owner age/succession status (preferred: owner retiring, no successor)
3. Niche specialization (preferred: specialized in specific market)
4. Years in business (preferred: 10-30 years, established reputation)
5. Size fit (preferred: $1M-$10M revenue range based on indicators)

Output JSON:
{
  "score": 0-100 overall score,
  "factors": [
    { "name": "factor name", "score": 0-100, "explanation": "brief explanation" }
  ],
  "summary": "1-2 sentence summary of acquisition fit"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: additionalContext
          ? `Business data:\n${JSON.stringify(businessData, null, 2)}\n\nAdditional context:\n${additionalContext}`
          : JSON.stringify(businessData, null, 2),
      },
    ],
    temperature: 0.2,
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return {
      score: 50,
      factors: [],
      summary: 'Unable to assess acquisition fit',
    };
  }

  try {
    return JSON.parse(content);
  } catch {
    return {
      score: 50,
      factors: [],
      summary: 'Unable to assess acquisition fit',
    };
  }
}

/**
 * Assess online presence weakness
 */
export async function assessOnlinePresence(
  websiteUrl: string | null,
  socialMediaUrls: string[],
  reviewData: { source: string; count: number; rating: number }[]
): Promise<{
  weaknessScore: number;
  factors: Array<{ name: string; score: number; explanation: string }>;
  summary: string;
}> {
  const systemPrompt = `You are a digital marketing analyst. Assess the WEAKNESS of a business's online presence.
Higher scores mean WEAKER online presence (more opportunity for improvement after acquisition).

Evaluate:
1. Website quality (no website = 100, outdated = 80, template = 60, professional = 20)
2. Social media presence (none = 100, inactive = 70, active = 20)
3. Review volume (low reviews = high score, many reviews = low score)
4. Review quality (poor ratings might indicate operational issues, not just online weakness)

Output JSON:
{
  "weaknessScore": 0-100 (higher = weaker online presence),
  "factors": [
    { "name": "factor name", "score": 0-100, "explanation": "brief explanation" }
  ],
  "summary": "1-2 sentence summary"
}`;

  const input = {
    website: websiteUrl || 'None',
    socialMedia: socialMediaUrls.length > 0 ? socialMediaUrls : ['None'],
    reviews: reviewData.length > 0 ? reviewData : [{ source: 'None', count: 0, rating: 0 }],
  };

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(input, null, 2) },
    ],
    temperature: 0.2,
    max_tokens: 800,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return {
      weaknessScore: 50,
      factors: [],
      summary: 'Unable to assess online presence',
    };
  }

  try {
    return JSON.parse(content);
  } catch {
    return {
      weaknessScore: 50,
      factors: [],
      summary: 'Unable to assess online presence',
    };
  }
}

export default {
  rewritePrompt,
  extractBusinessData,
  validateBusinessData,
  assessAcquisitionFit,
  assessOnlinePresence,
};
