import { ResearchJobs } from '@/components/research';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function ResearchPage() {
  // In a real app, this would fetch from the database
  const jobs: never[] = [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Research Jobs</h1>
          <p className="text-gray-500">
            Manage AI-powered business discovery jobs
          </p>
        </div>
        <Link href="/research/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Research Job
          </Button>
        </Link>
      </div>

      {/* Jobs List */}
      <ResearchJobs jobs={jobs} />
    </div>
  );
}
