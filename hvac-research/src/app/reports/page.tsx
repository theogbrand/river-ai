'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Button,
  Select,
  Badge,
} from '@/components/ui';
import { Download, FileText, Filter } from 'lucide-react';

export default function ReportsPage() {
  const [exportType, setExportType] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const exportOptions = [
    { value: 'all', label: 'All Prospects' },
    { value: 'qualified', label: 'Qualified Only' },
    { value: 'high_priority', label: 'High Priority Only' },
    { value: 'contacted', label: 'Contacted' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'HIGH_PRIORITY', label: 'High Priority' },
    { value: 'MEDIUM_PRIORITY', label: 'Medium Priority' },
    { value: 'LOW_PRIORITY', label: 'Low Priority' },
  ];

  const handleExport = (detailed: boolean) => {
    // In a real app, this would call the export function
    console.log('Exporting:', { exportType, priorityFilter, detailed });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Export</h1>
        <p className="text-gray-500">
          Export prospect data and generate reports
        </p>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export to CSV</CardTitle>
          <CardDescription>
            Download prospect data for use in spreadsheets or CRM systems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status Filter</label>
              <Select
                options={exportOptions}
                value={exportType}
                onChange={(e) => setExportType(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority Filter</label>
              <Select
                options={priorityOptions}
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-4">
            <Button onClick={() => handleExport(false)}>
              <Download className="h-4 w-4 mr-2" />
              Export Standard CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export Detailed CSV
            </Button>
          </div>

          {/* Export Info */}
          <div className="p-4 bg-gray-50 rounded-lg text-sm">
            <div className="font-medium mb-2">CSV Contents</div>
            <div className="grid gap-2 md:grid-cols-2 text-gray-600">
              <div>
                <div className="font-medium text-gray-700">Standard Export:</div>
                <ul className="mt-1 space-y-0.5">
                  <li>- Business name, location, contact</li>
                  <li>- Overall score and recommendation</li>
                  <li>- Employee/fleet estimates</li>
                  <li>- Review summary</li>
                </ul>
              </div>
              <div>
                <div className="font-medium text-gray-700">Detailed Export:</div>
                <ul className="mt-1 space-y-0.5">
                  <li>- All standard fields</li>
                  <li>- Component score breakdown</li>
                  <li>- License and certification details</li>
                  <li>- Permit counts and trends</li>
                  <li>- All social media URLs</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Data Summary</CardTitle>
          <CardDescription>
            Overview of your prospect database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-gray-500">Total Prospects</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-500">High Priority</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-500">Qualified</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm font-medium mb-3">By County</div>
            <div className="space-y-2">
              {[
                { county: 'Harris', count: 0 },
                { county: 'Dallas', count: 0 },
                { county: 'Tarrant', count: 0 },
                { county: 'Bexar', count: 0 },
                { county: 'Travis', count: 0 },
              ].map((item) => (
                <div
                  key={item.county}
                  className="flex justify-between items-center py-2 border-b last:border-0"
                >
                  <span>{item.county} County</span>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Templates (Future) */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
          <CardDescription>
            Pre-configured reports for common use cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                name: 'Acquisition Target List',
                description: 'High-priority prospects with full details',
                icon: FileText,
              },
              {
                name: 'Market Analysis',
                description: 'Summary of HVAC market by region',
                icon: FileText,
              },
              {
                name: 'Outreach Ready',
                description: 'Qualified prospects with contact info',
                icon: FileText,
              },
              {
                name: 'Score Comparison',
                description: 'Side-by-side scoring breakdown',
                icon: FileText,
              },
            ].map((template) => (
              <div
                key={template.name}
                className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg opacity-50"
              >
                <template.icon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="font-medium">{template.name}</div>
                  <div className="text-sm text-gray-500">
                    {template.description}
                  </div>
                  <Badge variant="outline" className="mt-2 text-xs">
                    Coming Soon
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
