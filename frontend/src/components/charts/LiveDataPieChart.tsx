// DataPieChart.tsx
import { PieChart, Pie, Tooltip, Cell, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { formatDistanceToNow } from 'date-fns';
import { Clock } from 'lucide-react';

interface PieDataPoint {
  name: string;
  value: number;
  category?: string;
}

interface DataPieChartProps {
  title: string;
  description?: string;
  data: PieDataPoint[];
  filters?: string[];
  lastUpdated?: string;
  height?: number;
}

export interface SkillStatistic {
  skill: string;
  category: string;
  demand: number;
  total_demand: number;
}

const getColorForDataPoint = (index: number, total: number) => {
  // Create a more distinct colour palette with better contrast
  const distinctColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
    '#FF9F40', '#FFCD56', '#C9CBCF', '#4BC0C0', '#FF6384',
    '#36A2EB', '#FFCE56', '#9966FF', '#FF9F40', '#FFCD56'
  ];
  
  // Ensure neighbouring sections have different colours by using a larger step
  const step = Math.max(1, Math.floor(distinctColors.length / total));
  return distinctColors[(index * step) % distinctColors.length];
};

const DataPieChart: React.FC<DataPieChartProps> = ({
  title,
  description,
  data,
  filters = [],
  lastUpdated,
  height = 350
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const [activeFilter, setActiveFilter] = useState('Frontend');
  const [chartData, setChartData] = useState<PieDataPoint[]>(data);
  const [colors, setColors] = useState<string[]>(data.map((_, index) => getColorForDataPoint(index, data.length)));

  useEffect(() => {
    if (activeFilter === 'frontend') {
      setChartData(data);
    } else {
      setChartData(data.filter((item) => item.category === activeFilter));
    }
  }, [activeFilter, data]);

  // Calculate total for percentage calculations
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader className="bg-muted pb-4">
        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {lastUpdated && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <Clock className="h-4 w-4 mr-1" />
            <span>Updated {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}</span>
          </div>
        )}
        {filters.length > 0 && (
          <Tabs value={activeFilter} onValueChange={setActiveFilter} className="mt-2">
            <TabsList className="bg-background/50 h-8">
              {filters.map((filter) => (
                <TabsTrigger key={filter} value={filter} className="h-6 px-3 text-xs">
                  {filter}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </CardHeader>
      <CardContent className="p-6 bg-card">
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, value }) => {
                  const percentage = (value / total) * 100;
                  return percentage > 5 ? `${name} (${percentage.toFixed(0)}%)` : '';
                }}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index]}
                    stroke={isDarkMode ? '#222' : '#fff'}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#222' : '#fff',
                  color: isDarkMode ? '#fff' : '#000',
                  border: `1px solid ${isDarkMode ? '#555' : '#ddd'}`,
                }}
              />
              <Legend
                wrapperStyle={{
                  color: isDarkMode ? '#fff' : '#000',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataPieChart;