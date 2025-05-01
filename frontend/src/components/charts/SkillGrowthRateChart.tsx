import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SkillGrowthRecord {
  date: string;
  postings_count: number;
}

interface ExtendedGrowthRecord extends SkillGrowthRecord {
  change: number;
}

interface PercentageRecord {
  date: string;
  percentage: number;
}

interface SkillGrowthRateChartProps {
  skills: string[];
  defaultSkill?: string;
  height?: number;
  color?: string;
}

export default function SkillGrowthRateChart({
  skills,
  defaultSkill = '',
  height = 300,
  color = '#499B6A',
}: SkillGrowthRateChartProps) {
  const [selectedSkill, setSelectedSkill] = useState(defaultSkill);
  const [viewMode, setViewMode] = useState<'net_change' | 'percentage'>('net_change');
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Pick initial skill
  useEffect(() => {
    if (!selectedSkill && skills.length > 0) {
      setSelectedSkill(skills[0]);
    }
  }, [selectedSkill, skills]);

  // Fetch data based on view mode
  useEffect(() => {
    if (!selectedSkill) return;
    setIsLoading(true);

    const fetchData = async () => {
      try {
        let endpoint = '';
        if (viewMode === 'net_change') {
          endpoint = `/api/skills/growth/skill/${encodeURIComponent(selectedSkill)}`;
          const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`);
          const json = await res.json();
          if (json.status === 'success') {
            const rawData: SkillGrowthRecord[] = json.data;
            const withChange = rawData.map((row, index) => {
              if (index === 0) return { ...row, change: 0 };
              const diff = row.postings_count - rawData[index - 1].postings_count;
              return { ...row, change: diff };
            });
            setChartData(withChange);
          }
        } else {
          endpoint = `/api/skills/percentage/${encodeURIComponent(selectedSkill)}`;
          const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`);
          const json = await res.json();
          if (json.status === 'success') {
            const data: PercentageRecord[] = json.data;
            setChartData(data);
          }
        }
      } catch (err) {
        console.error('Error fetching chart data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedSkill, viewMode]);

  return (
    <Card className="p-0 border border-border rounded-md shadow-sm bg-card">
      <CardHeader className="bg-muted p-4">
        <CardTitle className="text-lg">
          {viewMode === 'net_change' ? 'Postings & Change' : 'Market Share (%)'} for {selectedSkill}
        </CardTitle>
        <CardDescription>Select a skill and view your preferred metric</CardDescription>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
          {/* Skill select */}
          <div className="flex-1">
            <Select value={selectedSkill} onValueChange={setSelectedSkill}>
              <SelectTrigger id="skill-select" className="w-full">
                <SelectValue placeholder="Select a skill" />
              </SelectTrigger>
              <SelectContent>
                {skills.map(skill => (  
                  <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* View mode tabs */}
          <Tabs value={viewMode} onValueChange={val => setViewMode(val as 'net_change' | 'percentage')} className="flex-1">
            <TabsList className="bg-background/50 h-8">
              <TabsTrigger value="net_change" className="h-6 px-3 text-xs">Net Change</TabsTrigger>
              <TabsTrigger value="percentage" className="h-6 px-3 text-xs">Market Share %</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      {isLoading && <p className="text-muted-foreground text-sm">Loading data...</p>}

      {!isLoading && chartData.length === 0 && (
        <p className="text-sm text-muted-foreground">No data available for this skill.</p>
      )}

      {!isLoading && chartData.length > 0 && (
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="date" stroke="#999" />
              <Tooltip />
              <Legend />

              {viewMode === 'net_change' ? (
                <>
                  <YAxis yAxisId="left" stroke="#999" />
                  <YAxis yAxisId="right" orientation="right" stroke="#999" />

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Postings"
                    yAxisId="left"
                  />
                  <Line
                    type="monotone"
                    dataKey="change"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Change (+/-)"
                    yAxisId="right"
                  />
                </>
              ) : (
                <>
                  <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} stroke="#999" />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Market Share %"
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}