import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ChartDataPoint {
  [key: string]: any;
}

/**
 * Props for the SkillLineChart
 */
interface SkillLineChartProps {
  // Array of data objects 
  data: ChartDataPoint[];

  title?: string;

  // X axis data
  xKey?: string;

  // Y axis data
  yKey?: string;

  color?: string;

  // chart container height
  height?: number;

  filters?: string[];
  selectedFilter?: string;
  onFilterChange?: (filter: string) => void;

  description?: string;
}

const SkillLineChart: React.FC<SkillLineChartProps> = ({
  data,
  title,
  xKey = 'date',
  yKey = 'count',
  color = '#499B6A',
  height = 300,
  filters,
  selectedFilter,
  onFilterChange,
  description,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <Card className="overflow-hidden border-border">
      <CardHeader className="bg-muted pb-4">
        {title && <CardTitle className="text-lg text-foreground">{title}</CardTitle>}
        {description && <CardDescription className="text-muted-foreground">{description}</CardDescription>}
        {filters && onFilterChange && (
          <Tabs value={selectedFilter} onValueChange={onFilterChange} className="mt-2">
            <TabsList className="bg-background/50 h-8">
              {filters.map(filter => (
                <TabsTrigger key={filter} value={filter} className="h-6 px-3 text-xs">
                  {filter}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </CardHeader>
      <CardContent className="p-0 pt-6 bg-card">
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? '#2d2d2d' : '#f0f0f0'}
              />
              <XAxis
                dataKey={xKey}
                stroke={isDark ? '#666' : '#ccc'}
              />
              <YAxis
                stroke={isDark ? '#666' : '#ccc'}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1a1a1a' : '#fff',
                  border: `1px solid ${isDark ? '#333' : '#eee'}`,
                  borderRadius: '4px',
                  color: isDark ? '#e1e1e1' : '#333',
                }}
              />
              <Legend
                wrapperStyle={{
                  color: isDark ? '#e1e1e1' : '#333',
                }}
              />
              <Line
                type="monotone"
                dataKey={yKey}
                name="Number of Postings"
                stroke={color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillLineChart;