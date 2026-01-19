import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui';
import { Button } from '@/components/ui';
import Link from 'next/link';
import {
  Building2,
  Search,
  TrendingUp,
  MapPin,
  ArrowRight,
  Target,
} from 'lucide-react';

export default function DashboardPage() {
  // In a real app, these would come from the database
  const stats = {
    totalProspects: 0,
    highPriority: 0,
    qualified: 0,
    activeJobs: 0,
  };

  const recentActivity = [
    // Would be populated from database
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          Discover underrated HVAC businesses in Texas for acquisition
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Prospects
            </CardTitle>
            <Building2 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProspects}</div>
            <p className="text-xs text-gray-500">Discovered businesses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              High Priority
            </CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.highPriority}
            </div>
            <p className="text-xs text-gray-500">Score 75+</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Qualified
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.qualified}
            </div>
            <p className="text-xs text-gray-500">Ready for outreach</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Jobs
            </CardTitle>
            <Search className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.activeJobs}
            </div>
            <p className="text-xs text-gray-500">Research in progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Start New Research</CardTitle>
            <CardDescription>
              Discover HVAC businesses in Texas counties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { county: 'Harris', city: 'Houston' },
                  { county: 'Dallas', city: 'Dallas' },
                  { county: 'Tarrant', city: 'Fort Worth' },
                  { county: 'Bexar', city: 'San Antonio' },
                ].map((region) => (
                  <Link
                    key={region.county}
                    href={`/research/new?county=${region.county}`}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {region.county} County
                    </Button>
                  </Link>
                ))}
              </div>
              <Link href="/research/new">
                <Button className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Custom Research Job
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Regions</CardTitle>
            <CardDescription>
              Focus areas for acquisition targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: 'Houston Metro',
                  counties: 'Harris, Fort Bend, Montgomery',
                  prospects: 0,
                },
                {
                  name: 'DFW Metroplex',
                  counties: 'Dallas, Tarrant, Collin',
                  prospects: 0,
                },
                {
                  name: 'San Antonio',
                  counties: 'Bexar, Comal',
                  prospects: 0,
                },
                {
                  name: 'Austin',
                  counties: 'Travis, Williamson',
                  prospects: 0,
                },
              ].map((region) => (
                <div
                  key={region.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{region.name}</div>
                    <div className="text-sm text-gray-500">{region.counties}</div>
                  </div>
                  <div className="text-sm font-medium">
                    {region.prospects} prospects
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Follow these steps to find your first acquisition targets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                step: 1,
                title: 'Configure API Keys',
                description:
                  'Add your OpenAI API key and database connection in the .env file',
                href: '/settings',
              },
              {
                step: 2,
                title: 'Start a Research Job',
                description:
                  'Begin discovering HVAC businesses in your target region',
                href: '/research/new',
              },
              {
                step: 3,
                title: 'Review Prospects',
                description:
                  'Analyze discovered businesses and their acquisition scores',
                href: '/prospects',
              },
              {
                step: 4,
                title: 'Export High-Priority Targets',
                description: 'Download qualified prospects as CSV for outreach',
                href: '/reports',
              },
            ].map((item) => (
              <Link
                key={item.step}
                href={item.href}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
