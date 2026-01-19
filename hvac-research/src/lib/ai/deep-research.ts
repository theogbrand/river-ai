// OpenAI Deep Research Client
// Uses the Responses API with o4-mini-deep-research model for autonomous research tasks

import OpenAI from 'openai';
import type { DeepResearchResponse } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface DeepResearchOptions {
  maxToolCalls?: number;
  background?: boolean;
  webhookUrl?: string;
}

export interface ResearchResult {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  output?: string;
  sources?: string[];
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  error?: string;
}

/**
 * Start a deep research task using OpenAI's o4-mini-deep-research model
 * This is designed for long-running autonomous research that can take 10-30 minutes
 */
export async function startDeepResearch(
  prompt: string,
  options: DeepResearchOptions = {}
): Promise<ResearchResult> {
  const { maxToolCalls = 50, background = true } = options;

  try {
    // @ts-expect-error - Using experimental responses API
    const response = await openai.responses.create({
      model: 'o4-mini-deep-research',
      input: prompt,
      background,
      tools: [
        { type: 'web_search_preview' },
        { type: 'code_interpreter', container: { type: 'auto' } },
      ],
      max_tool_calls: maxToolCalls,
    });

    return {
      id: response.id,
      status: background ? 'pending' : 'completed',
      output: response.output_text,
    };
  } catch (error) {
    console.error('Deep research error:', error);
    return {
      id: '',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Check the status of a background deep research task
 */
export async function getResearchStatus(responseId: string): Promise<ResearchResult> {
  try {
    // @ts-expect-error - Using experimental responses API
    const response = await openai.responses.retrieve(responseId);

    let status: ResearchResult['status'] = 'pending';
    if (response.status === 'completed') {
      status = 'completed';
    } else if (response.status === 'failed') {
      status = 'failed';
    } else if (response.status === 'in_progress') {
      status = 'in_progress';
    }

    return {
      id: response.id,
      status,
      output: response.output_text,
      usage: response.usage
        ? {
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
      error: response.error?.message,
    };
  } catch (error) {
    console.error('Get research status error:', error);
    return {
      id: responseId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Failed to retrieve status',
    };
  }
}

/**
 * Cancel a running deep research task
 */
export async function cancelResearch(responseId: string): Promise<boolean> {
  try {
    // @ts-expect-error - Using experimental responses API
    await openai.responses.cancel(responseId);
    return true;
  } catch (error) {
    console.error('Cancel research error:', error);
    return false;
  }
}

/**
 * Poll for research completion with exponential backoff
 */
export async function waitForResearchCompletion(
  responseId: string,
  options: {
    maxWaitMs?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    onProgress?: (result: ResearchResult) => void;
  } = {}
): Promise<ResearchResult> {
  const {
    maxWaitMs = 30 * 60 * 1000, // 30 minutes
    initialDelayMs = 5000,
    maxDelayMs = 60000,
    onProgress,
  } = options;

  const startTime = Date.now();
  let delay = initialDelayMs;

  while (Date.now() - startTime < maxWaitMs) {
    const result = await getResearchStatus(responseId);

    if (onProgress) {
      onProgress(result);
    }

    if (result.status === 'completed' || result.status === 'failed') {
      return result;
    }

    // Exponential backoff
    await new Promise((resolve) => setTimeout(resolve, delay));
    delay = Math.min(delay * 1.5, maxDelayMs);
  }

  return {
    id: responseId,
    status: 'failed',
    error: 'Research timed out',
  };
}

/**
 * Build a research prompt for HVAC business discovery
 */
export function buildHVACDiscoveryPrompt(params: {
  region: string;
  county?: string;
  city?: string;
  criteria?: string[];
}): string {
  const { region, county, city, criteria = [] } = params;

  const locationDesc = city
    ? `${city}, ${county || ''} County, Texas`
    : county
      ? `${county} County, Texas`
      : `the ${region} region of Texas`;

  const criteriaList = criteria.length > 0
    ? `\n\nAdditional criteria to consider:\n${criteria.map((c) => `- ${c}`).join('\n')}`
    : '';

  return `Research and compile a comprehensive list of HVAC (Heating, Ventilation, and Air Conditioning) businesses operating in ${locationDesc}.

## Research Focus

Find HVAC companies that match these characteristics:
1. **Revenue Range**: Estimated annual revenue between $1M-$10M
2. **Ownership**: Family-owned or independent operators preferred
3. **Business Age**: Established businesses (10+ years in operation)
4. **Online Presence**: Companies with limited or outdated digital presence
5. **Specializations**: Include residential, commercial, and niche specialists (refrigeration, clean rooms, industrial)

## Information to Collect for Each Business

For each HVAC business found, gather:
- Business name and any DBA names
- Physical address and service area
- Contact information (phone, email, website)
- Years in business / founding year
- Owner name(s) if discoverable
- Estimated company size (employees, fleet)
- Specializations and service types
- License information (Texas TDLR)
- Notable certifications (NATE, EPA 608, manufacturer)
- Online review presence (Google, Yelp ratings/counts)
- Association memberships (ACCA, PHCC, local chambers)

## Output Format

Provide the results as a structured list with the following format for each business:

**[Business Name]**
- Location: [City, County]
- Address: [Full address if found]
- Phone: [Phone number]
- Website: [URL or "None found"]
- Founded: [Year or "Unknown"]
- Owner: [Name or "Unknown"]
- Size: [Employee estimate]
- Specializations: [List]
- License: [TDLR info if found]
- Reviews: [Platform ratings/counts]
- Notes: [Any relevant observations about acquisition fit]

${criteriaList}

## Important Notes

- Focus on finding businesses that might be "hidden gems" - solid operations without strong online presence
- Include businesses you find through:
  - Texas TDLR license records
  - Better Business Bureau listings
  - Local chamber of commerce directories
  - Industry association member lists
  - Permit records
  - Yellow pages and local directories
- Prioritize accuracy over quantity
- Note confidence level for estimated data`;
}

export default {
  startDeepResearch,
  getResearchStatus,
  cancelResearch,
  waitForResearchCompletion,
  buildHVACDiscoveryPrompt,
};
