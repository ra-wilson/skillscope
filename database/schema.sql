-- Ensure the public schema is used
SET search_path TO public;

-- Company Table: Stores company names to avoid duplicate entries
CREATE TABLE company (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

-- Location Table: Stores job locations (kept for filtering purposes)
CREATE TABLE location (
  id SERIAL PRIMARY KEY,
  city TEXT NOT NULL UNIQUE,
  state TEXT,
  country TEXT DEFAULT 'UK'
);

-- Job Table: Stores job listings from API
CREATE TABLE job (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES company(id) ON DELETE CASCADE,
    location_id INT REFERENCES location(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    pay TEXT,
    description TEXT,
    employment_type TEXT,
    date_posted TIMESTAMP,
    job_provider TEXT,
    job_url TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_job_posting UNIQUE (title, company_id, location_id, date_posted, job_provider)
);

-- Skill Table: Stores extracted skills from job descriptions
CREATE TABLE skill (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    category TEXT,
    description TEXT,
    demand_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job-Skill Mapping Table (Many-to-Many Relationship)
CREATE TABLE job_skill (
    job_id INT REFERENCES job(id) ON DELETE CASCADE,
    skill_id INT REFERENCES skill(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, skill_id)
);

-- Skill Category Table: Stores predefined skill categories
CREATE TABLE skill_category (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT
);

-- Insert predefined skill categories
INSERT INTO skill_category (name, description) VALUES
    ('Frontend', 'Frontend development technologies and frameworks'),
    ('Backend', 'Backend development technologies and frameworks'),
    ('Database', 'Database technologies and management systems'),
    ('DevOps', 'DevOps and cloud technologies'),
    ('Other', 'Other technical skills and tools');