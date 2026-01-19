// Review Aggregation Adapter
// Handles collection of review data from Google, Yelp, BBB, etc.

import type { Review, ReviewSource } from '@/types';

export interface ReviewSearchParams {
  businessName: string;
  city: string;
  state?: string;
  sources?: ReviewSource[];
}

export interface ReviewData {
  source: ReviewSource;
  rating: number; // 1-5
  reviewCount: number;
  averageRating: number;
  profileUrl?: string;
  recentReviews?: Array<{
    rating: number;
    text: string;
    date: string;
    author?: string;
  }>;
  sentimentScore?: number; // -1 to 1
  commonThemes?: string[];
}

export interface AggregatedReviews {
  businessName: string;
  overallRating: number;
  totalReviews: number;
  sources: ReviewData[];
  summary: {
    strengthsThemes: string[];
    weaknessThemes: string[];
    sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  };
}

/**
 * Aggregate reviews from multiple sources using AI research
 */
export async function aggregateReviews(
  params: ReviewSearchParams
): Promise<AggregatedReviews> {
  const { startDeepResearch, waitForResearchCompletion } = await import('@/lib/ai/deep-research');

  const sources = params.sources || ['GOOGLE', 'YELP', 'BBB', 'FACEBOOK'];
  const location = `${params.city}, ${params.state || 'Texas'}`;

  const prompt = `Research online reviews for "${params.businessName}" HVAC company in ${location}.

## Sources to Check
${sources.map((s) => `- ${s}`).join('\n')}

## Information to Collect

For each review platform:
1. Overall rating (1-5 stars)
2. Total number of reviews
3. Profile/listing URL
4. Sample of recent reviews (3-5 reviews)
5. Common positive themes
6. Common negative themes

## Analysis Tasks
- Calculate sentiment score (-1 negative to +1 positive)
- Identify recurring themes in feedback
- Note any red flags or exceptional praise
- Compare to typical HVAC company ratings

## Output Format
Provide structured data for each source:

**[Platform Name]**
- Rating: [X.X] / 5.0
- Reviews: [Count]
- URL: [Profile link]
- Recent Reviews:
  - "[Review excerpt]" - [Rating] stars ([Date])
- Positive Themes: [List]
- Negative Themes: [List]
- Sentiment: [positive/neutral/negative]

End with overall summary comparing across platforms.`;

  const result = await startDeepResearch(prompt, { maxToolCalls: 25 });

  if (result.status === 'failed') {
    return {
      businessName: params.businessName,
      overallRating: 0,
      totalReviews: 0,
      sources: [],
      summary: {
        strengthsThemes: [],
        weaknessThemes: [],
        sentiment: 'neutral',
      },
    };
  }

  const finalResult =
    result.status === 'pending'
      ? await waitForResearchCompletion(result.id, { maxWaitMs: 10 * 60 * 1000 })
      : result;

  if (!finalResult.output) {
    return {
      businessName: params.businessName,
      overallRating: 0,
      totalReviews: 0,
      sources: [],
      summary: {
        strengthsThemes: [],
        weaknessThemes: [],
        sentiment: 'neutral',
      },
    };
  }

  return parseReviewResults(params.businessName, finalResult.output);
}

/**
 * Quick review lookup for a single source
 */
export async function getSourceReviews(
  businessName: string,
  city: string,
  source: ReviewSource
): Promise<ReviewData | null> {
  const aggregated = await aggregateReviews({
    businessName,
    city,
    sources: [source],
  });

  return aggregated.sources.find((s) => s.source === source) || null;
}

/**
 * Calculate online presence weakness score from reviews
 * Higher score = weaker presence (better acquisition target)
 */
