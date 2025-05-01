// SkillService handles retrieval and computation of skill analytics from PostgreSQL and Firestore
import { Pool } from 'pg';
import { Skill, SkillStatistics } from '../models/Skill';
import { firestore } from '../firebaseAdmin';

// Defines the shape of a projected skill data row, including growth deltas and percentages
export interface ProjectionRow {
  skill: string;
  category: string;
  current: number;
  previous: number;
  delta: number;
  projected: number;
  percent: number | null;
}


// Provides methods to fetch skill statistics, growth metrics, and projections
export class SkillService {
  constructor(private db: Pool) { }

  // Retrieves demand count and total demand for each skill, sorted by highest demand
  async getSkillStatistics(): Promise<SkillStatistics[]> {
    const query = `
      SELECT 
        s.name as skill,
        s.category,
        COUNT(js.job_id) as demand,
        s.demand_count as total_demand
      FROM skill s
      LEFT JOIN job_skill js ON s.id = js.skill_id
      GROUP BY s.id, s.name, s.category, s.demand_count
      ORDER BY demand DESC
    `;

    const result = await this.db.query(query);
    return result.rows;
  }

  // Fetches distinct skill categories available in the database
  async getCategories(): Promise<string[]> {
    const query = 'SELECT DISTINCT category FROM skill ORDER BY category';
    const result = await this.db.query(query);
    return result.rows.map(row => row.category);
  }

  // Returns all skills under a given category, ordered by their demand count
  async getSkillsByCategory(category: string): Promise<Skill[]> {
    const query = `
      SELECT * FROM skill 
      WHERE category = $1 
      ORDER BY demand_count DESC
    `;

    const result = await this.db.query(query, [category]);
    return result.rows;
  }

  // Calculates daily job postings count for a category over time
  async getSkillGrowth(category: string): Promise<{ date: string; value: number }[]> {
    // Can filter for category
    const query = `
      SELECT 
        DATE_TRUNC('day', j.date_posted)::date AS date,
        COUNT(j.id) AS postings_count
      FROM job j
      JOIN job_skill js ON j.id = js.job_id
      JOIN skill s ON s.id = js.skill_id
      WHERE s.category = $1
      GROUP BY DATE_TRUNC('day', j.date_posted)
      ORDER BY DATE_TRUNC('day', j.date_posted)
    `;
    const result = await this.db.query(query, [category]);
    console.log("Running query for category:", category);
    console.log("Query result rows:", result.rows);
    // Remove any records missing a valid date before mapping to output format
    return result.rows
      .filter(row => row.date !== null)
      .map(row => ({
        date: new Date(row.date).toISOString().split('T')[0],
        value: Number(row.postings_count),
      }));
  }

  // Calculates weekly postings and growth rate percentage for a specific skill
  async getSkillGrowthBySkill(skillName: string): Promise<{
    date: string;
    postings_count: number;
    growth_rate: number | null;
  }[]> {
    const query = `
      SELECT
        DATE_TRUNC('week', j.date_posted)::date AS week_start,
        COUNT(DISTINCT j.id) AS postings_count
      FROM job j
      JOIN job_skill js ON j.id = js.job_id
      JOIN skill s ON s.id = js.skill_id
      WHERE s.name = $1
      GROUP BY 1
      ORDER BY 1
    `;

    const result = await this.db.query(query, [skillName]);

    // Filter out any rows with null week_start
    const validRows = result.rows.filter(row => row.week_start !== null);

    return validRows.map((row, index) => {
      const currentCount = Number(row.postings_count);

      // For the first week, there is no previous data point to compare, so growth_rate is null
      if (index === 0) {
        return {
          date: new Date(row.week_start).toISOString().split('T')[0],
          postings_count: currentCount,
          growth_rate: null,
        };
      }

      // Calculate growth compared to the previous week's postings
      const prevCount = Number(validRows[index - 1].postings_count);
      const growth = prevCount > 0 ? ((currentCount - prevCount) / prevCount) * 100 : null;

      return {
        date: new Date(row.week_start).toISOString().split('T')[0],
        postings_count: currentCount,
        growth_rate: growth !== null ? parseFloat(growth.toFixed(2)) : null,
      };
    });
  }

