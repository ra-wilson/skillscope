import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ComparisonData {
  name: string;
  value: number;
}

interface ProgressComparisonChartProps {
  data: ComparisonData[];
  title: string;
  description: string;
}

export const ProgressComparisonChart = ({ data, title, description }: ProgressComparisonChartProps) => {
  return (
    <Card className="border-border">
      <CardHeader className="bg-muted pb-4">
        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-muted-foreground mt-4">{description}</p>
      </CardContent>
    </Card>
  );
}; 