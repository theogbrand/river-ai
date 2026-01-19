'use client';

import { Card, CardHeader, CardTitle, CardContent, Badge, Progress } from '@/components/ui';
import { getScoreColor, getRecommendationColor, formatStatus } from '@/lib/utils';
import type { Score, ScoreBreakdown as ScoreBreakdownType } from '@/types';
import {
  TrendingUp,
  Globe,
  Building2,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { useState } from 'react';

interface ScoreBreakdownProps {
  score: Score;
}

export function ScoreBreakdown({ score }: ScoreBreakdownProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const breakdown = score.breakdown as ScoreBreakdownType;

  const sections = [
    {
      key: 'revenueProxy',
      title: 'Revenue Proxy',
      icon: DollarSign,
      score: score.revenueProxyScore,
      weight: 30,
      data: breakdown.revenueProxy,
      description: 'Estimated revenue in $1M-$10M range based on operational indicators',
    },
    {
      key: 'onlineWeakness',
      title: 'Online Weakness',
      icon: Globe,
      score: score.onlineWeaknessScore,
      weight: 25,
      data: breakdown.onlineWeakness,
      description: 'Opportunity to improve digital presence (higher = more opportunity)',
    },
    {
      key: 'acquisitionFit',
      title: 'Acquisition Fit',
      icon: Building2,
      score: score.acquisitionFitScore,
      weight: 25,
      data: breakdown.acquisitionFit,
      description: 'Alignment with ideal acquisition target profile',
    },
    {
      key: 'growthSignals',
      title: 'Growth Signals',
      icon: TrendingUp,
      score: score.growthSignalsScore,
      weight: 20,
      data: breakdown.growthSignals,
      description: 'Business growth and market position indicators',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Overall Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-bold ${getScoreColor(score.overallScore)}`}>
                {score.overallScore}
              </span>
              <span className="text-gray-500">/ 100</span>
            </div>
            <Badge
              className={`text-sm ${getRecommendationColor(score.recommendation)}`}
            >
              {formatStatus(score.recommendation)}
            </Badge>
          </div>
          <Progress value={score.overallScore} max={100} className="mt-4" />
          <p className="mt-2 text-sm text-gray-500">
            Scoring config version: {score.configVersion}
          </p>
        </CardContent>
      </Card>

      {/* Component Scores */}
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSection === section.key;

          return (
            <Card key={section.key} className="overflow-hidden">
              <CardHeader
                className="pb-2 cursor-pointer hover:bg-gray-50"
                onClick={() =>
                  setExpandedSection(isExpanded ? null : section.key)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-gray-500" />
                    <CardTitle className="text-base">{section.title}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {section.weight}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-2xl font-bold ${getScoreColor(section.score)}`}
                    >
                      {section.score}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{section.description}</p>
              </CardHeader>

              {isExpanded && section.data && (
                <CardContent className="pt-0 border-t">
                  <div className="space-y-3 mt-4">
                    {section.data.factors.map((factor, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{factor.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">
                              {typeof factor.value === 'string'
                                ? factor.value
                                : factor.value}
                            </span>
                            <span
                              className={`font-semibold ${getScoreColor(factor.score)}`}
                            >
                              {factor.score}
                            </span>
                          </div>
                        </div>
                        <Progress
                          value={factor.score}
                          max={100}
                          className="h-1.5"
                        />
                        <p className="text-xs text-gray-500">
                          {factor.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Score Interpretation */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-gray-500" />
            <CardTitle className="text-base">Score Interpretation</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-sm md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Priority Thresholds</h4>
              <ul className="space-y-1 text-gray-600">
                <li className="flex justify-between">
                  <span>High Priority:</span>
                  <span className="text-green-600 font-medium">75+</span>
                </li>
                <li className="flex justify-between">
                  <span>Medium Priority:</span>
                  <span className="text-yellow-600 font-medium">50-74</span>
                </li>
                <li className="flex justify-between">
                  <span>Low Priority:</span>
                  <span className="text-orange-600 font-medium">25-49</span>
                </li>
                <li className="flex justify-between">
                  <span>Not Recommended:</span>
                  <span className="text-red-600 font-medium">&lt;25</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Component Weights</h4>
              <ul className="space-y-1 text-gray-600">
                <li className="flex justify-between">
                  <span>Revenue Proxy:</span>
                  <span className="font-medium">30%</span>
                </li>
                <li className="flex justify-between">
                  <span>Online Weakness:</span>
                  <span className="font-medium">25%</span>
                </li>
                <li className="flex justify-between">
                  <span>Acquisition Fit:</span>
                  <span className="font-medium">25%</span>
                </li>
                <li className="flex justify-between">
                  <span>Growth Signals:</span>
                  <span className="font-medium">20%</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
