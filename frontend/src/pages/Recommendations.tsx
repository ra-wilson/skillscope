// Recommendations page providing course suggestions based on skill gaps and market demand insights
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DataChart from '@/components/charts/DataChart';
import SkillGapChart from '@/components/charts/SkillGapChart';
import coursesData from '@/data/courses.json';
import { useQuery } from '@tanstack/react-query';

// Defines the structure of a course recommendation
interface Course {
  title: string;
  provider: string;
  description: string;
  rating: number;
  duration: string;
  level: string;
  skills: string[];
  link: string;
  category: string;
  image?: string;
  gap?: number;
}

// Extends Course with matchScore indicating relevance based on user gaps
interface CourseWithScore extends Course {
  matchScore: number;
}

// Props for rendering a course recommendation card
interface CourseCardProps {
  title: string;
  provider: string;
  description: string;
  rating: number;
  duration: string;
  level: string;
  skills: string[];
  link: string;
  image?: string;
  gap?: number;
}

// Component displaying individual course details, ratings, and growth indicator
const CourseCard: React.FC<CourseCardProps> = ({
  title,
  provider,
  description,
  rating,
  duration,
  level,
  skills,
  image,
  gap = 0,
  link,
}) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md border border-green-100">
      <div className="flex flex-col h-full">
        <div className="relative pt-4 px-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={image || '/placeholder.svg'} alt={provider} />
                <AvatarFallback>{provider.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-500">{provider}</span>
            </div>
            {gap && gap > 0 && (
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-50 text-green-600">
                +{gap.toFixed(1)}% growth
              </span>
            )}
          </div>
          <CardTitle className="text-lg mb-1">{title}</CardTitle>
          <CardDescription className="line-clamp-2 h-10">{description}</CardDescription>
        </div>
        <CardContent className="flex-grow pt-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <span>{rating.toFixed(1)}/5.0</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span>{duration}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span>{level}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600"
              >
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                +{skills.length - 3} more
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-0 pb-4">
          <Button
            variant="outline"
            className="w-full border-green-300 text-green-700 hover:bg-green-50"
            onClick={() => window.open(link, '_blank')}
          >
            View Course <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};

// Represents skill demand statistic returned by the API
interface SkillStatistic {
  skill: string;
  // Matches API field: "demand"
  demand: number;
}

// Fetches demand statistics for all skills
const fetchSkillStats = async (): Promise<SkillStatistic[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/skills/statistics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch skill statistics: ${response.statusText}`);
  }
  const body = await response.json();
  return body.data as SkillStatistic[];
};

// Represents projected weekly growth percentage for a skill
interface Projection {
  skill: string;
  growth: number;
}

// Fetches projected growth metrics for all skills
const fetchProjectedGrowth = async (): Promise<Projection[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/skills/projection`);
  if (!response.ok) {
    throw new Error(`Failed to fetch projected growth: ${response.statusText}`);
  }
  const body = await response.json();
  return body.data as Projection[];
};

// Represents average user-reported skill level
interface AvgLevel { skill: string; avgLevel: number }

