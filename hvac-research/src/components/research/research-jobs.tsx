'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Badge,
  Button,
  Progress,
  Input,
  Select,
} from '@/components/ui';
import { formatDateTime, formatStatus, formatNumber } from '@/lib/utils';
import type { ResearchJob, ResearchJobStatus, ResearchJobType } from '@/types';
import {
  Play,
  Pause,
  RefreshCw,
  Trash2,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';

interface ResearchJobsProps {
  jobs: ResearchJob[];
  onStartJob?: (jobId: string) => void;
  onCancelJob?: (jobId: string) => void;
  onDeleteJob?: (jobId: string) => void;
  onCreateJob?: () => void;
  onRefresh?: () => void;
}

export function ResearchJobs({
  jobs,
  onStartJob,
  onCancelJob,
  onDeleteJob,
  onCreateJob,
  onRefresh,
}: ResearchJobsProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredJobs = jobs.filter((job) => {
    if (statusFilter === 'all') return true;
    return job.status === statusFilter;
  });

  const getStatusIcon = (status: ResearchJobStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'QUEUED':
        return <Clock className="h-4 w-4 text-blue-400" />;
      case 'RUNNING':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: ResearchJobStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-700';
      case 'QUEUED':
        return 'bg-blue-100 text-blue-700';
      case 'RUNNING':
        return 'bg-blue-100 text-blue-700';
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'FAILED':
        return 'bg-red-100 text-red-700';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-500';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeLabel = (type: ResearchJobType) => {
    switch (type) {
      case 'REGION_DISCOVERY':
        return 'Region Discovery';
      case 'BUSINESS_ENRICHMENT':
        return 'Business Enrichment';
      case 'PERMIT_SCAN':
        return 'Permit Scan';
      case 'REVIEW_UPDATE':
        return 'Review Update';
      default:
        return type;
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'RUNNING', label: 'Running' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'FAILED', label: 'Failed' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-36"
          />
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
        {onCreateJob && (
          <Button onClick={onCreateJob}>
            <Plus className="h-4 w-4 mr-2" />
            New Research Job
          </Button>
        )}
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No research jobs found
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <CardTitle className="text-base">{job.name}</CardTitle>
                      <CardDescription>
                        {getTypeLabel(job.type)}
                        {job.parameters?.region?.county &&
                          ` - ${job.parameters.region.county} County`}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(job.status)}>
                    {formatStatus(job.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Progress Bar for Running Jobs */}
                {job.status === 'RUNNING' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium">{job.progress}%</span>
                    </div>
                    <Progress value={job.progress} max={100} />
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <div className="text-gray-500">Found</div>
                    <div className="font-semibold">
                      {formatNumber(job.businessesFound)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Qualified</div>
                    <div className="font-semibold">
                      {formatNumber(job.businessesQualified)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Duration</div>
                    <div className="font-semibold">
                      {job.startedAt && job.completedAt
                        ? formatDuration(
                            new Date(job.completedAt).getTime() -
                              new Date(job.startedAt).getTime()
                          )
                        : job.startedAt
                          ? 'Running...'
                          : '—'}
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {job.error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                    {job.error}
                  </div>
                )}

                {/* Timestamps */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Created: {formatDateTime(job.createdAt)}</span>
                  {job.completedAt && (
                    <span>Completed: {formatDateTime(job.completedAt)}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  {job.status === 'PENDING' && onStartJob && (
                    <Button
                      size="sm"
                      onClick={() => onStartJob(job.id)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                  )}
                  {job.status === 'RUNNING' && onCancelJob && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCancelJob(job.id)}
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                  {(job.status === 'COMPLETED' ||
                    job.status === 'FAILED' ||
                    job.status === 'CANCELLED') &&
                    onDeleteJob && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDeleteJob(job.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}
