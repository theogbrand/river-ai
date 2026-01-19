// HVAC Business Research System - TypeScript Type Definitions

// ============================================================================
// BUSINESS TYPES
// ============================================================================

export type OwnershipType =
  | 'FAMILY_OWNED'
  | 'FRANCHISE'
  | 'PRIVATE_EQUITY'
  | 'CORPORATE'
  | 'UNKNOWN';

export type SuccessionStatus =
  | 'OWNER_RETIRING'
  | 'SUCCESSION_PLANNED'
  | 'NO_SUCCESSOR'
  | 'RECENTLY_TRANSITIONED'
  | 'UNKNOWN';

export type BusinessStatus =
  | 'DISCOVERED'
  | 'RESEARCHING'
  | 'QUALIFIED'
  | 'DISQUALIFIED'
  | 'CONTACTED'
  | 'IN_CONVERSATION'
  | 'CLOSED';

export type LicenseStatus =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'SUSPENDED'
  | 'REVOKED'
  | 'PENDING';

export type ReviewSource =
  | 'GOOGLE'
  | 'YELP'
  | 'BBB'
  | 'FACEBOOK'
  | 'ANGI'
  | 'OTHER';

export type Recommendation =
  | 'HIGH_PRIORITY'
  | 'MEDIUM_PRIORITY'
  | 'LOW_PRIORITY'
  | 'NOT_RECOMMENDED';

export type ResearchJobType =
  | 'REGION_DISCOVERY'
  | 'BUSINESS_ENRICHMENT'
  | 'PERMIT_SCAN'
  | 'REVIEW_UPDATE';

export type ResearchJobStatus =
  | 'PENDING'
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type NoteType =
  | 'GENERAL'
  | 'CONTACT_ATTEMPT'
  | 'RESEARCH_FINDING'
  | 'DISQUALIFICATION';

// ============================================================================
// BUSINESS ENTITY
// ============================================================================

export interface Business {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  // Basic Information
  name: string;
  legalName?: string;
  dba?: string;

  // Location
  address?: string;
  city: string;
  county: string;
  state: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  serviceRadius?: number;

  // Contact
  phone?: string;
  email?: string;
  website?: string;

  // Social Media
  facebookUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;

  // Classification
  specializations: string[];
  niches: string[];
  serviceTypes: string[];

  // Ownership
  ownershipType?: OwnershipType;
  ownerName?: string;
  ownerAge?: number;
  foundedYear?: number;
  generation?: number;
  successionStatus?: SuccessionStatus;

  // Status
  status: BusinessStatus;
  qualifiedAt?: Date;
  contactedAt?: Date;
  disqualifiedAt?: Date;
  disqualifyReason?: string;

  // Discovery
  discoverySource?: string;
  discoveryJobId?: string;
}

export interface BusinessWithRelations extends Business {
  licenses?: License[];
  permits?: Permit[];
  reviews?: Review[];
  employees?: EmployeeEstimate[];
  fleet?: FleetEstimate[];
  certifications?: Certification[];
  associations?: AssociationMembership[];
  scores?: Score[];
}

// ============================================================================
// SUPPORTING ENTITIES
// ============================================================================

export interface License {
  id: string;
  businessId: string;
  licenseNumber: string;
  licenseType: string;
  status: LicenseStatus;
  issueDate?: Date;
  expirationDate?: Date;
  tdlrRecordId?: string;
}

export interface Permit {
  id: string;
  businessId: string;
  permitNumber: string;
  permitType: string;
  description?: string;
  status?: string;
  issueDate?: Date;
  completedDate?: Date;
  projectAddress?: string;
  projectCity?: string;
  projectValue?: number;
  county: string;
  sourceUrl?: string;
}

export interface Review {
  id: string;
  businessId: string;
  source: ReviewSource;
  rating: number;
  reviewCount: number;
  averageRating?: number;
  sentimentScore?: number;
  commonThemes: string[];
  snapshotDate: Date;
  profileUrl?: string;
}

export interface EmployeeEstimate {
  id: string;
  businessId: string;
  estimatedCount: number;
  minCount?: number;
  maxCount?: number;
  confidence?: number;
  source: string;
  sourceDetails?: Record<string, unknown>;
  snapshotDate: Date;
}

