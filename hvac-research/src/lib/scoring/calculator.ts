// Scoring Engine
// Calculates acquisition fit scores based on multiple weighted factors

import { prisma } from '@/lib/db';
import type {
  BusinessWithRelations,
  Score,
  ScoreBreakdown,
  ScoreFactor,
  Recommendation,
  ScoringConfig,
} from '@/types';

// ============================================================================
// DEFAULT SCORING CONFIGURATION
// ============================================================================

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  version: '1.0',
  weights: {
    revenueProxy: 0.30,      // 30% - Is revenue in target range?
    onlineWeakness: 0.25,    // 25% - Opportunity to improve presence?
    acquisitionFit: 0.25,    // 25% - Family-owned, succession ready?
    growthSignals: 0.20,     // 20% - Growing or stable business?
  },
  thresholds: {
    highPriority: 75,
    mediumPriority: 50,
    lowPriority: 25,
  },
  factors: {
    revenueProxy: [
      { name: 'employeeCount', weight: 0.30, scorer: 'employeeScorer' },
      { name: 'fleetSize', weight: 0.25, scorer: 'fleetScorer' },
      { name: 'permitVolume', weight: 0.25, scorer: 'permitScorer' },
      { name: 'serviceArea', weight: 0.20, scorer: 'serviceAreaScorer' },
    ],
    onlineWeakness: [
      { name: 'websiteQuality', weight: 0.30, scorer: 'websiteScorer' },
      { name: 'socialPresence', weight: 0.20, scorer: 'socialScorer' },
      { name: 'reviewVolume', weight: 0.30, scorer: 'reviewVolumeScorer' },
      { name: 'seoVisibility', weight: 0.20, scorer: 'seoScorer' },
    ],
    acquisitionFit: [
      { name: 'ownershipType', weight: 0.30, scorer: 'ownershipScorer' },
      { name: 'businessAge', weight: 0.25, scorer: 'ageScorer' },
      { name: 'nicheSpecialization', weight: 0.25, scorer: 'nicheScorer' },
      { name: 'successionStatus', weight: 0.20, scorer: 'successionScorer' },
    ],
    growthSignals: [
      { name: 'permitTrend', weight: 0.35, scorer: 'permitTrendScorer' },
      { name: 'reviewTrend', weight: 0.25, scorer: 'reviewTrendScorer' },
      { name: 'hiringActivity', weight: 0.25, scorer: 'hiringScorer' },
      { name: 'fleetGrowth', weight: 0.15, scorer: 'fleetGrowthScorer' },
    ],
  },
};

// ============================================================================
// MAIN SCORING FUNCTION
// ============================================================================

/**
 * Calculate complete score for a business
 */
export async function calculateBusinessScore(
  businessId: string,
  config: ScoringConfig = DEFAULT_SCORING_CONFIG
): Promise<Score> {
  // Fetch business with all relations
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      licenses: true,
      permits: true,
      reviews: true,
      employees: true,
      fleet: true,
      certifications: true,
      associations: true,
    },
  }) as BusinessWithRelations | null;

  if (!business) {
    throw new Error(`Business not found: ${businessId}`);
  }

  // Calculate each component score
  const revenueProxyScore = calculateRevenueProxyScore(business, config);
  const onlineWeaknessScore = calculateOnlineWeaknessScore(business, config);
  const acquisitionFitScore = calculateAcquisitionFitScore(business, config);
  const growthSignalsScore = calculateGrowthSignalsScore(business, config);

  // Calculate weighted overall score
  const overallScore = Math.round(
    revenueProxyScore.score * config.weights.revenueProxy +
    onlineWeaknessScore.score * config.weights.onlineWeakness +
    acquisitionFitScore.score * config.weights.acquisitionFit +
    growthSignalsScore.score * config.weights.growthSignals
  );

  // Determine recommendation
  const recommendation = getRecommendation(overallScore, config);

  // Build breakdown
  const breakdown: ScoreBreakdown = {
    revenueProxy: revenueProxyScore,
    onlineWeakness: onlineWeaknessScore,
    acquisitionFit: acquisitionFitScore,
    growthSignals: growthSignalsScore,
  };

  // Store score in database
  const score = await prisma.score.upsert({
    where: {
      id: `${businessId}_latest`,
    },
    create: {
      id: `${businessId}_latest`,
      businessId,
      revenueProxyScore: revenueProxyScore.score,
      onlineWeaknessScore: onlineWeaknessScore.score,
      acquisitionFitScore: acquisitionFitScore.score,
      growthSignalsScore: growthSignalsScore.score,
      overallScore,
      recommendation,
      breakdown: breakdown as object,
      configVersion: config.version,
    },
    update: {
      revenueProxyScore: revenueProxyScore.score,
      onlineWeaknessScore: onlineWeaknessScore.score,
      acquisitionFitScore: acquisitionFitScore.score,
      growthSignalsScore: growthSignalsScore.score,
      overallScore,
      recommendation,
      breakdown: breakdown as object,
      configVersion: config.version,
      updatedAt: new Date(),
    },
  });

  return score as unknown as Score;
}

