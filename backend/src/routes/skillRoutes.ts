// Defines API endpoints for skill operations and delegates to SkillService
import { Router, Request, Response } from 'express';
import { SkillService } from '../services/skillService';
import pool from '../config/database';

// Initialise Express router for skill-related routes
const router = Router();
// Create SkillService instance with database connection pool
const skillService = new SkillService(pool);

// GET /statistics: fetch overall skill demand statistics
router.get('/statistics', async (req: Request, res: Response) => {
  try {
    const stats = await skillService.getSkillStatistics();
    return res.json({ status: 'success', data: stats, lastUpdated: new Date().toISOString()});
  } catch (error) {
    console.error('Error fetching skill statistics:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch skill statistics' 
    });
  }
});

// GET /categories: retrieve list of distinct skill categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await skillService.getCategories();
    console.log("Called /categories");
    res.json({ status: 'success', data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch skill categories' 
    });
  }
});

// GET /category/:category: fetch skills under the given category
router.get('/category/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const skills = await skillService.getSkillsByCategory(category);
    res.json({ status: 'success', data: skills });
  } catch (error) {
    console.error('Error fetching skills by category:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch skills by category' 
    });
  }
});

// GET /growth: get daily postings count for a category (requires ?category=)
router.get('/growth', async (req, res) => {
  try {
    const { category } = req.query;
    console.log('/growth API hit with category:', category); 

    // Ensure category query parameter is provided and is a string
    if (!category || typeof category !== 'string') {
      return res.status(400).json({ status: 'error', message: 'Missing or invalid category' });
    }

    const data = await skillService.getSkillGrowth(category);
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error Error in /growth route:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch skill growth' });
  }
});

// GET /growth/skill/:skillName: get weekly postings and growth rate for a skill
router.get('/growth/skill/:skillName', async (req: Request, res: Response) => {
  try {
    const { skillName } = req.params;
    // Validate presence of skillName route parameter
    if (!skillName) {
      return res.status(400).json({ status: 'error', message: 'Missing skillName param' });
    }

    const data = await skillService.getSkillGrowthBySkill(skillName);
    return res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error in /growth/skill route:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch skill growth by skill' });
  }
});

// GET /percentage/:skillName: compute weekly percentage of postings mentioning the skill
router.get('/percentage/:skillName', async (req: Request, res: Response) => {
  try {
    const { skillName } = req.params;
    // Check that skillName parameter is present
    if (!skillName) {
      return res.status(400).json({ status: 'error', message: 'Missing skillName param' });
    }

    const data = await skillService.getSkillPercentageOverTime(skillName);

    return res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error in /percentage/:skillName route:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch skill percentage over time' });
  }
});

// GET /projection: project future postings count based on recent growth
router.get('/projection', async (req: Request, res: Response) => {
  try {
    const category = typeof req.query.category === 'string'
      ? req.query.category
      : undefined;

    const data = await skillService.getProjectedGrowth(category);
    return res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error in /projection route:', error);
    return res
      .status(500)
      .json({ status: 'error', message: 'Failed to fetch projected growth' });
  }
});

// GET /average-user-level: retrieve average user-reported levels for each skill
router.get('/average-user-level', async (req, res) => {
  try {
    const data = await skillService.getAverageUserLevels();
    res.json({ status: 'success', data });
  } catch (err) {
    console.error('Error in /average-user-level:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch averages' });
  }
});

export default router;