export interface FleetEstimate {
  id: string;
  businessId: string;
  vehicleCount: number;
  minCount?: number;
  maxCount?: number;
  confidence?: number;
  source: string;
  sourceDetails?: Record<string, unknown>;
  snapshotDate: Date;
}

export interface Certification {
  id: string;
  businessId: string;
  type: string;
  name: string;
  issuer?: string;
  certNumber?: string;
  issueDate?: Date;
  expirationDate?: Date;
}

export interface AssociationMembership {
  id: string;
  businessId: string;
  organization: string;
  membershipLevel?: string;
  memberSince?: Date;
  verified: boolean;
}

// ============================================================================
// SCORING
// ============================================================================

export interface Score {
  id: string;
  businessId: string;
  createdAt: Date;
  updatedAt: Date;

  // Component Scores (0-100)
  revenueProxyScore: number;
  onlineWeaknessScore: number;
  acquisitionFitScore: number;
  growthSignalsScore: number;

  // Overall
  overallScore: number;
  recommendation: Recommendation;

  // Detailed breakdown
  breakdown: ScoreBreakdown;
  configVersion: string;
}

export interface ScoreBreakdown {
  revenueProxy: {
    score: number;
    factors: ScoreFactor[];
  };
  onlineWeakness: {
    score: number;
    factors: ScoreFactor[];
  };
  acquisitionFit: {
    score: number;
    factors: ScoreFactor[];
  };
  growthSignals: {
    score: number;
    factors: ScoreFactor[];
  };
}

export interface ScoreFactor {
  name: string;
  value: number | string | boolean;
  score: number;
  weight: number;
  explanation: string;
}

// ============================================================================
// RESEARCH JOBS
// ============================================================================

export interface ResearchJob {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  name: string;
  type: ResearchJobType;
  status: ResearchJobStatus;

  parameters: ResearchJobParameters;

  openaiResponseId?: string;

  startedAt?: Date;
  completedAt?: Date;
  progress: number;

  businessesFound: number;
  businessesQualified: number;

  error?: string;
}

export interface ResearchJobParameters {
  // For region discovery
  region?: {
    county?: string;
    city?: string;
    zipCodes?: string[];
  };

  // Filters
  filters?: {
    minEmployees?: number;
    maxEmployees?: number;
    specializations?: string[];
    niches?: string[];
  };

  // For business enrichment
  businessIds?: string[];

  // Options
  options?: {
    maxResults?: number;
    includePermitData?: boolean;
    includeReviewData?: boolean;
  };
}

// ============================================================================
// NOTES
// ============================================================================

export interface Note {
  id: string;
  businessId: string;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  type: NoteType;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface BusinessListFilters {
  status?: BusinessStatus[];
  county?: string[];
  city?: string[];
  minScore?: number;
  maxScore?: number;
  recommendation?: Recommendation[];
  search?: string;
}

export interface BusinessListSort {
  field: 'name' | 'city' | 'overallScore' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

// ============================================================================
// DEEP RESEARCH TYPES
// ============================================================================

export interface DeepResearchRequest {
  prompt: string;
  context?: string;
  maxToolCalls?: number;
}

export interface DeepResearchResponse {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  output?: string;
  sources?: string[];
  error?: string;
}

export interface ExtractedBusinessData {
  name: string;
  city: string;
  county: string;
  address?: string;
  phone?: string;
  website?: string;
  specializations?: string[];
  ownerName?: string;
  foundedYear?: number;
  employeeEstimate?: number;
  confidence: number;
}

// ============================================================================
// SCORING CONFIG
// ============================================================================

export interface ScoringConfig {
  version: string;
  weights: {
    revenueProxy: number;
    onlineWeakness: number;
    acquisitionFit: number;
    growthSignals: number;
  };
  thresholds: {
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
  };
  factors: {
    revenueProxy: FactorConfig[];
    onlineWeakness: FactorConfig[];
    acquisitionFit: FactorConfig[];
    growthSignals: FactorConfig[];
  };
}

export interface FactorConfig {
  name: string;
  weight: number;
  scorer: string;
  params?: Record<string, unknown>;
}
