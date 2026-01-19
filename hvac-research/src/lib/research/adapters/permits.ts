// County Permit Records Adapter
// Handles permit data collection from Texas county records

import type { Permit } from '@/types';

// Major Texas counties and their permit systems
export const TEXAS_COUNTIES_PERMIT_INFO = {
  Harris: {
    name: 'Harris County',
    city: 'Houston',
    permitPortalUrl: 'https://permits.harriscountytx.gov/',
    notes: 'Largest county, extensive online records',
  },
  Dallas: {
    name: 'Dallas County',
    city: 'Dallas',
    permitPortalUrl: 'https://www.dallascounty.org/',
    notes: 'Multiple cities with separate systems',
  },
  Tarrant: {
    name: 'Tarrant County',
    city: 'Fort Worth',
    permitPortalUrl: 'https://www.tarrantcounty.com/',
    notes: 'Fort Worth and Arlington have separate systems',
  },
  Bexar: {
    name: 'Bexar County',
    city: 'San Antonio',
    permitPortalUrl: 'https://www.bexar.org/',
    notes: 'San Antonio dominates',
  },
  Travis: {
    name: 'Travis County',
    city: 'Austin',
    permitPortalUrl: 'https://www.traviscountytx.gov/',
    notes: 'Austin Building Services handles most',
  },
} as const;

export type SupportedCounty = keyof typeof TEXAS_COUNTIES_PERMIT_INFO;

export interface PermitSearchParams {
  county: SupportedCounty;
  contractorName?: string;
  licenseNumber?: string;
  startDate?: Date;
  endDate?: Date;
  permitType?: 'residential' | 'commercial' | 'all';
}

export interface PermitRecord {
  permitNumber: string;
  permitType: string;
  description: string;
  status: string;
  issueDate: string;
  completedDate?: string;
  projectAddress: string;
  projectCity: string;
  projectValue?: number;
  contractorName: string;
  contractorLicense?: string;
  county: string;
  sourceUrl?: string;
}

export interface PermitSummary {
  totalPermits: number;
  last12Months: number;
  last3Years: number;
  byType: Record<string, number>;
  byYear: Record<string, number>;
  averageValue?: number;
  trend: 'growing' | 'stable' | 'declining';
}

/**
 * Search permit records for a contractor using AI research
 */
export async function searchPermitRecords(
  params: PermitSearchParams
): Promise<PermitRecord[]> {
  const { startDeepResearch, waitForResearchCompletion } = await import('@/lib/ai/deep-research');

  const countyInfo = TEXAS_COUNTIES_PERMIT_INFO[params.county];
  const dateRange = params.startDate && params.endDate
    ? `from ${params.startDate.toISOString().split('T')[0]} to ${params.endDate.toISOString().split('T')[0]}`
    : 'from the last 3 years';

  const prompt = `Research HVAC permit records in ${countyInfo.name}, Texas ${dateRange}.

Search for permits pulled by: ${params.contractorName || 'HVAC contractors'}
${params.licenseNumber ? `TDLR License: ${params.licenseNumber}` : ''}
Permit type focus: ${params.permitType || 'all HVAC-related'}

County permit portal: ${countyInfo.permitPortalUrl}

For each permit found, collect:
- Permit number
- Permit type (HVAC, Mechanical, AC Replacement, etc.)
- Project description
- Status (Issued, Final, Expired)
- Issue date
- Project address and city
- Project value if available
- Contractor name as listed

Also provide summary statistics:
- Total permits found
- Permits by year
- Permits by type (residential vs commercial)
- Average project value range
- Growth trend analysis

Structure the output clearly with individual permits followed by summary.`;

  const result = await startDeepResearch(prompt, { maxToolCalls: 30 });

  if (result.status === 'failed') {
    console.error('Permit search failed:', result.error);
    return [];
  }

  const finalResult =
    result.status === 'pending'
      ? await waitForResearchCompletion(result.id, { maxWaitMs: 15 * 60 * 1000 })
      : result;

  if (!finalResult.output) {
    return [];
  }

  return parsePermitResults(finalResult.output, params.county);
}

/**
 * Get permit activity summary for a contractor
 */
export async function getPermitSummary(
  contractorName: string,
  county: SupportedCounty
): Promise<PermitSummary> {
  const permits = await searchPermitRecords({
    county,
    contractorName,
    startDate: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000), // 3 years ago
  });

  const now = new Date();
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  const last12Months = permits.filter(
    (p) => new Date(p.issueDate) >= oneYearAgo
  ).length;

  const byType: Record<string, number> = {};
  const byYear: Record<string, number> = {};
  let totalValue = 0;
  let valueCount = 0;

  for (const permit of permits) {
    // By type
    const type = categorizePermitType(permit.permitType);
    byType[type] = (byType[type] || 0) + 1;

    // By year
    const year = new Date(permit.issueDate).getFullYear().toString();
    byYear[year] = (byYear[year] || 0) + 1;

    // Value
    if (permit.projectValue) {
      totalValue += permit.projectValue;
      valueCount++;
    }
  }

  // Determine trend
  const years = Object.keys(byYear).sort();
  let trend: 'growing' | 'stable' | 'declining' = 'stable';

  if (years.length >= 2) {
    const recent = byYear[years[years.length - 1]] || 0;
    const previous = byYear[years[years.length - 2]] || 0;

    if (recent > previous * 1.1) trend = 'growing';
    else if (recent < previous * 0.9) trend = 'declining';
  }

  return {
    totalPermits: permits.length,
    last12Months,
    last3Years: permits.length,
    byType,
    byYear,
    averageValue: valueCount > 0 ? totalValue / valueCount : undefined,
    trend,
  };
}