  // Computes weekly percentage of total job postings that mention a given skill
  async getSkillPercentageOverTime(skillName: string): Promise<{ date: string; percentage: number }[]> {
    const query = `
      WITH skill_count AS (
        SELECT 
          DATE_TRUNC('week', j.date_posted) AS week_start,
          COUNT(DISTINCT j.id) AS skill_jobs
        FROM job j
        JOIN job_skill js ON j.id = js.job_id
        JOIN skill s ON s.id = js.skill_id
        WHERE LOWER(s.name) = LOWER($1)
        AND j.date_posted IS NOT NULL
        GROUP BY 1
      ),
      total_count AS (
        SELECT 
          DATE_TRUNC('week', j.date_posted) AS week_start,
          COUNT(DISTINCT j.id) AS total_jobs
        FROM job j
        WHERE j.date_posted IS NOT NULL
        GROUP BY 1
      )
      SELECT 
        skill_count.week_start::date AS date,
        CASE 
          WHEN total_count.total_jobs > 0 THEN 
            ROUND((skill_count.skill_jobs::numeric / total_count.total_jobs::numeric) * 100, 2)
          ELSE 0
        END AS percentage
      FROM skill_count
      JOIN total_count USING (week_start)
      ORDER BY week_start;
    `;

    try {
      const result = await this.db.query(query, [skillName.trim()]);

      const rows = result.rows.filter(r => r.date !== null);
      return rows.map(r => ({
        date: new Date(r.date).toISOString().split('T')[0],
        percentage: Number(r.percentage),
      }));
    } catch (err) {
      throw err;
    }
  }

  // Projects future postings count for each skill based on recent weekly growth rates
  async getProjectedGrowth(category?: string): Promise<ProjectionRow[]> {
    const sql = `
      WITH weekly_counts AS (
        SELECT
          s.id          AS skill_id,
          s.name        AS skill,
          s.category    AS category,
          DATE_TRUNC('week', j.date_posted)::date AS week_start,
          COUNT(DISTINCT j.id) AS postings_count
        FROM job j
        JOIN job_skill js ON js.job_id = j.id
        JOIN skill s      ON s.id = js.skill_id
        WHERE j.date_posted IS NOT NULL
          AND j.date_posted >= NOW() - INTERVAL '8 weeks'
          AND ($1::text IS NULL OR s.category = $1)
        GROUP BY s.id, s.name, s.category, week_start
        ORDER BY s.id, week_start
      ),
      skill_weeks AS (
        SELECT
          skill_id,
          skill,
          category,
          week_start,
          postings_count,
          LAG(postings_count) OVER (PARTITION BY skill_id ORDER BY week_start) AS prev_count,
          LAG(week_start) OVER (PARTITION BY skill_id ORDER BY week_start) AS prev_week
        FROM weekly_counts
      ),
      latest_weeks AS (
        SELECT DISTINCT ON (skill_id)
          skill,
          category,
          postings_count AS current,
          COALESCE(prev_count, 0) AS previous,
          (postings_count - COALESCE(prev_count, 0)) AS delta,
          CASE
            WHEN COALESCE(prev_count, 0) > 0 THEN
              ROUND(((postings_count - prev_count)::numeric / prev_count) * 100, 2)
            ELSE
              NULL
          END AS growth_rate
        FROM skill_weeks
        ORDER BY skill_id, week_start DESC
      )
      SELECT
        skill,
        category,
        current,
        previous,
        delta,
        CASE
          WHEN growth_rate IS NOT NULL THEN
            (current + (current * growth_rate / 100))::integer
          ELSE
            current
        END AS projected,
        growth_rate AS percent
      FROM latest_weeks
      ORDER BY COALESCE(growth_rate, 0) DESC NULLS LAST, skill;
    `;

    const { rows } = await this.db.query(sql, [category ?? null]);


    return rows.map((r: any) => ({
      skill: r.skill,
      category: r.category,
      current: Number(r.current),
      previous: Number(r.previous),
      delta: Number(r.delta),
      projected: Number(r.projected),
      percent: r.percent === null ? null : Number(r.percent),
    }));
  }

  // Aggregates user-reported skill levels from Firestore and computes average level per skill
  async getAverageUserLevels(): Promise<{ skill: string; avgLevel: number }[]> {
    const db = firestore;
    // fetch all users
    const usersSnap = await db.collection('users').get();
    const skillSums: Record<string, { total: number; count: number }> = {};

    // for each user, read their skills subcollection
    await Promise.all(usersSnap.docs.map(async userDoc => {
      const skillsSnap = await db
        .collection('users')
        .doc(userDoc.id)
        .collection('skills')
        .get();

      skillsSnap.forEach(snap => {
        const lvl = snap.data().level as number;
        const skill = snap.id;
        if (!skillSums[skill]) skillSums[skill] = { total: 0, count: 0 };
        skillSums[skill].total += lvl;
        skillSums[skill].count += 1;
      });
    }));

    // build the response array
    return Object.entries(skillSums).map(([skill, { total, count }]) => ({
      skill,
      avgLevel: Math.round((total / count) * 100) / 100
    }));
  }
}
