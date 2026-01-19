import { ProspectTable } from '@/components/prospects';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { Download, Plus } from 'lucide-react';

export default function ProspectsPage() {
  // In a real app, this would fetch from the database
  const prospects: never[] = [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prospects</h1>
          <p className="text-gray-500">
            View and manage discovered HVAC businesses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Link href="/research/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Research
            </Button>
          </Link>
        </div>
      </div>

      {/* Prospect Table */}
      <ProspectTable prospects={prospects} />
    </div>
  );
}
