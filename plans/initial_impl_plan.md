# HVAC Business Research System - Implementation Plan

## Objective
Build a hybrid research system to discover underrated HVAC businesses ($1M-$10M revenue) in Texas as acquisition targets, focusing on family-owned, traditional businesses with weak online presence.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL (Supabase) + Prisma ORM |
| Cache/Queue | Redis (Upstash) |
| AI Research | OpenAI Deep Research (`o4-mini-deep-research`) |
| AI Analysis | OpenAI GPT-4.1 (prompt rewriting, extraction) |
| UI | Tailwind CSS + shadcn/ui + Recharts |
| Hosting | Vercel |

## Project Structure

```
hvac-research/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Dashboard routes
│   │   │   ├── prospects/      # Prospect list & detail views
│   │   │   ├── research/       # Research job management
│   │   │   └── scoring/        # Scoring configuration
│   │   └── api/                # API routes
│   ├── lib/
│   │   ├── ai/                 # OpenAI & Gemini clients
│   │   ├── research/           # Pipeline & data sources
│   │   ├── scoring/            # Scoring engine
│   │   └── db/                 # Prisma client
│   ├── components/             # React components
│   └── types/                  # TypeScript definitions
├── prisma/schema.prisma        # Database schema
└── config/                     # Scoring weights, sources
```

## Research Pipeline

```
TRIGGER → DISCOVERY → ENRICHMENT → VALIDATION → SCORING → OUTPUT
           (OpenAI    (Multi-src)   (AI+Rules)   (Weighted)  (Dashboard)
            Deep Research)
```

### OpenAI Deep Research Integration

Uses the Responses API with `o4-mini-deep-research` model:

```typescript
// Example: Discover HVAC businesses in a region
const response = await openai.responses.create({
  model: "o4-mini-deep-research",
  input: researchPrompt,
  background: true,  // Long-running task
  tools: [
    { type: "web_search_preview" },
    { type: "code_interpreter", container: { type: "auto" } }
  ],
  max_tool_calls: 50  // Control cost/latency
});
```

**Key patterns:**
- Use `background: true` for async execution (tasks can take 10-30 min)
- Use webhooks to get notified when research completes
- Pre-process prompts with GPT-4.1 for clarification/rewriting
- Use `max_tool_calls` to control API costs

### Leading Indicators Collected
1. **Licenses** - TDLR records (type, status, expiration)
2. **Permits** - County permit data (volume, trends, project types)
3. **Fleet** - Vehicle registrations, fleet size estimates
4. **Employees** - Job postings, LinkedIn data, estimates
5. **Reviews** - Google, Yelp, BBB (count, ratings, sentiment)
6. **Certifications** - EPA 608, NATE, manufacturer certs
7. **Associations** - ACCA, PHCC, chamber memberships

## Scoring Methodology

### Component Weights
| Component | Weight | Description |
|-----------|--------|-------------|
| Revenue Proxy | 30% | Is revenue in $1M-$10M range? |
| Online Weakness | 25% | Opportunity to improve presence? |
| Acquisition Fit | 25% | Family-owned, niche, succession? |
| Growth Signals | 20% | Permit trends, hiring, fleet growth |

### Revenue Proxy Indicators
- Employee count (5-50 ideal for target range)
- Fleet size (3-20 vehicles)
- Permit volume (50-400/year)
- Service area coverage

### Online Weakness Indicators (Higher = Weaker = Better)
- Website quality (outdated, template, or missing)
- Social media presence (absent or inactive)
- Review volume (low review count)
- Paid advertising (no Google/Facebook ads)
- SEO ranking (poor search visibility)

### Acquisition Fit Indicators
- Ownership type (family-owned preferred)
- Years in business (10-30 years optimal)
- Niche specialization (refrigeration, clean rooms, industrial)
- Owner age/succession status

## Key Data Models

### Business Entity
- Basic info (name, location, contact)
- Classification (specializations, niches)
- Ownership indicators (type, owner, generation)
- Status tracking (discovered → qualified → contacted)

### Score Entity
- Component scores (0-100 each)
- Overall weighted score
- Recommendation (HIGH/MEDIUM/LOW_PRIORITY)
- Detailed breakdown JSON

## Implementation Phases

### Phase 1: Foundation
- Initialize Next.js + TypeScript project
- Set up Prisma with PostgreSQL (Supabase)
- Create database schema
- Basic UI shell with shadcn/ui

### Phase 2: AI Integration
- OpenAI Deep Research client (`o4-mini-deep-research` via Responses API)
- GPT-4.1 for prompt rewriting and data extraction
- Background task handling with webhooks
- Prompt templates for HVAC discovery
- Rate limiting and response caching

### Phase 3: Data Pipeline
- TDLR license adapter (AI-assisted)
- County permit collectors (Harris, Dallas, Tarrant, Bexar, Travis)
- Review aggregation (Google, Yelp)
- Employee estimation (job postings)

### Phase 4: Scoring Engine
- Implement all four component scorers
- Configurable weights system
- Score explanation generation

### Phase 5: UI Implementation
- Prospect list with filters/sorting
- Prospect detail with score breakdown
- Research job management
- CSV export

### Phase 6: Scale & Refine
- Add more Texas counties
- Scheduled research jobs (cron)
- Monitoring and alerting
- Documentation

## Verification Strategy

### Automated Tests
- Unit tests for each scorer
- Integration tests for research pipeline
- E2E tests for critical user flows

### Manual Validation
- Verify top 20 scored prospects exist and match criteria
- Cross-check license numbers against TDLR
- Validate revenue estimates against industry benchmarks
- Confirm scoring logic produces sensible rankings

### Success Metrics
- Qualification rate: 10-30% of discovered businesses
- False positive rate: <20% on manual validation
- Data completeness: >70% of fields populated
- API cost: <$1 per qualified prospect

## Critical Files to Create

1. `/prisma/schema.prisma` - Complete data model
2. `/src/lib/research/pipeline.ts` - Core orchestration
3. `/src/lib/ai/deep-research.ts` - OpenAI Deep Research client (Responses API)
4. `/src/lib/ai/openai.ts` - GPT-4.1 for extraction/validation/prompt rewriting
5. `/src/lib/scoring/calculator.ts` - Scoring engine
6. `/src/components/prospects/prospect-table.tsx` - Main list view
7. `/src/components/prospects/score-breakdown.tsx` - Score visualization

## Confirmed Requirements

- **Authentication**: None (single-user system)
- **Priority Regions**: Houston Metro (Harris County) + DFW Metroplex (Dallas/Tarrant)
- **API Budget**: Cost-conscious ($50-100/mo) - prioritize caching, rate limiting, and efficient prompts
- **Export**: CSV for initial version