export function calculateReviewWeaknessScore(reviews: AggregatedReviews): {
  score: number;
  factors: Array<{ name: string; score: number; explanation: string }>;
} {
  const factors: Array<{ name: string; score: number; explanation: string }> = [];

  // Factor 1: Review volume (fewer reviews = higher weakness score)
  let volumeScore = 100;
  if (reviews.totalReviews >= 100) volumeScore = 20;
  else if (reviews.totalReviews >= 50) volumeScore = 40;
  else if (reviews.totalReviews >= 20) volumeScore = 60;
  else if (reviews.totalReviews >= 10) volumeScore = 80;

  factors.push({
    name: 'Review Volume',
    score: volumeScore,
    explanation: `${reviews.totalReviews} total reviews across platforms`,
  });

  // Factor 2: Platform presence (fewer platforms = higher weakness)
  const platformsPresent = reviews.sources.filter((s) => s.reviewCount > 0).length;
  let platformScore = 100;
  if (platformsPresent >= 4) platformScore = 20;
  else if (platformsPresent >= 3) platformScore = 40;
  else if (platformsPresent >= 2) platformScore = 60;
  else if (platformsPresent >= 1) platformScore = 80;

  factors.push({
    name: 'Platform Presence',
    score: platformScore,
    explanation: `Present on ${platformsPresent} review platforms`,
  });

  // Factor 3: Google specifically (primary platform for HVAC)
  const googleReviews = reviews.sources.find((s) => s.source === 'GOOGLE');
  let googleScore = 100;
  if (googleReviews) {
    if (googleReviews.reviewCount >= 50) googleScore = 20;
    else if (googleReviews.reviewCount >= 25) googleScore = 40;
    else if (googleReviews.reviewCount >= 10) googleScore = 60;
    else googleScore = 80;
  }

  factors.push({
    name: 'Google Presence',
    score: googleScore,
    explanation: googleReviews
      ? `${googleReviews.reviewCount} Google reviews`
      : 'No Google presence found',
  });

  // Factor 4: Rating quality (lower ratings might indicate operational issues)
  // We want weak online presence, not bad service
  let ratingScore = 50; // Neutral
  if (reviews.overallRating >= 4.5) ratingScore = 30; // Great service, less opportunity
  else if (reviews.overallRating >= 4.0) ratingScore = 40;
  else if (reviews.overallRating >= 3.5) ratingScore = 50;
  else if (reviews.overallRating >= 3.0) ratingScore = 60; // Some room for improvement
  else if (reviews.overallRating > 0) ratingScore = 40; // Low ratings = operational issues

  factors.push({
    name: 'Rating Quality',
    score: ratingScore,
    explanation: reviews.overallRating > 0
      ? `${reviews.overallRating.toFixed(1)} average rating`
      : 'No ratings available',
  });

  // Calculate weighted average
  const weights = [0.3, 0.2, 0.35, 0.15]; // Volume, Platform, Google, Rating
  const weightedScore = factors.reduce(
    (sum, factor, i) => sum + factor.score * weights[i],
    0
  );

  return {
    score: Math.round(weightedScore),
    factors,
  };
}

/**
 * Parse review research output
 */
function parseReviewResults(
  businessName: string,
  output: string
): AggregatedReviews {
  const sources: ReviewData[] = [];
  let totalReviews = 0;
  let totalRatingSum = 0;
  let ratingCount = 0;

  // Parse each platform
  const platforms: { pattern: RegExp; source: ReviewSource }[] = [
    { pattern: /Google[^]*?Rating:\s*([\d.]+)[^]*?Reviews?:\s*(\d+)/i, source: 'GOOGLE' },
    { pattern: /Yelp[^]*?Rating:\s*([\d.]+)[^]*?Reviews?:\s*(\d+)/i, source: 'YELP' },
    { pattern: /BBB[^]*?Rating:\s*([\d.]+)[^]*?Reviews?:\s*(\d+)/i, source: 'BBB' },
    { pattern: /Facebook[^]*?Rating:\s*([\d.]+)[^]*?Reviews?:\s*(\d+)/i, source: 'FACEBOOK' },
  ];

  for (const { pattern, source } of platforms) {
    const match = output.match(pattern);
    if (match) {
      const rating = parseFloat(match[1]);
      const count = parseInt(match[2]);

      if (!isNaN(rating) && !isNaN(count)) {
        sources.push({
          source,
          rating,
          reviewCount: count,
          averageRating: rating,
        });

        totalReviews += count;
        totalRatingSum += rating * count;
        ratingCount += count;
      }
    }
  }

  // Parse themes
  const strengthsMatch = output.match(/positive themes?:([^\n]+)/i);
  const weaknessMatch = output.match(/negative themes?:([^\n]+)/i);

  const strengthsThemes = strengthsMatch
    ? strengthsMatch[1].split(/[,;]/).map((t) => t.trim()).filter(Boolean)
    : [];

  const weaknessThemes = weaknessMatch
    ? weaknessMatch[1].split(/[,;]/).map((t) => t.trim()).filter(Boolean)
    : [];

  // Determine overall sentiment
  let sentiment: 'positive' | 'neutral' | 'negative' | 'mixed' = 'neutral';
  const avgRating = ratingCount > 0 ? totalRatingSum / ratingCount : 0;

  if (avgRating >= 4.2) sentiment = 'positive';
  else if (avgRating >= 3.5) sentiment = 'neutral';
  else if (avgRating >= 2.5) sentiment = 'mixed';
  else if (avgRating > 0) sentiment = 'negative';

  return {
    businessName,
    overallRating: ratingCount > 0 ? Math.round(avgRating * 10) / 10 : 0,
    totalReviews,
    sources,
    summary: {
      strengthsThemes,
      weaknessThemes,
      sentiment,
    },
  };
}

/**
 * Convert review data to database format
 */
export function reviewDataToDatabase(
  data: ReviewData,
  businessId: string
): Omit<Review, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    businessId,
    source: data.source,
    rating: data.rating,
    reviewCount: data.reviewCount,
    averageRating: data.averageRating,
    sentimentScore: data.sentimentScore,
    commonThemes: data.commonThemes || [],
    snapshotDate: new Date(),
    profileUrl: data.profileUrl,
  };
}
