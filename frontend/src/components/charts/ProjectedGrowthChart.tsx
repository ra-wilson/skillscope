import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';


export interface ProjectionRow {
  skill: string;
  current: number;
  projected: number;
  percent: number | null;
}

interface Props {
  projectionData: ProjectionRow[];
  filters?: string[];
  selectedCategory?: string;
  onCategoryChange?: (c: string | undefined) => void;
  topN?: number;
  onTopNChange?: (n: number) => void;
  height?: number;
}

const COLORS = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728',
  '#9467bd', '#8c564b', '#e377c2', '#7f7f7f',
  '#bcbd22', '#17becf'
];

export default function ProjectedGrowthSlopeChart({
  projectionData,
  filters,
  selectedCategory,
  onCategoryChange,
  topN = 5,
  onTopNChange,
  height = 300,
}: Props) {
  if (!Array.isArray(projectionData) || projectionData.length === 0) {
    return <div className="text-sm text-gray-600">No projection data available.</div>;
  }

  // Sort by absolute percent change and take topN
  const sorted = [...projectionData].sort((a, b) => {
    const aAbs = a.percent === null ? 0 : Math.abs(a.percent);
    const bAbs = b.percent === null ? 0 : Math.abs(b.percent);
    return bAbs - aAbs;
  }).slice(0, topN);

  if (sorted.length === 0) {
    return <div className="text-sm text-gray-600">No significant changes to display.</div>;
  }

  // Prepare flat data for a horizontal bar chart of percent change
  const chartData = sorted.map(row => ({
    skill: row.skill,
    percent: row.percent ?? 0,
  }));

  return (
    <Card className="overflow-hidden border-border">
      <CardHeader className="bg-muted pb-4">
        <CardTitle>Growth Projections</CardTitle>
        <CardDescription className="text-muted-foreground">
          Shows percentage growth from current to projected values for top movers.
        </CardDescription>
        {filters && filters.length > 0 && onCategoryChange && (
          <div className="flex space-x-2 mt-2">
            <Select
              value={selectedCategory ?? 'all'}
              onValueChange={val => onCategoryChange(val === 'all' ? undefined : val)}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {filters.map(f => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {onTopNChange && (
              <Select
                value={(topN ?? 5).toString()}
                onValueChange={val => onTopNChange(Number(val))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Top N" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15].map(n => (
                    <SelectItem key={n} value={n.toString()}>Top {n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0 pt-6 bg-card">
        <div style={{ width: '100%', height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 20, right: 40, left: 80, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                tickFormatter={v => `${v}%`}
                domain={[0, 'dataMax']}
              />
              <YAxis type="category" dataKey="skill" width={100} />
              <Tooltip formatter={(val: number) => `${val.toFixed(2)}%`} />
              <Bar dataKey="percent" barSize={12}>
                {chartData.map((entry, idx) => (
                  <Cell
                    key={entry.skill}
                    fill={entry.percent >= 0 ? COLORS[idx % COLORS.length] : '#7f7f7f'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}