/**
 * Estimate revenue from permit data
 */
export function estimateRevenueFromPermits(summary: PermitSummary): {
  low: number;
  high: number;
  mid: number;
  confidence: number;
} {
  const annualPermits = summary.last12Months || summary.totalPermits / 3;

  // Revenue estimation factors
  const residentialCount = summary.byType['residential'] || 0;
  const commercialCount = summary.byType['commercial'] || 0;
  const totalCategorized = residentialCount + commercialCount || 1;

  const residentialRatio = residentialCount / totalCategorized;
  const commercialRatio = commercialCount / totalCategorized;

  // Average job values (conservative estimates)
  const residentialAvg = 8000; // $8K average for residential HVAC
  const commercialAvg = 35000; // $35K average for commercial HVAC

  const estimatedRevenue =
    annualPermits * residentialRatio * residentialAvg +
    annualPermits * commercialRatio * commercialAvg;

  // Permits typically represent 30-60% of actual revenue (maintenance not captured)
  const low = Math.round(estimatedRevenue * 1.4);
  const high = Math.round(estimatedRevenue * 2.5);
  const mid = Math.round((low + high) / 2);

  // Confidence based on data quality
  let confidence = 0.5;
  if (summary.totalPermits >= 50) confidence += 0.2;
  if (summary.averageValue) confidence += 0.1;
  if (Object.keys(summary.byYear).length >= 2) confidence += 0.1;

  return { low, high, mid, confidence: Math.min(confidence, 0.9) };
}

/**
 * Parse permit research output
 */
function parsePermitResults(output: string, county: string): PermitRecord[] {
  const records: PermitRecord[] = [];

  // Pattern to find permit numbers
  const permitPattern = /(?:Permit|#)\s*:?\s*([A-Z0-9-]{5,20})/gi;
  const lines = output.split('\n');

  let currentPermit: Partial<PermitRecord> | null = null;

  for (const line of lines) {
    const permitMatch = line.match(permitPattern);
    if (permitMatch) {
      if (currentPermit && currentPermit.permitNumber) {
        records.push({
          permitNumber: currentPermit.permitNumber,
          permitType: currentPermit.permitType || 'HVAC',
          description: currentPermit.description || '',
          status: currentPermit.status || 'Unknown',
          issueDate: currentPermit.issueDate || new Date().toISOString(),
          projectAddress: currentPermit.projectAddress || '',
          projectCity: currentPermit.projectCity || '',
          contractorName: currentPermit.contractorName || '',
          county,
          projectValue: currentPermit.projectValue,
        });
      }
      currentPermit = { permitNumber: permitMatch[1] };
    }

    if (currentPermit) {
      // Extract additional fields
      if (line.toLowerCase().includes('type:')) {
        currentPermit.permitType = line.split(':')[1]?.trim();
      }
      if (line.toLowerCase().includes('address:')) {
        currentPermit.projectAddress = line.split(':').slice(1).join(':').trim();
      }
      if (line.toLowerCase().includes('contractor:')) {
        currentPermit.contractorName = line.split(':')[1]?.trim();
      }
      if (line.toLowerCase().includes('value:') || line.includes('$')) {
        const valueMatch = line.match(/\$?([\d,]+)/);
        if (valueMatch) {
          currentPermit.projectValue = parseInt(valueMatch[1].replace(/,/g, ''));
        }
      }
    }
  }

  return records;
}

/**
 * Categorize permit type
 */
function categorizePermitType(type: string): string {
  const lower = type.toLowerCase();

  if (lower.includes('commercial') || lower.includes('business')) {
    return 'commercial';
  }
  if (
    lower.includes('residential') ||
    lower.includes('home') ||
    lower.includes('dwelling')
  ) {
    return 'residential';
  }
  if (lower.includes('industrial')) {
    return 'industrial';
  }

  return 'other';
}

/**
 * Convert permit record to database format
 */
export function permitRecordToDatabase(
  record: PermitRecord,
  businessId: string
): Omit<Permit, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    businessId,
    permitNumber: record.permitNumber,
    permitType: categorizePermitType(record.permitType),
    description: record.description,
    status: record.status,
    issueDate: record.issueDate ? new Date(record.issueDate) : undefined,
    completedDate: record.completedDate ? new Date(record.completedDate) : undefined,
    projectAddress: record.projectAddress,
    projectCity: record.projectCity,
    projectValue: record.projectValue,
    county: record.county,
    sourceUrl: record.sourceUrl,
  };
}
