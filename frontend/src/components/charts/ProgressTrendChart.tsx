import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrendData {
  date: string;
  value: number;
}

interface ProgressTrendChartProps {
  data: TrendData[];
  title: string;
  description: string;
}

export const ProgressTrendChart = ({ data, title, description }: ProgressTrendChartProps) => {
  return (
    <Card className="border-border">
      <CardHeader className="bg-muted pb-4">
        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-4">{description}</p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 