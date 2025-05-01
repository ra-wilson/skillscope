import axios from 'axios';

// Extend ImportMeta interface to include required Vite environment variables
// Add type definition for ImportMeta
declare global {
  interface ImportMeta {
    env: {
      VITE_FIREBASE_AUTH_DOMAIN: any;
      VITE_API_URL: string;
    };
  }
}

// Determine base URL for API from environment or fallback to local development server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create an Axios instance with default base URL and JSON content type header
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach authorisation header with JWT token if available
// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Generic response type for API calls, including status, payload, and optional message
// API response types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

// Defines the structure of skill statistics returned by skills endpoints
export interface SkillStatistics {
  skill: string;
  category: string;
  demand: number;
  total_demand: number;
}

// Collection of API endpoint functions, organised by resource areas
// API endpoints
export const endpoints = {
  // Authentication endpoints for login and signup operations
  auth: {
    login: (data: { email: string; password: string }) => 
      api.post('/auth/login', data),
    signup: (data: { email: string; password: string; role: 'individual' | 'institution' }) => 
      api.post('/auth/signup', data),
  },
  // Skill-related endpoints for fetching and updating skill data
  skills: {
    getStatistics: () => 
      api.get<ApiResponse<SkillStatistics[]>>('/api/skills/statistics'),
    getCategories: () => 
      api.get<ApiResponse<string[]>>('/api/skills/categories'),
    getByCategory: (category: string) => 
      api.get<ApiResponse<SkillStatistics[]>>(`/api/skills/category/${category}`),
    getSkillGaps: (userId: string) => api.get(`/skills/gaps/${userId}`),
    updateSkills: (userId: string, skills: Record<string, number>) => 
      api.put(`/skills/${userId}`, { skills }),
  },
  // Course-related endpoints for recommending courses based on filters
  courses: {
    getRecommended: (filters?: { category?: string }) => 
      api.get('/courses/recommended', { params: filters }),
  },
  // Analytics endpoints providing various data summaries and trends
  analytics: {
    getSkillDistribution: () => api.get('/analytics/skill-distribution'),
    getGrowthTrends: () => api.get('/analytics/growth-trends'),
    getDemographics: () => api.get('/analytics/demographics'),
    getSalaryData: () => api.get('/analytics/salary-data'),
  },
} as const;

// Response shape for market data including demand, growth, and salary metrics
export interface MarketDataResponse {
  skill: string;
  demand: number;
  growth: number;
  avgSalary: number;
  category: string;
}

// Structure for representing the gap between user skill level and market demand
export interface SkillGapResponse {
  skill: string;
  userLevel: number;
  marketDemand: number;
  gap: number;
}

// Defines fields for course recommendations returned by the API
export interface CourseResponse {
  id: string;
  title: string;
  provider: string;
  description: string;
  rating: number;
  duration: string;
  level: string;
  skills: string[];
  image?: string;
  gap?: number;
  category: string;
}

// Shape of the authentication response including token and user details
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'individual' | 'institution';
  };
}

// Export the configured Axios instance for use throughout the app
export default api;