/**
 * Batch score multiple businesses
 */
export async function batchScoreBusinesses(
  businessIds: string[],
  config: ScoringConfig = DEFAULT_SCORING_CONFIG
): Promise<Score[]> {
  const scores: Score[] = [];

  for (const id of businessIds) {
    try {
      const score = await calculateBusinessScore(id, config);
      scores.push(score);
    } catch (error) {
      console.error(`Failed to score business ${id}:`, error);
    }
  }

  return scores;
}

// ============================================================================
// COMPONENT SCORERS
// ============================================================================

interface ComponentScore {
  score: number;
  factors: ScoreFactor[];
}

/**
 * Revenue Proxy Score
 * Estimates if business is in $1M-$10M revenue range
 */
function calculateRevenueProxyScore(
  business: BusinessWithRelations,
  config: ScoringConfig
): ComponentScore {
  const factors: ScoreFactor[] = [];

  // Employee count (5-50 ideal)
  const employees = business.employees?.[0];
  const employeeCount = employees?.estimatedCount || 0;
  let employeeScore = 0;

  if (employeeCount >= 5 && employeeCount <= 50) {
    employeeScore = 100 - Math.abs(employeeCount - 25) * 2; // Peak at 25
  } else if (employeeCount > 50 && employeeCount <= 100) {
    employeeScore = 50; // Too large but possible
  } else if (employeeCount > 0 && employeeCount < 5) {
    employeeScore = employeeCount * 15; // Too small
  }

  factors.push({
    name: 'Employee Count',
    value: employeeCount,
    score: employeeScore,
    weight: 0.30,
    explanation: getEmployeeExplanation(employeeCount),
  });

  // Fleet size (3-20 vehicles ideal)
  const fleet = business.fleet?.[0];
  const fleetSize = fleet?.vehicleCount || 0;
  let fleetScore = 0;

  if (fleetSize >= 3 && fleetSize <= 20) {
    fleetScore = 100 - Math.abs(fleetSize - 10) * 5; // Peak at 10
  } else if (fleetSize > 20 && fleetSize <= 40) {
    fleetScore = 60; // Larger fleet
  } else if (fleetSize > 0 && fleetSize < 3) {
    fleetScore = fleetSize * 25;
  }

  factors.push({
    name: 'Fleet Size',
    value: fleetSize,
    score: fleetScore,
    weight: 0.25,
    explanation: getFleetExplanation(fleetSize),
  });

  // Permit volume (50-400/year ideal)
  const recentPermits = business.permits?.filter((p) => {
    const issueDate = p.issueDate ? new Date(p.issueDate) : null;
    if (!issueDate) return false;
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return issueDate >= oneYearAgo;
  }).length || 0;

  let permitScore = 0;
  if (recentPermits >= 50 && recentPermits <= 400) {
    permitScore = 80 + (recentPermits >= 100 && recentPermits <= 300 ? 20 : 0);
  } else if (recentPermits > 400) {
    permitScore = 60; // Very high volume
  } else if (recentPermits > 0) {
    permitScore = Math.min(recentPermits * 1.5, 75);
  }

  factors.push({
    name: 'Permit Volume',
    value: recentPermits,
    score: permitScore,
    weight: 0.25,
    explanation: `${recentPermits} permits in last 12 months`,
  });

  // Service area (moderate coverage ideal)
  const serviceRadius = business.serviceRadius || 0;
  let areaScore = 50; // Default if unknown

  if (serviceRadius > 0) {
    if (serviceRadius >= 20 && serviceRadius <= 75) {
      areaScore = 90;
    } else if (serviceRadius > 75) {
      areaScore = 70; // Very large area
    } else {
      areaScore = serviceRadius * 3;
    }
  }

  factors.push({
    name: 'Service Area',
    value: serviceRadius || 'Unknown',
    score: areaScore,
    weight: 0.20,
    explanation: serviceRadius
      ? `${serviceRadius} mile service radius`
      : 'Service area unknown',
  });

  // Calculate weighted score
  const totalScore = factors.reduce(
    (sum, f) => sum + f.score * f.weight,
    0
  );

  return { score: Math.round(totalScore), factors };
}

