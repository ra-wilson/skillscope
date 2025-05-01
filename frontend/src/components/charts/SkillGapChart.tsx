import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';

export interface Gap {
  skill: string;
  userLevel: number;
  targetLevel: number;
  gap: number;
  trend: number;
}

interface SkillGapChartProps {
  title: string;
  description?: string;
  data: Gap[];
  height?: number;
}

const SkillGapChart: React.FC<SkillGapChartProps> = ({
  title,
  description,
  data,
  height = 300,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Card className="overflow-hidden border-border">
      <CardHeader className="bg-muted pb-4">
        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
        {description && (
          <CardDescription className="text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-0 pt-6 bg-card">
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2d2d2d' : '#f0f0f0'} />
            <XAxis
              dataKey="skill"
              angle={-45}
              textAnchor="end"
              interval={0}
              height={60}
              tick={{ fill: isDark ? '#e1e1e1' : '#333', fontSize: 12 }}
              stroke={isDark ? '#666' : '#ccc'}
            />
            <YAxis tick={{ fill: isDark ? '#e1e1e1' : '#333' }} stroke={isDark ? '#666' : '#ccc'} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1a1a1a' : '#fff',
                border: `1px solid ${isDark ? '#333' : '#f0f0f0'}`,
                borderRadius: '4px',
                color: isDark ? '#e1e1e1' : '#333',
              }}
            />
            <Legend wrapperStyle={{ color: isDark ? '#e1e1e1' : '#333' }} />
            <Bar
              dataKey="userLevel"
              name="Your Level (%)"
              fill={isDark ? '#4ade80' : '#22c55e'}
              barSize={20}
            />
            <Line
              type="monotone"
              dataKey="targetLevel"
              name="Target Level (%)"
              stroke={isDark ? '#93c5fd' : '#60a5fa'}
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SkillGapChart;