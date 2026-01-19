// CSV Export Utility
// Handles exporting business data to CSV format

import type { BusinessWithRelations, Score } from '@/types';

interface ExportableProspect extends BusinessWithRelations {
  scores?: Score[];
}

/**
 * Convert prospects to CSV format
 */
export function prospectsToCSV(prospects: ExportableProspect[]): string {
  const headers = [
    'Business Name',
    'City',
    'County',
    'State',
    'Address',
    'Phone',
    'Email',
    'Website',
    'Status',
    'Founded Year',
    'Owner Name',
    'Owner Age',
    'Ownership Type',
    'Specializations',
    'Niches',
    'Employee Estimate',
    'Fleet Size',
    'Overall Score',
    'Revenue Proxy Score',
    'Online Weakness Score',
    'Acquisition Fit Score',
    'Growth Signals Score',
    'Recommendation',
    'Review Count',
    'Average Rating',
    'License Number',
    'License Status',
    'Discovery Source',
    'Created Date',
    'Updated Date',
  ];

  const rows = prospects.map((p) => {
    const score = p.scores?.[0];
    const employee = p.employees?.[0];
    const fleet = p.fleet?.[0];
    const license = p.licenses?.[0];

    // Aggregate reviews
    const totalReviews = p.reviews?.reduce((sum, r) => sum + r.reviewCount, 0) || 0;
    const avgRating =
      p.reviews && p.reviews.length > 0
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
        : null;

    return [
      escapeCSV(p.name),
      escapeCSV(p.city),
      escapeCSV(p.county),
      escapeCSV(p.state),
      escapeCSV(p.address || ''),
      escapeCSV(p.phone || ''),
      escapeCSV(p.email || ''),
      escapeCSV(p.website || ''),
      escapeCSV(p.status),
      p.foundedYear?.toString() || '',
      escapeCSV(p.ownerName || ''),
      p.ownerAge?.toString() || '',
      escapeCSV(p.ownershipType || ''),
      escapeCSV(p.specializations?.join('; ') || ''),
      escapeCSV(p.niches?.join('; ') || ''),
      employee?.estimatedCount?.toString() || '',
      fleet?.vehicleCount?.toString() || '',
      score?.overallScore?.toString() || '',
      score?.revenueProxyScore?.toString() || '',
      score?.onlineWeaknessScore?.toString() || '',
      score?.acquisitionFitScore?.toString() || '',
      score?.growthSignalsScore?.toString() || '',
      escapeCSV(score?.recommendation || ''),
      totalReviews.toString(),
      avgRating?.toFixed(1) || '',
      escapeCSV(license?.licenseNumber || ''),
      escapeCSV(license?.status || ''),
      escapeCSV(p.discoverySource || ''),
      formatDateForCSV(p.createdAt),
      formatDateForCSV(p.updatedAt),
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Generate detailed export with all related data
 */
export function prospectsToDetailedCSV(prospects: ExportableProspect[]): string {
  const headers = [
    'Business ID',
    'Business Name',
    'Legal Name',
    'DBA',
    'City',
    'County',
    'State',
    'Zip Code',
    'Full Address',
    'Latitude',
    'Longitude',
    'Service Radius (miles)',
    'Phone',
    'Email',
    'Website',
    'Facebook',
    'LinkedIn',
    'Instagram',
    'Status',
    'Founded Year',
    'Years in Business',
    'Owner Name',
    'Owner Age',
    'Ownership Type',
    'Generation',
    'Succession Status',
    'Specializations',
    'Niches',
    'Service Types',
    'Employee Estimate',
    'Employee Range Min',
    'Employee Range Max',
    'Employee Confidence',
    'Fleet Size',
    'Fleet Confidence',
    'Overall Score',
    'Revenue Proxy Score',
    'Online Weakness Score',
    'Acquisition Fit Score',
    'Growth Signals Score',
    'Recommendation',
    'Google Reviews',
    'Google Rating',
    'Yelp Reviews',
    'Yelp Rating',
    'BBB Reviews',
    'BBB Rating',
    'Total Reviews',
    'Average Rating',
    'Permit Count (12 mo)',
    'License Numbers',
    'License Types',
    'License Status',
    'Certifications',
    'Associations',
    'Discovery Source',
    'Discovery Job ID',
    'Qualified Date',
    'Contacted Date',
    'Created Date',
    'Updated Date',
  ];

  const rows = prospects.map((p) => {
    const score = p.scores?.[0];
    const employee = p.employees?.[0];
    const fleet = p.fleet?.[0];
    const currentYear = new Date().getFullYear();

    // Get reviews by source
    const googleReview = p.reviews?.find((r) => r.source === 'GOOGLE');
    const yelpReview = p.reviews?.find((r) => r.source === 'YELP');
    const bbbReview = p.reviews?.find((r) => r.source === 'BBB');
    const totalReviews = p.reviews?.reduce((sum, r) => sum + r.reviewCount, 0) || 0;
    const avgRating =
      p.reviews && p.reviews.length > 0
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
        : null;

    // Count recent permits
    const recentPermits =
      p.permits?.filter((permit) => {
        if (!permit.issueDate) return false;
        const issueDate = new Date(permit.issueDate);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return issueDate >= oneYearAgo;
      }).length || 0;

    return [
      escapeCSV(p.id),
      escapeCSV(p.name),
      escapeCSV(p.legalName || ''),
      escapeCSV(p.dba || ''),
      escapeCSV(p.city),
      escapeCSV(p.county),
      escapeCSV(p.state),
      escapeCSV(p.zipCode || ''),
      escapeCSV(p.address || ''),
      p.latitude?.toString() || '',
      p.longitude?.toString() || '',
      p.serviceRadius?.toString() || '',
      escapeCSV(p.phone || ''),
      escapeCSV(p.email || ''),
      escapeCSV(p.website || ''),
      escapeCSV(p.facebookUrl || ''),
      escapeCSV(p.linkedinUrl || ''),
      escapeCSV(p.instagramUrl || ''),
      escapeCSV(p.status),
      p.foundedYear?.toString() || '',
      p.foundedYear ? (currentYear - p.foundedYear).toString() : '',
      escapeCSV(p.ownerName || ''),
      p.ownerAge?.toString() || '',
      escapeCSV(p.ownershipType || ''),
      p.generation?.toString() || '',
      escapeCSV(p.successionStatus || ''),
      escapeCSV(p.specializations?.join('; ') || ''),
      escapeCSV(p.niches?.join('; ') || ''),
      escapeCSV(p.serviceTypes?.join('; ') || ''),
      employee?.estimatedCount?.toString() || '',
      employee?.minCount?.toString() || '',
      employee?.maxCount?.toString() || '',
      employee?.confidence?.toFixed(2) || '',
      fleet?.vehicleCount?.toString() || '',
      fleet?.confidence?.toFixed(2) || '',
      score?.overallScore?.toString() || '',
      score?.revenueProxyScore?.toString() || '',
      score?.onlineWeaknessScore?.toString() || '',
      score?.acquisitionFitScore?.toString() || '',
      score?.growthSignalsScore?.toString() || '',
      escapeCSV(score?.recommendation || ''),
      googleReview?.reviewCount?.toString() || '',
      googleReview?.rating?.toFixed(1) || '',
      yelpReview?.reviewCount?.toString() || '',
      yelpReview?.rating?.toFixed(1) || '',
      bbbReview?.reviewCount?.toString() || '',
      bbbReview?.rating?.toFixed(1) || '',
      totalReviews.toString(),
      avgRating?.toFixed(1) || '',
      recentPermits.toString(),
      escapeCSV(p.licenses?.map((l) => l.licenseNumber).join('; ') || ''),
      escapeCSV(p.licenses?.map((l) => l.licenseType).join('; ') || ''),
      escapeCSV(p.licenses?.map((l) => l.status).join('; ') || ''),
      escapeCSV(p.certifications?.map((c) => c.name).join('; ') || ''),
      escapeCSV(p.associations?.map((a) => a.organization).join('; ') || ''),
      escapeCSV(p.discoverySource || ''),
      escapeCSV(p.discoveryJobId || ''),
      formatDateForCSV(p.qualifiedAt),
      formatDateForCSV(p.contactedAt),
      formatDateForCSV(p.createdAt),
      formatDateForCSV(p.updatedAt),
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Trigger CSV download in browser
 */
export function downloadCSV(
  csvContent: string,
  filename: string = 'prospects.csv'
): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Escape CSV field value
 */
function escapeCSV(value: string): string {
  if (!value) return '';

  // If value contains comma, newline, or quote, wrap in quotes
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    // Escape existing quotes by doubling them
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

/**
 * Format date for CSV
 */
function formatDateForCSV(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0]; // YYYY-MM-DD format
}