/**
 * Online Weakness Score
 * Higher score = weaker online presence (better opportunity)
 */
function calculateOnlineWeaknessScore(
  business: BusinessWithRelations,
  config: ScoringConfig
): ComponentScore {
  const factors: ScoreFactor[] = [];

  // Website quality
  let websiteScore = 100; // No website = max weakness
  if (business.website) {
    // Assume basic website if URL exists
    websiteScore = 50; // Would need actual analysis
  }

  factors.push({
    name: 'Website Quality',
    value: business.website || 'None',
    score: websiteScore,
    weight: 0.30,
    explanation: business.website
      ? 'Website exists (quality unknown)'
      : 'No website found',
  });

  // Social media presence
  const hasSocial =
    business.facebookUrl || business.linkedinUrl || business.instagramUrl;
  const socialScore = hasSocial ? 40 : 90;

  factors.push({
    name: 'Social Presence',
    value: hasSocial ? 'Present' : 'None',
    score: socialScore,
    weight: 0.20,
    explanation: hasSocial
      ? 'Some social media presence'
      : 'No social media found',
  });

  // Review volume
  const totalReviews =
    business.reviews?.reduce((sum, r) => sum + r.reviewCount, 0) || 0;
  let reviewScore = 90; // Few reviews = high weakness

  if (totalReviews >= 100) reviewScore = 20;
  else if (totalReviews >= 50) reviewScore = 40;
  else if (totalReviews >= 20) reviewScore = 60;
  else if (totalReviews >= 10) reviewScore = 75;

  factors.push({
    name: 'Review Volume',
    value: totalReviews,
    score: reviewScore,
    weight: 0.30,
    explanation: `${totalReviews} total reviews across platforms`,
  });

  // SEO visibility (estimated)
  // Without actual SEO data, use proxy indicators
  const seoScore = business.website ? 50 : 85;

  factors.push({
    name: 'SEO Visibility',
    value: 'Estimated',
    score: seoScore,
    weight: 0.20,
    explanation: 'SEO visibility estimated from web presence',
  });

  const totalScore = factors.reduce((sum, f) => sum + f.score * f.weight, 0);

  return { score: Math.round(totalScore), factors };
}

/**
 * Acquisition Fit Score
 * Evaluates ownership, age, specialization, succession
 */
function calculateAcquisitionFitScore(
  business: BusinessWithRelations,
  config: ScoringConfig
): ComponentScore {
  const factors: ScoreFactor[] = [];

  // Ownership type
  let ownershipScore = 50; // Unknown default
  if (business.ownershipType === 'FAMILY_OWNED') ownershipScore = 100;
  else if (business.ownershipType === 'FRANCHISE') ownershipScore = 30;
  else if (business.ownershipType === 'PRIVATE_EQUITY') ownershipScore = 10;
  else if (business.ownershipType === 'CORPORATE') ownershipScore = 20;

  factors.push({
    name: 'Ownership Type',
    value: business.ownershipType || 'Unknown',
    score: ownershipScore,
    weight: 0.30,
    explanation: getOwnershipExplanation(business.ownershipType),
  });

  // Business age (10-30 years ideal)
  const currentYear = new Date().getFullYear();
  const yearsInBusiness = business.foundedYear
    ? currentYear - business.foundedYear
    : 0;

  let ageScore = 50;
  if (yearsInBusiness >= 10 && yearsInBusiness <= 30) {
    ageScore = 100;
  } else if (yearsInBusiness > 30 && yearsInBusiness <= 50) {
    ageScore = 80;
  } else if (yearsInBusiness >= 5 && yearsInBusiness < 10) {
    ageScore = 70;
  } else if (yearsInBusiness > 50) {
    ageScore = 60;
  } else if (yearsInBusiness > 0) {
    ageScore = yearsInBusiness * 10;
  }

  factors.push({
    name: 'Business Age',
    value: yearsInBusiness || 'Unknown',
    score: ageScore,
    weight: 0.25,
    explanation: yearsInBusiness
      ? `${yearsInBusiness} years in business`
      : 'Age unknown',
  });

  // Niche specialization
  const niches = business.niches || [];
  let nicheScore = 50;

  if (niches.length > 0) {
    nicheScore = 80; // Has specialization
    if (
      niches.some((n) =>
        ['refrigeration', 'clean_rooms', 'industrial', 'restaurants'].includes(
          n.toLowerCase()
        )
      )
    ) {
      nicheScore = 100; // Premium niches
    }
  }

  factors.push({
    name: 'Niche Specialization',
    value: niches.length > 0 ? niches.join(', ') : 'General',
    score: nicheScore,
    weight: 0.25,
    explanation:
      niches.length > 0
        ? `Specializes in ${niches.join(', ')}`
        : 'General HVAC services',
  });

  // Succession status
  let successionScore = 50;
  if (business.successionStatus === 'OWNER_RETIRING') successionScore = 100;
  else if (business.successionStatus === 'NO_SUCCESSOR') successionScore = 90;
  else if (business.successionStatus === 'SUCCESSION_PLANNED') successionScore = 40;
  else if (business.successionStatus === 'RECENTLY_TRANSITIONED') successionScore = 20;

  // Owner age as proxy
  if (business.ownerAge) {
    if (business.ownerAge >= 60) successionScore = Math.max(successionScore, 85);
    else if (business.ownerAge >= 55) successionScore = Math.max(successionScore, 70);
  }

  factors.push({
    name: 'Succession Status',
    value: business.successionStatus || 'Unknown',
    score: successionScore,
    weight: 0.20,
    explanation: getSuccessionExplanation(
      business.successionStatus,
      business.ownerAge
    ),
  });

  const totalScore = factors.reduce((sum, f) => sum + f.score * f.weight, 0);

  return { score: Math.round(totalScore), factors };
}

/**
 * Growth Signals Score
 * Evaluates permit trends, review trends, hiring, fleet growth
 */
