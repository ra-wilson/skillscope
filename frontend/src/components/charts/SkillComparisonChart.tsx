import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SkillComparisonData {
  name: string;
  current: number;
  target: number;
}

interface SkillComparisonChartProps {
  data: SkillComparisonData[];
  title: string;
  description: string;
}

export const SkillComparisonChart = ({ data, title, description }: SkillComparisonChartProps) => {
  return (
    <Card className="border-border">
      <CardHeader className="bg-muted pb-4">
        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-4">{description}</p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="current" fill="#8884d8" name="Current Level" />
              <Bar dataKey="target" fill="#82ca9d" name="Target Level" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 