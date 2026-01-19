'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Badge,
  Button,
  Input,
  Select,
} from '@/components/ui';
import {
  formatDate,
  formatStatus,
  getStatusColor,
  getRecommendationColor,
  getScoreColor,
} from '@/lib/utils';
import type { BusinessWithRelations, Score, BusinessStatus, Recommendation } from '@/types';
import {
  ArrowUpDown,
  Search,
  ExternalLink,
  MapPin,
  Phone,
  Building2,
} from 'lucide-react';

interface ProspectWithScore extends BusinessWithRelations {
  scores?: Score[];
}

interface ProspectTableProps {
  prospects: ProspectWithScore[];
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, string>) => void;
}

export function ProspectTable({
  prospects,
  onSort,
  onFilter,
}: ProspectTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [recommendationFilter, setRecommendationFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('overallScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter prospects
  const filteredProspects = prospects.filter((p) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = p.name.toLowerCase().includes(query);
      const matchesCity = p.city.toLowerCase().includes(query);
      const matchesCounty = p.county.toLowerCase().includes(query);
      if (!matchesName && !matchesCity && !matchesCounty) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;

    // Recommendation filter
    const latestScore = p.scores?.[0];
    if (
      recommendationFilter !== 'all' &&
      latestScore?.recommendation !== recommendationFilter
    ) {
      return false;
    }

    return true;
  });

  // Sort prospects
  const sortedProspects = [...filteredProspects].sort((a, b) => {
    const aScore = a.scores?.[0];
    const bScore = b.scores?.[0];

    let comparison = 0;
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'city':
        comparison = a.city.localeCompare(b.city);
        break;
      case 'overallScore':
        comparison = (aScore?.overallScore || 0) - (bScore?.overallScore || 0);
        break;
      case 'createdAt':
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      default:
        comparison = 0;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    onSort?.(field, sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'DISCOVERED', label: 'Discovered' },
    { value: 'RESEARCHING', label: 'Researching' },
    { value: 'QUALIFIED', label: 'Qualified' },
    { value: 'DISQUALIFIED', label: 'Disqualified' },
    { value: 'CONTACTED', label: 'Contacted' },
  ];

  const recommendationOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'HIGH_PRIORITY', label: 'High Priority' },
    { value: 'MEDIUM_PRIORITY', label: 'Medium Priority' },
    { value: 'LOW_PRIORITY', label: 'Low Priority' },
    { value: 'NOT_RECOMMENDED', label: 'Not Recommended' },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search businesses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        />
        <Select
          options={recommendationOptions}
          value={recommendationFilter}
          onChange={(e) => setRecommendationFilter(e.target.value)}
          className="w-44"
        />
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500">
        Showing {sortedProspects.length} of {prospects.length} prospects
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-gray-900"
                >
                  Business
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('city')}
                  className="flex items-center gap-1 hover:text-gray-900"
                >
                  Location
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">
                <button
                  onClick={() => handleSort('overallScore')}
                  className="flex items-center gap-1 hover:text-gray-900"
                >
                  Score
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProspects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No prospects found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              sortedProspects.map((prospect) => {
                const latestScore = prospect.scores?.[0];
                return (
                  <TableRow key={prospect.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <Link
                          href={`/prospects/${prospect.id}`}
                          className="font-medium text-gray-900 hover:underline"
                        >
                          {prospect.name}
                        </Link>
                        {prospect.specializations &&
                          prospect.specializations.length > 0 && (
                            <div className="flex gap-1">
                              {prospect.specializations.slice(0, 2).map((s) => (
                                <Badge key={s} variant="secondary" className="text-xs">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span>
                          {prospect.city}, {prospect.county}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(prospect.status)}>
                        {formatStatus(prospect.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {latestScore ? (
                        <span
                          className={`font-semibold ${getScoreColor(latestScore.overallScore)}`}
                        >
                          {latestScore.overallScore}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {latestScore ? (
                        <Badge
                          className={getRecommendationColor(latestScore.recommendation)}
                        >
                          {formatStatus(latestScore.recommendation)}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        {prospect.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <a
                              href={`tel:${prospect.phone}`}
                              className="hover:underline"
                            >
                              {prospect.phone}
                            </a>
                          </div>
                        )}
                        {prospect.website && (
                          <div className="flex items-center gap-1">
                            <ExternalLink className="h-3 w-3 text-gray-400" />
                            <a
                              href={prospect.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline truncate max-w-[120px]"
                            >
                              Website
                            </a>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/prospects/${prospect.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
