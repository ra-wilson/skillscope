import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BarChart2, TrendingUp, BookOpen } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DataChart from '../components/charts/DataChart';
import DataPieChart, { SkillStatistic } from '@/components/charts/LiveDataPieChart';
import ProjectedGrowthSlopeChart, { ProjectionRow } from '../components/charts/ProjectedGrowthChart';
import { endpoints, SkillStatistics } from '../lib/api';
import { SkillComparisonChart } from '../components/charts/SkillComparisonChart';
import { SkillDistributionChart } from '../components/charts/SkillDistributionChart';
import { ProgressTimelineChart } from '../components/charts/ProgressTimelineChart';
import { ProgressDistributionChart } from '../components/charts/ProgressDistributionChart';
import SkillGapChart from '../components/charts/SkillGapChart';

// Firestore imports
import { auth, db } from '../lib/firebase';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';

/** Interface for aggregated skill data within an institution */
interface InstitutionSkillAgg {
  skill: string;
  totalLevel: number;
  userCount: number;
  averageLevel: number;
}

/** Interface for tracking skills that need improvement within an institution */
interface InstitutionImproveAgg {
  skill: string;
  count: number;
}

/** Interface for enhanced skill match analysis */
interface SkillMatchAnalysis {
  skill: string;
  matchScore: number;
  skillLevel: number;
  demandLevel: number;
  proximity: number;
  sufficiency: number;
  growthFactor: number;
}

/** Interface for skill gap analysis */
interface SkillGapAnalysis {
  skill: string;
  gap: number;
  matchScore: number;
  priority: number;
}

interface AvgUserLevel {
  skill: string;
  avgLevel: number;
}

/**
 * Institution Dashboard Component
 * Displays analytics and aggregated data for educational institutions.
 * This includes skill statistics, market demand trends, growth projections,
 * and teaching-related aggregated data.
 */
const InstitutionDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useUser();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [skillStats, setSkillStats] = useState<SkillStatistic[]>([]);
  // Holds market-wide skill statistics from the external job pipeline
  const [skillData, setSkillData] = useState<SkillStatistics[]>([]);
  const [marketFilters, setMarketFilters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [institutionName, setInstitutionName] = useState<string>('');

   // Aggregated skills that institution users have marked for improvement
  const [improveAgg, setImproveAgg] = useState<InstitutionImproveAgg[]>([]);
  // Average skill proficiency levels computed across institution users
  const [avgSkillLevels, setAvgSkillLevels] = useState<InstitutionSkillAgg[]>([]);
  // Indicates whether institution-specific skill aggregation is in progress
  const [teachingLoading, setTeachingLoading] = useState(true);

  // Tab state and category filter for multi-skill growth chart.
  const [activeView, setActiveView] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [topN, setTopN] = useState(5);


  const [projectionData, setProjectionData] = useState<ProjectionRow[]>([]);
  const [projectionLoading, setProjectionLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [avgUserLevels, setAvgUserLevels] = useState<AvgUserLevel[]>([]);

  const pieChartData = skillStats.map(stat => ({
    name: stat.skill,
    value: Number(stat.demand),
    category: stat.category,
  }));


  // Redirect unauthenticated or non-institution users to institution login
  useEffect(() => {
    if (!isAuthenticated || userRole !== 'institution') {
      navigate('/auth?role=institution');
    }
  }, [isAuthenticated, userRole, navigate]);

  // Fetch global pipeline skill statistics and set up category filters
  useEffect(() => {
    const fetchSkillData = async () => {
      try {
        const response = await endpoints.skills.getStatistics();
        const skillStats = response.data.data;
        setSkillData(skillStats);

        const categories = Array.from(new Set(skillStats.map((item: SkillStatistics) => item.category)));
        setMarketFilters(categories);
      } catch (err) {
        setError('Failed to fetch skill data');
        console.error('Error fetching skill data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSkillData();
  }, []);

  // Fetch live skill demand statistics and update last-updated timestamp
  useEffect(() => {
    const fetchSkillStats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/skills/statistics`);
        const json = await res.json();
        if (json.status === 'success') {
          setSkillStats(json.data);
          if (json.lastUpdated) {
            setLastUpdated(new Date(json.lastUpdated).toLocaleString());
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

  // Fetch projection data whenever the selected category changes
  useEffect(() => {
    const fetchProjections = async () => {
      setProjectionLoading(true);
      try {
        const q = selectedCategory ? `?category=${encodeURIComponent(selectedCategory)}` : '';
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/skills/projection${q}`);
        const json = await res.json();
        if (json.status === 'success') {
          setProjectionData(json.data);
        } else {
          console.error('Projection fetch failed', json.message);
        }
      } catch (err) {
        console.error('Error fetching projections', err);
      } finally {
        setProjectionLoading(false);
      }
    };

    fetchProjections();
  }, [selectedCategory]);

  // Fetch average user levels across the platform
  useEffect(() => {
    const fetchAvgUserLevels = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/skills/average-user-level`);
        const json = await response.json();
        if (json.status === 'success') {
          setAvgUserLevels(json.data);
        }
      } catch (err) {
        console.error('Error fetching average user levels:', err);
      }
    };

    fetchAvgUserLevels();
  }, []);

  // Fetch institution name
  useEffect(() => {
    const fetchInstitutionName = async () => {
      if (!auth.currentUser) return;
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.institutionName) {
          setInstitutionName(data.institutionName);
        }
      }
    };

    fetchInstitutionName();
  }, []);

  // Aggregate teaching data: user skill levels and skills to improve for the institution
  useEffect(() => {
    const aggregateTeachingData = async () => {
      try {
        if (!auth.currentUser) {
          setTeachingLoading(false);
          return;
        }
        const uid = auth.currentUser.uid;
        const userDocRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userDocRef);
        if (!userSnap.exists()) {
          setTeachingLoading(false);
          return;
        }
        const userData = userSnap.data();
        const institutionId = userData?.institutionId;
        if (!institutionId) {
          setTeachingLoading(false);
          return;
        }
        // Query all users belonging to this institution.
        const usersRef = collection(db, 'users');
        const qUsers = query(usersRef, where('institutionId', '==', institutionId));
        const userSnapAll = await getDocs(qUsers);

        // Prepare aggregation maps.
        const skillMap: Record<string, { totalLevel: number; userCount: number }> = {};
        const improveMap: Record<string, number> = {};

        for (const userDoc of userSnapAll.docs) {
          const uData = userDoc.data();
          // Aggregate "Skills To Improve"
          if (uData?.skillsToImprove && Array.isArray(uData.skillsToImprove)) {
            for (const skill of uData.skillsToImprove) {
              improveMap[skill] = (improveMap[skill] || 0) + 1;
            }
          }
          // Aggregate subcollection skill levels.
          const subRef = collection(db, 'users', userDoc.id, 'skills');
          const subSnap = await getDocs(subRef);
          subSnap.forEach((skillDoc) => {
            const sData = skillDoc.data() as { name: string; level: number };
            if (!sData?.name) return;
            const skillName = skillDoc.id;
            if (!skillMap[skillName]) {
              skillMap[skillName] = { totalLevel: 0, userCount: 0 };
            }
            skillMap[skillName].totalLevel += sData.level;
            skillMap[skillName].userCount += 1;
          });
        }

        // Build aggregated arrays.
        const skillAggArr: InstitutionSkillAgg[] = Object.keys(skillMap).map((skill) => ({
          skill,
          totalLevel: skillMap[skill].totalLevel,
          userCount: skillMap[skill].userCount,
          averageLevel:
            skillMap[skill].userCount > 0
              ? skillMap[skill].totalLevel / skillMap[skill].userCount
              : 0,
        }));
        const improveArr: InstitutionImproveAgg[] = Object.keys(improveMap).map((skill) => ({
          skill,
          count: improveMap[skill],
        }));

        setAvgSkillLevels(skillAggArr);
        setImproveAgg(improveArr);
      } catch (error) {
        console.error('Error aggregating teaching data:', error);
      } finally {
        setTeachingLoading(false);
      }
    };

    aggregateTeachingData();
  }, []);

  // Show loading state while fetching initial data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="text-xl text-muted-foreground">Loading skill data...</div>
      </div>
    );
  }
  // Display error message if any data fetch fails
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="text-xl text-destructive">{error}</div>
      </div>
    );
  }

  // Prepare data for Skills To Improve chart
  const improveData = improveAgg.map((item) => ({
    x: item.skill,
    y: item.count,
  }));

  // Build demand, category and growth maps for match analysis
  const marketDemandMap: Record<string, number> = {};
  const categoryMap: Record<string, string> = {};
  const growthMap: Record<string, number> = {};

  skillData.forEach(s => {
    marketDemandMap[s.skill] = s.demand;
    categoryMap[s.skill] = s.category;
    growthMap[s.skill] = s.total_demand > 0 ? (s.demand > 0 ? s.total_demand / s.demand : 1) : 1;
  });

  const demandValues = Object.values(marketDemandMap);
  const minDemand = demandValues.length ? Math.min(...demandValues) : 0;
  const maxDemand = demandValues.length ? Math.max(...demandValues) : 100;

  const skillLevelValues = avgSkillLevels.map(s => s.averageLevel);
  const minSkill = skillLevelValues.length ? Math.min(...skillLevelValues) : 0;
  const maxSkill = skillLevelValues.length ? Math.max(...skillLevelValues) : 5;

  const normalizeValue = (value: number, min: number, max: number): number => {
    if (max === min) return 50;
    return ((value - min) / (max - min)) * 100;
  };

  // Compute skill match analysis based on proficiency, demand, and growth factors
  const matchAnalysis: SkillMatchAnalysis[] = avgSkillLevels.map(s => {
    const demand = marketDemandMap[s.skill] || 0;
    const normalizedSkillLevel = normalizeValue(s.averageLevel, minSkill, maxSkill);
    const normalizedDemand = normalizeValue(demand, minDemand, maxDemand);
    const proximity = 100 - Math.abs(normalizedSkillLevel - normalizedDemand);
    const sufficiency = s.averageLevel >= demand ? 100 : (s.averageLevel / demand) * 100;
    const matchScore = (proximity * 0.6) + (sufficiency * 0.4);
    const growthFactor = growthMap[s.skill] || 1;
    const growthAdjustedScore = matchScore * (1 + (growthFactor - 1) * 0.3);

    return {
      skill: s.skill,
      matchScore: Math.round(growthAdjustedScore),
      skillLevel: s.averageLevel,
      demandLevel: demand,
      proximity: Math.round(proximity),
      sufficiency: Math.round(sufficiency),
      growthFactor
    };
  });

  const matchData = matchAnalysis.map(item => ({
    x: item.skill,
    y: item.matchScore,
  }));

  // Build average user level map
  const avgUserLevelMap: Record<string, number> = {};
  avgUserLevels.forEach(level => {
    avgUserLevelMap[level.skill] = level.avgLevel;
  });

  // Determine skill gaps and priorities for improvement based on platform averages
  const gapAnalysis: SkillGapAnalysis[] = avgSkillLevels
    .map(skill => {
      const platformAvg = avgUserLevelMap[skill.skill] || 0;
      const gap = platformAvg - skill.averageLevel;
      return {
        skill: skill.skill,
        gap: gap > 0 ? gap : 0,
        matchScore: skill.averageLevel >= platformAvg ? 100 : (skill.averageLevel / platformAvg) * 100,
        priority: gap > 0 ? gap * (growthMap[skill.skill] || 1) : 0,
      };
    })
    .filter(item => item.gap > 0)
    .sort((a, b) => b.priority - a.priority);

  // Calculate category strengths from match scores
  const categoryScores = matchAnalysis.reduce((acc, item) => {
    const category = categoryMap[item.skill];
    // Skip if no category is found
    if (!category) return acc;
    
    if (!acc[category]) {
      acc[category] = { totalScore: 0, count: 0 };
    }
    acc[category].totalScore += item.matchScore;
    acc[category].count += 1;
    return acc;
  }, {} as Record<string, { totalScore: number, count: number }>);

  const categoryMatchData = Object.entries(categoryScores).map(([category, data]) => ({
    x: category,
    y: Math.round(data.totalScore / data.count),
  })).sort((a, b) => b.y - a.y);

  // Render Institution Dashboard layout: Navbar, tabs with charts, and footer
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="flex-grow pt-24 pb-20">
        <div className="container px-6 mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-foreground mb-2 animate-in from-left">
              {institutionName ? `${institutionName}'s Dashboard` : 'Institution Dashboard'}
            </h1>
            <p className="text-muted-foreground animate-in from-left animate-delay-100">
              Analyse market trends and view aggregated skill data to assist your curriculum decisions.
            </p>
          </div>

          <Tabs
            defaultValue={activeView}
            onValueChange={setActiveView}
            className="w-full mb-8 animate-in from-left animate-delay-200"
          >
            <TabsList className="grid grid-cols-3 md:grid-cols-3 h-auto mb-6">
              <TabsTrigger
                value="overview"
                className={`flex items-center py-2 px-3 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground ${isDarkMode ? 'text-white' : 'text-black'}`}
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="skills"
                className={`flex items-center py-2 px-3 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground ${isDarkMode ? 'text-white' : 'text-black'}`}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                <span>Skill Trends</span>
              </TabsTrigger>
              <TabsTrigger
                value="teaching"
                className={`flex items-center py-2 px-3 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground ${isDarkMode ? 'text-white' : 'text-black'}`}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                <span>Teaching</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview tab */}
            <TabsContent value="overview" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DataPieChart
                  title="Skill Demand (Live)"
                  description="Number of job postings referencing each skill"
                  data={pieChartData}
                  filters={["Frontend", "Backend", "Database", "DevOps"]}
                  height={400}
                />
                <ProjectedGrowthSlopeChart
                  projectionData={projectionData}
                  filters={marketFilters}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  topN={topN}
                  onTopNChange={setTopN}
                  height={300}
                />
              </div>
            </TabsContent>

            {/* Skills tab */}
            <TabsContent value="skills" className="mt-0">
              <div className="grid grid-cols-1 gap-6">
                <DataChart
                  title="Skill Demand Trends"
                  description="Market demand for various skills (scale: 0-100)"
                  data={skillData.map((item) => ({
                    x: item.skill,
                    y: item.demand,
                    category: item.category
                  }))}
                  xField="x"
                  yField="y"
                  filters={marketFilters}
                  height={400}
                />
                <ProjectedGrowthSlopeChart
                  projectionData={projectionData}
                  filters={marketFilters}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  topN={topN}
                  onTopNChange={setTopN}
                  height={300}
                />
              </div>
            </TabsContent>

            {/* Teaching tab */}
            <TabsContent value="teaching" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkillComparisonChart
                  title="Skill Levels vs Platform Average"
                  description="Compare your institution's skill levels against the platform average"
                  data={avgSkillLevels.map(skill => ({
                    name: skill.skill,
                    current: skill.averageLevel,
                    target: avgUserLevelMap[skill.skill] || 0
                  }))}
                />

                <SkillGapChart
                  title="Skill Gaps Analysis"
                  description="Identify gaps between your institution's skill levels and platform averages"
                  data={avgSkillLevels.map(skill => ({
                    skill: skill.skill,
                    userLevel: skill.averageLevel,
                    targetLevel: avgUserLevelMap[skill.skill] || 0,
                    gap: Math.max(0, (avgUserLevelMap[skill.skill] || 0) - skill.averageLevel),
                    trend: growthMap[skill.skill] || 1
                  }))}
                  height={400}
                />

                <ProgressDistributionChart
                  title="Skills Distribution"
                  description="Distribution of skills across your institution"
                  data={avgSkillLevels.map(skill => ({
                    name: skill.skill,
                    value: skill.userCount,
                    category: categoryMap[skill.skill] || 'Uncategorised'
                  }))}
                />

                <ProgressTimelineChart
                  title="Skills Growth Over Time"
                  description="Track the progress of skill levels in your institution"
                  data={avgSkillLevels.map((skill, index) => ({
                    date: `Week ${index + 1}`,
                    level: skill.averageLevel,
                    category: categoryMap[skill.skill] || 'Uncategorised'
                  }))}
                />

                <Card className="border-border md:col-span-2">
                  <CardHeader className="bg-muted pb-4">
                    <CardTitle className="text-lg text-foreground">Category Performance</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Overview of performance across different skill categories
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(categoryScores)
                        .filter(([category]) => category !== 'Uncategorised')
                        .map(([category, data]) => (
                          <div key={category} className="p-4 rounded-lg bg-card border border-border">
                            <h3 className="font-semibold mb-2">{category}</h3>
                            <p className="text-2xl font-bold text-primary">
                              {Math.round(data.totalScore / data.count)}%
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Based on {data.count} skills
                            </p>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <SkillDistributionChart
                  title="Skills to Improve"
                  description="Most requested skills for improvement by your users"
                  data={improveAgg.map(item => ({
                    name: item.skill,
                    value: item.count,
                    category: categoryMap[item.skill] || 'Uncategorised'
                  }))}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InstitutionDashboard;