// Fetches average skill levels across users
async function fetchAvgLevels(): Promise<AvgLevel[]> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/skills/average-user-level`);
  if (!res.ok) throw new Error(res.statusText);
  const body = await res.json();
  return body.data as AvgLevel[];
}

// Structure for computed skill gap and trend data
interface Gap {
  skill: string;
  userLevel: number;
  targetLevel: number;    // replacing marketDemand
  gap: number;
  trend: number;
}

// Compute gaps between user skill levels and market/peer benchmarks, filtered by skills to improve
function identifySkillGaps(
  skillStats: SkillStatistic[],
  projections: Projection[],
  avgLevels: AvgLevel[],
  skills: Record<string, number>,
  skillsToImprove: string[]
): Gap[] {
  const avgMap = Object.fromEntries(avgLevels.map(a => [a.skill, a.avgLevel]));

  return skillStats
    .map(stat => {
      const userLevel = skills[stat.skill] || 0;
      const peerAvg = avgMap[stat.skill] || 0;
      const targetLevel = Math.min(peerAvg + 10, 100);
      const projection = projections.find(p => p.skill === stat.skill);
      const trend = projection ? projection.growth : 0;
      return {
        skill: stat.skill,
        userLevel,
        targetLevel,
        gap: Math.max(targetLevel - userLevel, 0),
        trend,
      };
    })
    .filter(g => g.gap > 0 && (g.userLevel > 0 || skillsToImprove.includes(g.skill)))
    .sort((a, b) => b.gap - a.gap);
}

// Component rendering recommendations page, combining skill gap analysis and course suggestions
const Recommendations = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole, skills, skillsToImprove } = useUser();
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = React.useState('all');

  // Redirect unauthenticated or non-individual users to login page
  React.useEffect(() => {
    if (!isAuthenticated || userRole !== 'individual') {
      navigate('/auth?role=individual');
    }
  }, [isAuthenticated, userRole, navigate]);

  const { data: skillStats = [], isLoading: statsLoading } = useQuery<SkillStatistic[], Error>({
    queryKey: ['skillStats'],
    queryFn: fetchSkillStats,
  });
  const { data: projections = [], isLoading: projLoading } = useQuery<Projection[], Error>({
    queryKey: ['projections'],
    queryFn: fetchProjectedGrowth,
  });
  const { data: avgLevels = [] } = useQuery<AvgLevel[], Error>({
    queryKey: ['avgLevels'],
    queryFn: fetchAvgLevels,
  });

  // Show loading indicator while fetching skill statistics or projections
  if (statsLoading || projLoading) {
    return <div>Loading recommendations…</div>;
  }

  const gaps = identifySkillGaps(skillStats, projections, avgLevels, skills, skillsToImprove);

  // Determine recommended courses using selected skills or gap-based match scoring
  const getRecommendedCourses = (category: string): Course[] => {
    // Start with all courses or filter by category
    let filteredCourses: Course[] = coursesData;
    if (category !== 'all') {
      filteredCourses = filteredCourses.filter(course => course.category === category);
    }

    // If user explicitly chose "skills to improve", just filter by that
    if (skillsToImprove.length > 0) {
      filteredCourses = filteredCourses.filter(course =>
        course.skills.some(s => skillsToImprove.includes(s))
      );
      return filteredCourses;
    }

    // Otherwise, compute matchScore for each course based on user skill gaps
    const gapThreshold = 50;
    const userSkillGaps = Object.keys(skills).filter(skill => skills[skill] < gapThreshold);

    // Convert each course to a CourseWithScore
    let scoredCourses: CourseWithScore[] = filteredCourses.map((course) => {
      const gapMatches = course.skills.filter(s => userSkillGaps.includes(s));
      return { ...course, matchScore: gapMatches.length };
    });

    // Filter out any courses that don't match a gap
    scoredCourses = scoredCourses.filter((course) => course.matchScore > 0);

    // Sort descending by matchScore
    scoredCourses.sort((a, b) => b.matchScore - a.matchScore);

    // Return them as the base Course[]
    return scoredCourses;
  };

  // Retrieve recommended courses for the current category filter
  const recommendedCourses = getRecommendedCourses(activeCategory);

  // Render Recommendations layout: navigation, gap analysis, and course listings
  return (
    <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      {/* Site navigation bar */}
      <Navbar />

      {/* Main content container */}
      <main className="flex-grow pt-24 pb-20">
        <div className="container px-6 mx-auto">
          {/* Page header with back navigation */}
          <div className="flex items-center mb-10">
            <Button variant="ghost" className={`mr-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`} onClick={() => navigate('/dashboard/individual')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Recommendations</h1>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Based on your skills assessment and average user proficiency.
              </p>
            </div>
          </div>

          {/* Skill Gap Analysis section */}
          <Card className={`mb-8 overflow-hidden border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-green-100 bg-green-50'}`}>
            <div className={`p-6 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-green-50 text-black'}`}>
              <h2 className="text-xl font-semibold">Skill Gap Analysis</h2>
              <p className="text-sm mt-1">
                Here's where you can improve to meet market demand.
              </p>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {gaps.slice(0, 5).map((item) => (
                    <div key={item.skill} className="space-y-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{item.skill}</span>
                        <span className="text-sm font-medium text-green-600">
                          Gap: {item.gap.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="bg-green-200 h-3"
                          style={{ width: `${item.userLevel}%` }}
                        ></div>
                        <div
                          className="bg-green-500 h-3"
                          style={{ width: `${item.gap}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Your proficiency: {item.userLevel}%</span>
                        <span>Target level: {item.targetLevel}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <SkillGapChart
                  title='Your skill level vs market average'
                    data={gaps.map(item => ({
                      skill: item.skill,
                      userLevel: item.userLevel,
                      targetLevel: item.targetLevel,
                      gap: item.gap,
                      trend: item.trend
                    }))}
                    height={300}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Courses section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recommended Courses</h2>
              <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-auto">
                <TabsList className="grid grid-cols-5 h-auto">
                  <TabsTrigger
                    value="all"
                    className={`text-xs px-3 py-1.5 h-auto data-[state=active]:bg-green-500 data-[state=active]:text-white ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="Frontend"
                    className={`text-xs px-3 py-1.5 h-auto data-[state=active]:bg-green-500 data-[state=active]:text-white ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                  >
                    Frontend
                  </TabsTrigger>
                  <TabsTrigger
                    value="Backend"
                    className={`text-xs px-3 py-1.5 h-auto data-[state=active]:bg-green-500 data-[state=active]:text-white ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                  >
                    Backend
                  </TabsTrigger>
                  <TabsTrigger
                    value="Database"
                    className={`text-xs px-3 py-1.5 h-auto data-[state=active]:bg-green-500 data-[state=active]:text-white ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                  >
                    Database
                  </TabsTrigger>
                  <TabsTrigger
                    value="DevOps"
                    className={`text-xs px-3 py-1.5 h-auto data-[state=active]:bg-green-500 data-[state=active]:text-white ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                  >
                    DevOps
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedCourses.length > 0 ? (
                recommendedCourses.map((course, index) => (
                  <CourseCard
                    key={index}
                    title={course.title}
                    provider={course.provider}
                    description={course.description}
                    rating={course.rating}
                    duration={course.duration}
                    level={course.level}
                    skills={course.skills}
                    link={course.link}
                    image={course.image}
                    gap={course.gap}
                  />
                ))
              ) : (
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  No courses match your current skills to improve. Consider updating your preferences.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Site footer */}
      <Footer />
    </div>
  );
};

export default Recommendations;