function calculateGrowthSignalsScore(
  business: BusinessWithRelations,
  config: ScoringConfig
): ComponentScore {
  const factors: ScoreFactor[] = [];

  // Permit trend
  const permits = business.permits || [];
  const currentYear = new Date().getFullYear();

  const thisYearPermits = permits.filter(
    (p) => p.issueDate && new Date(p.issueDate).getFullYear() === currentYear
  ).length;

  const lastYearPermits = permits.filter(
    (p) => p.issueDate && new Date(p.issueDate).getFullYear() === currentYear - 1
  ).length;

  let permitTrendScore = 60; // Stable default
  if (lastYearPermits > 0) {
    const growth = (thisYearPermits - lastYearPermits) / lastYearPermits;
    if (growth >= 0.2) permitTrendScore = 100;
    else if (growth >= 0.1) permitTrendScore = 85;
    else if (growth >= 0) permitTrendScore = 70;
    else if (growth >= -0.1) permitTrendScore = 50;
    else permitTrendScore = 30;
  }

  factors.push({
    name: 'Permit Trend',
    value: `${thisYearPermits} this year vs ${lastYearPermits} last year`,
    score: permitTrendScore,
    weight: 0.35,
    explanation: getPermitTrendExplanation(thisYearPermits, lastYearPermits),
  });

  // Review trend (simplified - would need historical data)
  const avgRating =
    business.reviews && business.reviews.length > 0
      ? business.reviews.reduce((sum, r) => sum + r.rating, 0) /
        business.reviews.length
      : 0;

  let reviewTrendScore = 60;
  if (avgRating >= 4.5) reviewTrendScore = 90;
  else if (avgRating >= 4.0) reviewTrendScore = 75;
  else if (avgRating >= 3.5) reviewTrendScore = 60;
  else if (avgRating > 0) reviewTrendScore = 40;

  factors.push({
    name: 'Review Trend',
    value: avgRating > 0 ? avgRating.toFixed(1) : 'No data',
    score: reviewTrendScore,
    weight: 0.25,
    explanation:
      avgRating > 0 ? `${avgRating.toFixed(1)} average rating` : 'No review data',
  });

  // Hiring activity (estimated)
  // Would need actual job posting data
  const hiringScore = 60; // Neutral without data

  factors.push({
    name: 'Hiring Activity',
    value: 'Unknown',
    score: hiringScore,
    weight: 0.25,
    explanation: 'Hiring activity data not available',
  });

  // Fleet growth (estimated)
  const fleetGrowthScore = 60; // Neutral without historical data

  factors.push({
    name: 'Fleet Growth',
    value: 'Unknown',
    score: fleetGrowthScore,
    weight: 0.15,
    explanation: 'Fleet growth data not available',
  });

  const totalScore = factors.reduce((sum, f) => sum + f.score * f.weight, 0);

  return { score: Math.round(totalScore), factors };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRecommendation(
  score: number,
  config: ScoringConfig
): Recommendation {
  if (score >= config.thresholds.highPriority) return 'HIGH_PRIORITY';
  if (score >= config.thresholds.mediumPriority) return 'MEDIUM_PRIORITY';
  if (score >= config.thresholds.lowPriority) return 'LOW_PRIORITY';
  return 'NOT_RECOMMENDED';
}

function getEmployeeExplanation(count: number): string {
  if (count >= 5 && count <= 50) return `${count} employees - ideal range for $1-10M revenue`;
  if (count > 50) return `${count} employees - may be larger than target`;
  if (count > 0) return `${count} employees - smaller operation`;
  return 'Employee count unknown';
}

function getFleetExplanation(count: number): string {
  if (count >= 3 && count <= 20) return `${count} vehicles - typical for target range`;
  if (count > 20) return `${count} vehicles - larger operation`;
  if (count > 0) return `${count} vehicles - smaller fleet`;
  return 'Fleet size unknown';
}

function getOwnershipExplanation(type?: string): string {
  switch (type) {
    case 'FAMILY_OWNED':
      return 'Family-owned - ideal acquisition target';
    case 'FRANCHISE':
      return 'Franchise - may have transfer restrictions';
    case 'PRIVATE_EQUITY':
      return 'PE-owned - likely not available';
    case 'CORPORATE':
      return 'Corporate - may be part of larger org';
    default:
      return 'Ownership type unknown';
  }
}

function getSuccessionExplanation(status?: string, ownerAge?: number): string {
  const ageInfo = ownerAge ? ` (owner age: ${ownerAge})` : '';

  switch (status) {
    case 'OWNER_RETIRING':
      return `Owner retiring - high acquisition potential${ageInfo}`;
    case 'NO_SUCCESSOR':
      return `No successor identified - good opportunity${ageInfo}`;
    case 'SUCCESSION_PLANNED':
      return `Succession planned - may not be available${ageInfo}`;
    case 'RECENTLY_TRANSITIONED':
      return `Recently transitioned - unlikely to sell${ageInfo}`;
    default:
      return ownerAge
        ? `Succession unknown (owner age: ${ownerAge})`
        : 'Succession status unknown';
  }
}

function getPermitTrendExplanation(current: number, previous: number): string {
  if (previous === 0) return 'No historical permit data';

  const growth = ((current - previous) / previous) * 100;

  if (growth >= 20) return `Strong growth: ${growth.toFixed(0)}% increase`;
  if (growth >= 10) return `Moderate growth: ${growth.toFixed(0)}% increase`;
  if (growth >= 0) return `Stable: ${growth.toFixed(0)}% change`;
  if (growth >= -10) return `Slight decline: ${growth.toFixed(0)}% change`;
  return `Declining: ${growth.toFixed(0)}% decrease`;
}
