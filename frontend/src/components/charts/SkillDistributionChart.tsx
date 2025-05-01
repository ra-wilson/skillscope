import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useState, useMemo } from 'react';
import { skillCategories } from '@/data/assessmentOptions';

interface SkillDistributionData {
  name: string;
  value: number;
  category?: string;
}

interface SkillDistributionChartProps {
  data: SkillDistributionData[];
  title: string;
  description: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export const SkillDistributionChart = ({ data, title, description }: SkillDistributionChartProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showTopN, setShowTopN] = useState<number>(5);

  // Get unique categories from data
  const categories = useMemo(() => {
    const uniqueCats = new Set(data.map(item => item.category).filter(Boolean));
    return ['all', ...Array.from(uniqueCats)];
  }, [data]);

  // Filter and sort data based on selected category and showTopN
  const filteredData = useMemo(() => {
    let filtered = data;
    if (selectedCategory !== 'all') {
      filtered = data.filter(item => item.category === selectedCategory);
    }
    return filtered
      .sort((a, b) => b.value - a.value)
      .slice(0, showTopN);
  }, [data, selectedCategory, showTopN]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleShowTopNChange = (value: string) => {
    setShowTopN(Number(value));
  };

  return (
    <Card className="border-border">
      <CardHeader className="bg-muted pb-4">
        <CardTitle className="text-lg text-foreground">{title}</CardTitle>
        <p className="text-sm text-muted-foreground mt-4">{description}</p>
        <div className="flex gap-4 mt-4">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={showTopN.toString()} onValueChange={handleShowTopNChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Show top N" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Top 5</SelectItem>
              <SelectItem value="10">Top 10</SelectItem>
              <SelectItem value="15">Top 15</SelectItem>
              <SelectItem value="20">Top 20</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => {
                  const percentage = (percent * 100).toFixed(0);
                  return `${name} (${percentage}%)`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value} users`, 'Count']}
              />
              <Legend 
                layout="vertical" 
                align="right" 
                verticalAlign="middle"
                wrapperStyle={{ paddingLeft: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 