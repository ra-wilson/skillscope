import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

interface DataPoint {
  x: string;
  y: number;
  z?: number;
  [key: string]: any;
}

interface DataChartProps {
  title: string;
  description?: string;
  data: DataPoint[];
  xField: string;
  yField: string;
  compareField?: string;
  filters?: string[];
  height?: number;
}

const DataChart: React.FC<DataChartProps> = ({
  title,
  description,
  data,
  xField,
  yField,
  compareField,
  filters = [],
  height = 350,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [chartData, setChartData] = useState<DataPoint[]>(data);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (activeFilter === 'all') {
      setChartData(data);
    } else {
      setChartData(
        data.filter((item) => 
          (item.category && item.category === activeFilter) || 
          (item.x && item.x.includes(activeFilter))
        )
      );
    }
  }, [activeFilter, data]);

  return (
    <Card className="overflow-hidden border-border">
      <CardHeader className="bg-muted pb-4">
        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
        {description && <CardDescription className="text-muted-foreground">{description}</CardDescription>}
        {filters.length > 0 && (
          <Tabs value={activeFilter} onValueChange={setActiveFilter} className="mt-2">
            <TabsList className="bg-background/50 h-8">
              <TabsTrigger 
                value="all" 
                className="h-6 px-3 text-xs data-[state=active]:bg-background"
              >
                All
              </TabsTrigger>
              {filters.map((filter) => (
                <TabsTrigger 
                  key={filter} 
                  value={filter} 
                  className="h-6 px-3 text-xs data-[state=active]:bg-background"
                >
                  {filter}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </CardHeader>
      <CardContent className="p-0 pt-6 bg-card">
        <div style={{ width: '100%', height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={isDark ? '#2d2d2d' : '#f0f0f0'} 
              />
              <XAxis 
                dataKey={xField} 
                angle={-45} 
                textAnchor="end" 
                tick={{ fontSize: 12, fill: isDark ? '#e1e1e1' : '#333' }}
                height={60}
                stroke={isDark ? '#666' : '#ccc'}
              />
              <YAxis 
                tick={{ fill: isDark ? '#e1e1e1' : '#333' }}
                stroke={isDark ? '#666' : '#ccc'}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1a1a1a' : '#fff',
                  border: `1px solid ${isDark ? '#333' : '#f0f0f0'}`,
                  borderRadius: '4px',
                  color: isDark ? '#e1e1e1' : '#333',
                }}
              />
              <Legend 
                wrapperStyle={{
                  color: isDark ? '#e1e1e1' : '#333',
                }}
              />
              <Bar dataKey={yField} fill="#499B6A" name="Value" />
              {compareField && <Bar dataKey={compareField} fill="#A7CFBB" name="Comparison" />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataChart;
