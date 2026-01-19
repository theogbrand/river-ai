'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Button,
  Input,
  Select,
} from '@/components/ui';
import { ArrowLeft, Play, Info } from 'lucide-react';
import Link from 'next/link';

const TEXAS_COUNTIES = [
  { value: 'Harris', label: 'Harris County (Houston)' },
  { value: 'Dallas', label: 'Dallas County (Dallas)' },
  { value: 'Tarrant', label: 'Tarrant County (Fort Worth)' },
  { value: 'Bexar', label: 'Bexar County (San Antonio)' },
  { value: 'Travis', label: 'Travis County (Austin)' },
  { value: 'Collin', label: 'Collin County (Plano)' },
  { value: 'Denton', label: 'Denton County' },
  { value: 'Fort Bend', label: 'Fort Bend County' },
  { value: 'Montgomery', label: 'Montgomery County' },
  { value: 'Williamson', label: 'Williamson County' },
];

const JOB_TYPES = [
  { value: 'REGION_DISCOVERY', label: 'Region Discovery' },
  { value: 'BUSINESS_ENRICHMENT', label: 'Business Enrichment' },
  { value: 'PERMIT_SCAN', label: 'Permit Scan' },
  { value: 'REVIEW_UPDATE', label: 'Review Update' },
];

export default function NewResearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCounty = searchParams.get('county') || '';

  const [jobName, setJobName] = useState('');
  const [jobType, setJobType] = useState('REGION_DISCOVERY');
  const [county, setCounty] = useState(preselectedCounty);
  const [city, setCity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real app, this would call the API
      // const response = await fetch('/api/research', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: jobName || `${county} County Discovery`,
      //     type: jobType,
      //     parameters: {
      //       region: { county, city: city || undefined },
      //     },
      //   }),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.push('/research');
    } catch (error) {
      console.error('Failed to create job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/research"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Research Jobs
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Research Job</h1>
        <p className="text-gray-500">
          Configure a new AI-powered business discovery job
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Job Configuration</CardTitle>
            <CardDescription>
              Set up the parameters for your research job
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Job Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Job Name (optional)
              </label>
              <Input
                placeholder="e.g., Houston Metro HVAC Discovery"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Leave blank for auto-generated name
              </p>
            </div>

            {/* Job Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Type</label>
              <Select
                options={JOB_TYPES}
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
              />
            </div>

            {/* County */}
            <div className="space-y-2">
              <label className="text-sm font-medium">County *</label>
              <Select
                options={[{ value: '', label: 'Select a county' }, ...TEXAS_COUNTIES]}
                value={county}
                onChange={(e) => setCounty(e.target.value)}
              />
            </div>

            {/* City (Optional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">City (optional)</label>
              <Input
                placeholder="e.g., Houston"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Narrow focus to a specific city within the county
              </p>
            </div>

            {/* Info Box */}
            <div className="flex gap-3 p-4 bg-blue-50 rounded-lg">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">About Deep Research</p>
                <p className="mt-1">
                  This job uses OpenAI&apos;s Deep Research to autonomously
                  search for HVAC businesses. Jobs typically take 10-30 minutes
                  to complete and may find 10-50 businesses per county.
                </p>
              </div>
            </div>

            {/* Estimated Cost */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Estimated API Cost</span>
                <span className="font-medium">~$2-5 per job</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Estimated Duration</span>
                <span className="font-medium">10-30 minutes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4 mt-6">
          <Link href="/research">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={!county || isSubmitting}>
            <Play className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Creating...' : 'Start Research'}
          </Button>
        </div>
      </form>
    </div>
  );
}
