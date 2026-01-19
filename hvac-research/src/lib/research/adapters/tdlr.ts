// TDLR (Texas Department of Licensing and Regulation) Adapter
// Handles license lookup and verification for HVAC contractors

import type { License, LicenseStatus } from '@/types';

// TDLR License Types for HVAC
export const TDLR_LICENSE_TYPES = {
  ACR: 'Air Conditioning and Refrigeration Contractor',
  ACB: 'Air Conditioning and Refrigeration Technician',
  ACRM: 'Air Conditioning and Refrigeration Maintenance',
} as const;

export type TDLRLicenseType = keyof typeof TDLR_LICENSE_TYPES;

export interface TDLRSearchParams {
  licenseNumber?: string;
  businessName?: string;
  city?: string;
  county?: string;
  licenseType?: TDLRLicenseType;
}

export interface TDLRLicenseRecord {
  licenseNumber: string;
  licenseType: TDLRLicenseType;
  status: LicenseStatus;
  businessName: string;
  ownerName?: string;
  address?: string;
  city?: string;
  state: string;
  zipCode?: string;
  phone?: string;
  issueDate?: string;
  expirationDate?: string;
}

/**
 * Search TDLR records using AI-assisted web research
 * Note: Direct API access to TDLR is not available; this uses deep research
 */
export async function searchTDLRRecords(
  params: TDLRSearchParams
): Promise<TDLRLicenseRecord[]> {
  // Build search prompt for deep research
  const { startDeepResearch, waitForResearchCompletion } = await import('@/lib/ai/deep-research');
  const { extractBusinessData } = await import('@/lib/ai/openai');

  const searchCriteria = [];
  if (params.licenseNumber) searchCriteria.push(`License number: ${params.licenseNumber}`);
  if (params.businessName) searchCriteria.push(`Business name: ${params.businessName}`);
  if (params.city) searchCriteria.push(`City: ${params.city}`);
  if (params.county) searchCriteria.push(`County: ${params.county}`);
  if (params.licenseType) searchCriteria.push(`License type: ${params.licenseType}`);

  const prompt = `Search Texas TDLR (Department of Licensing and Regulation) records for HVAC contractor licenses.

Search criteria:
${searchCriteria.join('\n')}

For each license found, provide:
- License number
- License type (ACR, ACB, or ACRM)
- Status (Active, Expired, Suspended, Revoked)
- Business name
- Owner name if available
- Address, city, zip
- Phone number
- Issue date and expiration date

Note: TDLR license lookup is available at https://www.tdlr.texas.gov/LicenseSearch/

Provide results in a structured format.`;

  const result = await startDeepResearch(prompt, { maxToolCalls: 20 });

  if (result.status === 'failed') {
    console.error('TDLR search failed:', result.error);
    return [];
  }

  // Wait for completion if background
  const finalResult =
    result.status === 'pending'
      ? await waitForResearchCompletion(result.id, { maxWaitMs: 10 * 60 * 1000 })
      : result;

  if (!finalResult.output) {
    return [];
  }

  // Parse the results
  return parseTDLRResults(finalResult.output);
}

/**
 * Verify a specific license number
 */
export async function verifyLicense(
  licenseNumber: string
): Promise<TDLRLicenseRecord | null> {
  const results = await searchTDLRRecords({ licenseNumber });
  return results.length > 0 ? results[0] : null;
}

/**
 * Parse TDLR research results into structured records
 */
function parseTDLRResults(output: string): TDLRLicenseRecord[] {
  const records: TDLRLicenseRecord[] = [];

  // Use regex to extract license information
  const licensePattern =
    /(?:License|Lic\.?\s*#?:?\s*)(\w{2,4}[-\s]?\d{4,10})/gi;
  const matches = output.matchAll(licensePattern);

  for (const match of matches) {
    const licenseNumber = match[1].replace(/\s+/g, '');

    // Determine license type
    let licenseType: TDLRLicenseType = 'ACR';
    if (licenseNumber.startsWith('ACB')) licenseType = 'ACB';
    if (licenseNumber.startsWith('ACRM')) licenseType = 'ACRM';

    // Determine status from context
    const contextStart = Math.max(0, match.index! - 200);
    const contextEnd = Math.min(output.length, match.index! + 200);
    const context = output.slice(contextStart, contextEnd).toLowerCase();

    let status: LicenseStatus = 'ACTIVE';
    if (context.includes('expired')) status = 'EXPIRED';
    if (context.includes('suspended')) status = 'SUSPENDED';
    if (context.includes('revoked')) status = 'REVOKED';
    if (context.includes('pending')) status = 'PENDING';

    // Extract business name (simplified - would need better parsing)
    const businessNameMatch = context.match(/(?:business|company|name):\s*([^,\n]+)/i);
    const businessName = businessNameMatch ? businessNameMatch[1].trim() : 'Unknown';

    records.push({
      licenseNumber,
      licenseType,
      status,
      businessName,
      state: 'TX',
    });
  }

  return records;
}

/**
 * Convert TDLR record to database License format
 */
export function tdlrRecordToLicense(
  record: TDLRLicenseRecord,
  businessId: string
): Omit<License, 'id'> {
  return {
    businessId,
    licenseNumber: record.licenseNumber,
    licenseType: record.licenseType,
    status: record.status,
    issueDate: record.issueDate ? new Date(record.issueDate) : undefined,
    expirationDate: record.expirationDate ? new Date(record.expirationDate) : undefined,
    tdlrRecordId: record.licenseNumber,
  };
}
