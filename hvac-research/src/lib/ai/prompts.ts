// HVAC Research Prompt Templates
// Optimized prompts for discovering underrated HVAC businesses

export const TEXAS_COUNTIES = {
  HOUSTON_METRO: ['Harris', 'Fort Bend', 'Montgomery', 'Brazoria', 'Galveston'],
  DFW_METROPLEX: ['Dallas', 'Tarrant', 'Collin', 'Denton', 'Rockwall'],
  SAN_ANTONIO: ['Bexar', 'Comal', 'Guadalupe'],
  AUSTIN: ['Travis', 'Williamson', 'Hays'],
  OTHER_MAJOR: ['El Paso', 'Hidalgo', 'Nueces', 'Lubbock', 'Cameron'],
} as const;

export const PROMPT_TEMPLATES = {
  /**
   * Region Discovery - Find HVAC businesses in a specific region
   */
  regionDiscovery: (params: {
    county: string;
    city?: string;
    focus?: 'residential' | 'commercial' | 'industrial' | 'all';
  }) => {
    const location = params.city
      ? `${params.city}, ${params.county} County, Texas`
      : `${params.county} County, Texas`;

    const focusDesc =
      params.focus === 'all' || !params.focus
        ? 'all types of HVAC services'
        : `${params.focus} HVAC services specifically`;

    return `# HVAC Business Discovery: ${location}

## Objective
Find and document HVAC companies in ${location} that could be acquisition targets for a consolidator seeking ${focusDesc}.

## Target Business Profile
- **Revenue**: $1M - $10M annually (estimate from indicators)
- **Ownership**: Family-owned, independent operators, or single-owner businesses
- **Age**: Established 10+ years (built reputation and customer base)
- **Online**: Weak or outdated digital presence (opportunity to improve)
- **Operations**: Solid technical reputation despite limited marketing

## Research Sources to Check
1. **Official Records**
   - Texas TDLR (Department of Licensing and Regulation) - ACR/ACB licenses
   - ${params.county} County permit records
   - Texas Secretary of State business filings

2. **Business Directories**
   - Better Business Bureau
   - Local Chamber of Commerce
   - Yellow Pages / Superpages
   - Industry associations (ACCA, PHCC, RSES)

3. **Online Presence**
   - Google Maps / Google Business profiles
   - Yelp business listings
   - Facebook business pages
   - Company websites

4. **Trade Resources**
   - HVACR Business magazine features
   - Local trade show exhibitor lists
   - Manufacturer dealer locators (Carrier, Trane, Lennox, etc.)

## Data to Collect Per Business
| Field | Priority | Notes |
|-------|----------|-------|
| Business Name | Required | Include any DBA names |
| Address | Required | Full street address |
| City | Required | |
| County | Required | Verify it's in ${params.county} |
| Phone | Required | Primary contact |
| Website | Important | Note if missing or outdated |
| Founded Year | Important | |
| Owner Name | Important | Research LinkedIn, BBB |
| Employee Count | Important | Estimate from fleet, jobs |
| Specializations | Important | Residential/Commercial/Industrial |
| TDLR License | Important | License number and status |
| Google Rating | Helpful | Rating and review count |
| Yelp Rating | Helpful | Rating and review count |
| Fleet Size | Helpful | Vehicle count estimate |
| Certifications | Helpful | NATE, EPA 608, manufacturer |

## Output Format
For each business, provide a structured entry:

---
**[Business Name]**
- Location: [City, ${params.county} County]
- Address: [Full address]
- Phone: [Number]
- Website: [URL or "None"]
- Founded: [Year] | Owner: [Name or "Unknown"]
- Employees: [Estimate] | Fleet: [Estimate]
- Specializations: [List]
- TDLR License: [Number if found]
- Google: [Rating] ([Count] reviews) | Yelp: [Rating] ([Count] reviews)
- Acquisition Notes: [Brief assessment of fit]
---

## Priority Criteria
Rank businesses higher if they show:
1. Long operating history with limited web presence
2. Strong permit activity suggesting steady work
3. Family name in business name
4. Specialized niche (refrigeration, restaurants, clean rooms)
5. Active license but minimal online reviews
6. Multiple service vehicles (3-15 range)

Focus on QUALITY over QUANTITY. It's better to find 10 well-documented prospects than 50 with missing data.`;
  },

  /**
   * Business Enrichment - Deep research on a specific business
   */
  businessEnrichment: (params: {
    businessName: string;
    city: string;
    county: string;
    existingData?: Record<string, unknown>;
  }) => {
    return `# Deep Research: ${params.businessName}

## Objective
Gather comprehensive information about ${params.businessName} in ${params.city}, ${params.county} County, Texas for acquisition evaluation.

## Known Information
${params.existingData ? JSON.stringify(params.existingData, null, 2) : 'Limited initial data available'}

## Research Tasks

### 1. Business Fundamentals
- Verify current business status and address
- Find founding year and business history
- Identify current owner(s) and their background
- Determine company structure (LLC, Corp, Partnership)

### 2. Operational Assessment
- Estimate employee count (check LinkedIn, job postings)
- Estimate fleet size (Google Street View, social media)
- Identify service area coverage
- Find specializations and major service types

### 3. Licensing & Compliance
- TDLR license status and history
- EPA 608 certifications
- NATE or other technician certifications
- Manufacturer certifications/dealerships

### 4. Market Position
- Google Business profile and reviews
- Yelp reviews and ratings
- BBB accreditation and complaints
- Angi/HomeAdvisor presence

### 5. Digital Presence Assessment
- Website quality and age (use Wayback Machine)
- Social media activity
- Paid advertising presence
- SEO/search visibility

### 6. Acquisition Indicators
- Owner age if discoverable
- Any succession planning signals
- Recent news or announcements
- Growth or decline indicators

## Output
Provide a comprehensive profile with confidence ratings (High/Medium/Low) for each data point.`;
  },

  /**
   * Permit Analysis - Analyze permit activity for revenue estimation
   */
  permitAnalysis: (params: {
    businessName: string;
    county: string;
    licenseNumber?: string;
  }) => {
    return `# Permit Activity Analysis: ${params.businessName}

## Objective
Research permit records in ${params.county} County to estimate the business activity level and revenue potential for ${params.businessName}.

${params.licenseNumber ? `TDLR License: ${params.licenseNumber}` : ''}

## Data to Find
1. **Permit Volume**
   - Total permits in last 12 months
   - Total permits in last 3 years
   - Trend direction (growing/stable/declining)

2. **Permit Types**
   - New installation vs replacement
   - Residential vs commercial
   - Permit values if available

3. **Geographic Coverage**
   - Cities/areas where permits pulled
   - Service area estimation

4. **Seasonal Patterns**
   - Peak activity months
   - Off-season activity level

## Revenue Estimation Guidelines
- Residential replacement: $5K-15K average
- Residential new construction: $8K-20K average
- Commercial projects: $20K-200K+ range
- Maintenance contracts not reflected in permits

## Output
Provide:
1. Permit counts and trends
2. Revenue range estimate with methodology
3. Confidence level
4. Comparison to similar businesses if possible`;
  },

  /**
   * Competitive Landscape - Analyze market in a region
   */
  competitiveLandscape: (params: { county: string; city?: string }) => {
    const location = params.city
      ? `${params.city}, ${params.county} County`
      : `${params.county} County`;

    return `# HVAC Competitive Landscape: ${location}, Texas

## Objective
Map the HVAC competitive landscape in ${location} to identify market dynamics and potential acquisition targets.

## Research Areas

### 1. Market Leaders
- Identify the 5-10 largest HVAC companies
- Note any PE-backed consolidators already in market
- Franchise operations (One Hour, Aire Serv, etc.)

### 2. Mid-Market Players
- Companies in $2M-$10M range
- Family-owned operations
- Second/third generation businesses

### 3. Specialists
- Commercial-only contractors
- Industrial/refrigeration specialists
- Niche market players

### 4. Market Dynamics
- Overall market size estimate
- Growth trends
- Consolidation activity
- Pricing environment

### 5. Acquisition Targets
Based on research, identify top 5 potential acquisition targets with rationale.

## Output Format
Provide a market map with:
1. Competitive tiers (large, mid, small)
2. Market share estimates
3. Strategic positioning
4. Specific acquisition recommendations`;
  },
} as const;

export type PromptType = keyof typeof PROMPT_TEMPLATES;

export function getPrompt(
  type: PromptType,
  params: Parameters<(typeof PROMPT_TEMPLATES)[PromptType]>[0]
): string {
  // @ts-expect-error - TypeScript can't narrow the params type correctly
  return PROMPT_TEMPLATES[type](params);
}
