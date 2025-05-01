import { skillCategories } from '@/data/assessmentOptions';

export function getCategoryForSkill(skillName: string): string {
  for (const categoryObj of skillCategories) {
    if (categoryObj.skills.some(s => s.name === skillName)) {
      return categoryObj.name; 
    }
  }
  return 'Other';
}