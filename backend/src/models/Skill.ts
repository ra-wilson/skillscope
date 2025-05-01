export interface Skill {
  id: number;
  name: string;
  category: string;
  description?: string;
  demand_count: number;
  last_updated: Date;
}

export interface SkillStatistics {
  skill: string;
  category: string;
  demand: number;
  total_demand: number;
} 

export interface SkillGrowthRecord {
  date: string;
  postings_count: number;
  growth_rate: number | null;
}