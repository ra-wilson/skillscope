import re
from typing import List, Dict, Set
from config.db_config import get_connection

class SkillExtractor:
    def __init__(self):
        self.skill_keywords = {
            'Frontend': {
                'React', 'Vue.js', 'Angular', 'JavaScript', 'TypeScript', 'HTML5', 'CSS3',
                'SCSS', 'SASS', 'Tailwind CSS', 'Bootstrap', 'jQuery', 'Webpack', 'Babel'
            },
            'Backend': {
                'Node.js', 'Express', 'Python', 'Django', 'Flask', 'Java', 'Spring Boot',
                'Ruby', 'Ruby on Rails', 'PHP', 'Laravel', 'Go', 'Rust', 'C#', '.NET'
            },
            'Database': {
                'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server',
                'Firebase', 'DynamoDB', 'Elasticsearch', 'Cassandra'
            },
            'DevOps': {
                'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Jenkins',
                'GitLab', 'GitHub Actions', 'Terraform', 'Ansible', 'Prometheus', 'Grafana'
            }
        }
        
    def extract_skills(self, description: str) -> List[Dict[str, str]]:
        """Extract skills from job description text."""
        description = description.lower()
        found_skills = set()
        
        # Extract skills using keyword matching
        for category, skills in self.skill_keywords.items():
            for skill in skills:
                # Look for skill mentions with word boundaries
                pattern = r'\b' + re.escape(skill.lower())
                if re.search(pattern, description):
                    found_skills.add((skill, category))
        
        for fs in found_skills:
            print("Matched skill:", fs)
        # Convert to list of dictionaries
        return [{'name': skill, 'category': category} for skill, category in found_skills]

    def store_skills(self, job_id: int, skills: List[Dict[str, str]]):
        """Store extracted skills in the database."""
        conn = get_connection()
        cur = conn.cursor()
        
        try:
            for skill_data in skills:
                # Insert or update skill
                cur.execute("""
                    INSERT INTO skill (name, category)
                    VALUES (%s, %s)
                    ON CONFLICT (name) 
                    DO UPDATE SET 
                        category = EXCLUDED.category,
                        demand_count = skill.demand_count + 1,
                        last_updated = CURRENT_TIMESTAMP
                    RETURNING id
                """, (skill_data['name'], skill_data['category']))
                
                skill_id = cur.fetchone()[0]
                
                # Create job-skill mapping
                cur.execute("""
                    INSERT INTO job_skill (job_id, skill_id)
                    VALUES (%s, %s)
                    ON CONFLICT DO NOTHING
                """, (job_id, skill_id))
            
            conn.commit()
            
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    def get_skill_statistics(self) -> List[Dict]:
        """Get skill statistics for visualization."""
        conn = get_connection()
        cur = conn.cursor()
        
        try:
            cur.execute("""
                SELECT 
                    s.name,
                    s.category,
                    COUNT(js.job_id) as demand,
                    s.demand_count as total_demand
                FROM skill s
                LEFT JOIN job_skill js ON s.id = js.skill_id
                GROUP BY s.id, s.name, s.category, s.demand_count
                ORDER BY demand DESC
            """)
            
            results = cur.fetchall()
            return [
                {
                    'skill': row[0],
                    'category': row[1],
                    'demand': row[2],
                    'total_demand': row[3]
                }
                for row in results
            ]
            
        finally:
            conn.close() 