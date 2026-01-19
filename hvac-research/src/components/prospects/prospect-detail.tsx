'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Badge,
  Button,
} from '@/components/ui';
import { ScoreBreakdown } from './score-breakdown';
import {
  formatDate,
  formatStatus,
  getStatusColor,
  getRecommendationColor,
} from '@/lib/utils';
import type { BusinessWithRelations, Score } from '@/types';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Building2,
  Users,
  Truck,
  Calendar,
  User,
  Award,
  FileText,
  Star,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface ProspectDetailProps {
  business: BusinessWithRelations;
  score?: Score;
}

export function ProspectDetail({ business, score }: ProspectDetailProps) {
  const latestEmployeeEstimate = business.employees?.[0];
  const latestFleetEstimate = business.fleet?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
          <div className="flex items-center gap-2 mt-1 text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>
              {business.city}, {business.county} County, {business.state}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(business.status)}>
            {formatStatus(business.status)}
          </Badge>
          {score && (
            <Badge className={getRecommendationColor(score.recommendation)}>
              {formatStatus(score.recommendation)}
            </Badge>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Business Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {business.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Address</div>
                      <div className="text-sm text-gray-600">
                        {business.address}
                        <br />
                        {business.city}, {business.state} {business.zipCode}
                      </div>
                    </div>
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Phone</div>
                      <a
                        href={`tel:${business.phone}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {business.phone}
                      </a>
                    </div>
                  </div>
                )}
                {business.email && (
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Email</div>
                      <a
                        href={`mailto:${business.email}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {business.email}
                      </a>
                    </div>
                  </div>
                )}
                {business.website && (
                  <div className="flex items-start gap-2">
                    <Globe className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Website</div>
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Visit Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Business Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Business Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {business.foundedYear && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Founded</div>
                      <div className="text-sm text-gray-600">
                        {business.foundedYear} (
                        {new Date().getFullYear() - business.foundedYear} years)
                      </div>
                    </div>
                  </div>
                )}
                {business.ownerName && (
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Owner</div>
                      <div className="text-sm text-gray-600">
                        {business.ownerName}
                        {business.ownerAge && ` (Age ${business.ownerAge})`}
                      </div>
                    </div>
                  </div>
                )}
                {business.ownershipType && (
                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Ownership</div>
                      <div className="text-sm text-gray-600">
                        {formatStatus(business.ownershipType)}
                      </div>
                    </div>
                  </div>
                )}
                {latestEmployeeEstimate && (
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Employees</div>
                      <div className="text-sm text-gray-600">
                        ~{latestEmployeeEstimate.estimatedCount}
                        {latestEmployeeEstimate.minCount &&
                          latestEmployeeEstimate.maxCount &&
                          ` (${latestEmployeeEstimate.minCount}-${latestEmployeeEstimate.maxCount})`}
                      </div>
                    </div>
                  </div>
                )}
                {latestFleetEstimate && (
                  <div className="flex items-start gap-2">
                    <Truck className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Fleet Size</div>
                      <div className="text-sm text-gray-600">
                        ~{latestFleetEstimate.vehicleCount} vehicles
                      </div>
                    </div>
                  </div>
                )}
                {business.serviceRadius && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Service Area</div>
                      <div className="text-sm text-gray-600">
                        {business.serviceRadius} mile radius
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Specializations */}
          {(business.specializations?.length > 0 || business.niches?.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Services & Specializations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {business.specializations?.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Specializations</div>
                      <div className="flex flex-wrap gap-2">
                        {business.specializations.map((s) => (
                          <Badge key={s} variant="secondary">
                            {formatStatus(s)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {business.niches?.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Niches</div>
                      <div className="flex flex-wrap gap-2">
                        {business.niches.map((n) => (
                          <Badge key={n} variant="outline">
                            {formatStatus(n)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Licenses */}
          {business.licenses && business.licenses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Licenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {business.licenses.map((license) => (
                    <div
                      key={license.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium">
                            {license.licenseType} - {license.licenseNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            Expires: {formatDate(license.expirationDate)}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={
                          license.status === 'ACTIVE' ? 'success' : 'secondary'
                        }
                      >
                        {license.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          {business.reviews && business.reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Online Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {business.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-yellow-400" />
                        <div>
                          <div className="font-medium">{review.source}</div>
                          <div className="text-sm text-gray-500">
                            {review.reviewCount} reviews
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-semibold">
                        {review.rating.toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Score */}
        <div className="space-y-6">
          {score ? (
            <ScoreBreakdown score={score} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-sm">
                  This business has not been scored yet.
                </p>
                <Button className="mt-4 w-full">Run Scoring</Button>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Discovered</span>
                <span>{formatDate(business.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span>{formatDate(business.updatedAt)}</span>
              </div>
              {business.discoverySource && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Source</span>
                  <span>{formatStatus(business.discoverySource)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
