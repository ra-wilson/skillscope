import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code, Database, Server, BarChart2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SkillCard from '@/components/SkillCard';
import DataPieChart, { SkillStatistic } from '@/components/charts/LiveDataPieChart';
import SkillLineChart from '@/components/charts/GrowthLineGraph';
import { skillCategories} from '@/data/assessmentOptions';
import SkillGrowthRateChart from '@/components/charts/SkillGrowthRateChart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from '@/contexts/ThemeContext';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';


// Defines structure for skill growth data points
interface GrowthPoint {
  date: string;
  postings_count: number;
}

// Component rendering individual dashboard with skill assessments and market trends
const IndividualDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole, skills } = useUser();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [skillStats, setSkillStats] = useState<SkillStatistic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  const [selectedCategory, setSelectedCategory] = useState('Backend');
  const [growthData, setGrowthData] = useState<GrowthPoint[]>([]);

  // Redirect unauthenticated or non-individual users to login page
  useEffect(() => {
    if (!isAuthenticated || userRole !== 'individual') {
      navigate('/auth?role=individual');
    }
  }, [isAuthenticated, userRole, navigate]);

  // Fetch skill statistics and update last-updated timestamp
  useEffect(() => {
    const fetchSkillStats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/skills/statistics`);
        const json = await res.json();
        if (json.status === 'success') {
          setSkillStats(json.data);
          if (json.lastUpdated) {
            setLastUpdated(json.lastUpdated);
          }
        } else {
          setError('Failed to load skill statistics');
        }
      } catch (err) {
        console.error('Error fetching skill stats:', err);
        setError('Error fetching skill stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkillStats();
  }, []);

  // Fetch skill growth data when selected category or user authentication changes
  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/skills/growth?category=${selectedCategory}`);
        const json = await res.json();
        if (json.status === 'success') {
          setGrowthData(json.data);
        } else {
          console.error('Failed to load skill growth data');
        }
      } catch (err) {
        console.error('Error fetching skill growth:', err);
      }
    };

    if (isAuthenticated && userRole === 'individual') {
      fetchGrowthData();
    }
  }, [selectedCategory, isAuthenticated, userRole]);

  // Fetch user name
  useEffect(() => {
    const fetchUserName = async () => {
      if (!auth.currentUser) return;
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.name) {
          setUserName(data.name);
        }
      }
    };

    fetchUserName();
  }, []);

  // Show loading state or error message during initial data fetch
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <p className="text-gray-600">Loading skill stats...</p>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  // Prepare data for skill demand pie chart
  const pieChartData = skillStats.map(stat => ({
    name: stat.skill,
    value: Number(stat.demand),
    category: stat.category,
  }));

  // Returns icon component for a given skill category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Frontend': return <Code className="h-5 w-5" />;
      case 'Backend': return <Server className="h-5 w-5" />;
      case 'Database': return <Database className="h-5 w-5" />;
      case 'DevOps': return <BarChart2 className="h-5 w-5" />;
      default: return <Code className="h-5 w-5" />;
    }
  };

  // Extract skill names for growth rate chart
  const availableSkills = skillStats.map(s => s.skill);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="flex-grow pt-24 pb-20">
        <div className="container px-6 mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-foreground mb-2 animate-in from-left">
              {userName ? `${userName}'s Dashboard` : 'Individual Dashboard'}
            </h1>
            <p className="text-muted-foreground animate-in from-left animate-delay-100">
              Track your skill development and view market trends to guide your learning journey.
            </p>
          </div>

          {/* Dashboard grid: assessment panel and market insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Skill assessment panel */}
            <div className="lg:col-span-1 animate-in from-left animate-delay-200">
              <h2 className="text-xl font-semibold text-foreground mb-2">Skill Assessment</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Select a skill category to assess your current proficiency. Use this to track your progress and identify growth areas.
              </p>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {skillCategories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <ScrollArea className="h-[600px] pr-4 mt-6">
                <div className="space-y-4">
                  {skillCategories
                    .find((cat) => cat.name === selectedCategory)
                    ?.skills.map((skill) => (
                      <SkillCard
                        key={skill.name}
                        skill={skill.name}
                        icon={getCategoryIcon(selectedCategory)}
                        initialLevel={0}
                      />
                    ))}
                </div>
              </ScrollArea>
            </div>

            {/* Market insights section */}
            <div className="lg:col-span-2 space-y-8 animate-in from-right animate-delay-300">
              <h2 className="text-xl font-semibold text-foreground mb-4">Market Insights</h2>

              <DataPieChart
                title="Skill Demand (Live)"
                description="Number of job postings referencing specific skills."
                data={pieChartData}
                filters={["Frontend", "Backend", "Database", "DevOps"]}
                height={400}
                lastUpdated={lastUpdated}
              />

              <SkillLineChart
                data={growthData}
                title="Skill Change"
                description='Visualisation of skill category demand changes over time'
                filters={["Backend", "Frontend", "DevOps"]}
                selectedFilter={selectedCategory}
                onFilterChange={setSelectedCategory}
                xKey="date"
                yKey="value"
                color="#499B6A"
                height={300}
              />

              <SkillGrowthRateChart
                skills={availableSkills}
                defaultSkill="React"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Site footer */}
      <Footer />
    </div>
  );
};

export default IndividualDashboard;