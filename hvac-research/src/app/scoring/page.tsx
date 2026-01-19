import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Progress,
} from '@/components/ui';

export default function ScoringPage() {
  const scoringConfig = {
    weights: {
      revenueProxy: 30,
      onlineWeakness: 25,
      acquisitionFit: 25,
      growthSignals: 20,
    },
    thresholds: {
      highPriority: 75,
      mediumPriority: 50,
      lowPriority: 25,
    },
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scoring Configuration</h1>
        <p className="text-gray-500">
          View and configure how businesses are scored for acquisition fit
        </p>
      </div>

      {/* Weight Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Component Weights</CardTitle>
          <CardDescription>
            How each scoring component contributes to the overall score
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            {
              name: 'Revenue Proxy',
              description: 'Estimates if revenue is in $1M-$10M range',
              weight: scoringConfig.weights.revenueProxy,
              color: 'bg-blue-500',
            },
            {
              name: 'Online Weakness',
              description: 'Opportunity to improve digital presence',
              weight: scoringConfig.weights.onlineWeakness,
              color: 'bg-purple-500',
            },
            {
              name: 'Acquisition Fit',
              description: 'Family-owned, succession ready, niche focus',
              weight: scoringConfig.weights.acquisitionFit,
              color: 'bg-green-500',
            },
            {
              name: 'Growth Signals',
              description: 'Permit trends, hiring, fleet growth',
              weight: scoringConfig.weights.growthSignals,
              color: 'bg-orange-500',
            },
          ].map((component) => (
            <div key={component.name} className="space-y-2">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{component.name}</div>
                  <div className="text-sm text-gray-500">
                    {component.description}
                  </div>
                </div>
                <div className="font-semibold">{component.weight}%</div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${component.color}`}
                  style={{ width: `${component.weight}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Thresholds</CardTitle>
          <CardDescription>
            Score ranges for each recommendation level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <div className="flex-1">
                <div className="font-medium text-green-800">High Priority</div>
                <div className="text-sm text-green-600">
                  Score {scoringConfig.thresholds.highPriority}+ - Strong
                  acquisition candidates
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="flex-1">
                <div className="font-medium text-yellow-800">Medium Priority</div>
                <div className="text-sm text-yellow-600">
                  Score {scoringConfig.thresholds.mediumPriority}-
                  {scoringConfig.thresholds.highPriority - 1} - Worth
                  investigating
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="h-3 w-3 rounded-full bg-orange-500" />
              <div className="flex-1">
                <div className="font-medium text-orange-800">Low Priority</div>
                <div className="text-sm text-orange-600">
                  Score {scoringConfig.thresholds.lowPriority}-
                  {scoringConfig.thresholds.mediumPriority - 1} - May not fit
                  criteria
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="flex-1">
                <div className="font-medium text-red-800">Not Recommended</div>
                <div className="text-sm text-red-600">
                  Score below {scoringConfig.thresholds.lowPriority} - Does not
                  meet acquisition criteria
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Factor Details */}
      <Card>
        <CardHeader>
          <CardTitle>Scoring Factors</CardTitle>
          <CardDescription>
            Detailed breakdown of scoring criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">Revenue Proxy Indicators</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>- Employee count (5-50 ideal)</li>
                <li>- Fleet size (3-20 vehicles)</li>
                <li>- Permit volume (50-400/year)</li>
                <li>- Service area coverage</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Online Weakness Indicators</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>- Website quality (missing or outdated)</li>
                <li>- Social media presence</li>
                <li>- Review volume and platforms</li>
                <li>- SEO/search visibility</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Acquisition Fit Indicators</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>- Ownership type (family preferred)</li>
                <li>- Years in business (10-30 optimal)</li>
                <li>- Niche specialization</li>
                <li>- Owner age/succession status</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Growth Signal Indicators</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>- Permit trend (YoY comparison)</li>
                <li>- Review count growth</li>
                <li>- Hiring activity</li>
                <li>- Fleet expansion</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
