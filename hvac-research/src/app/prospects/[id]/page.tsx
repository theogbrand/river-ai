import { ProspectDetail } from '@/components/prospects';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Trash2 } from 'lucide-react';
import { notFound } from 'next/navigation';

interface ProspectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProspectPage({ params }: ProspectPageProps) {
  const { id } = await params;

  // In a real app, this would fetch from the database
  // const business = await prisma.business.findUnique({
  //   where: { id },
  //   include: {
  //     licenses: true,
  //     permits: true,
  //     reviews: true,
  //     employees: { orderBy: { createdAt: 'desc' }, take: 1 },
  //     fleet: { orderBy: { createdAt: 'desc' }, take: 1 },
  //     certifications: true,
  //     associations: true,
  //     scores: { orderBy: { createdAt: 'desc' }, take: 1 },
  //   },
  // });

  const business = null; // Placeholder

  if (!business) {
    notFound();
  }

  const score = undefined; // business.scores?.[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/prospects"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Prospects
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Re-Score
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Detail View */}
      <ProspectDetail business={business} score={score} />
    </div>
  );
}
