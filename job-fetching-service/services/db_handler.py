from config.db_config import get_connection
from services.skill_extractor import SkillExtractor
import dateparser
from datetime import datetime

def parse_relative_date(date_str):
    if not date_str or date_str.lower() == "unknown":
        return None
    return dateparser.parse(date_str)

def store_jobs(jobs):
    """Store job listings in PostgreSQL database."""
    conn = get_connection()
    cur = conn.cursor()
    skill_extractor = SkillExtractor()

    for job in jobs:
        # Extract fields
        company = job.get("company", "Unknown Company")
        title = job.get("title", "No Title")
        location = job.get("location", "Unknown Location")
        pay = job.get("salaryRange", "Not Disclosed")
        description = job.get("description", "No Description")
        employment_type = job.get("employmentType", "Unknown")
        date_posted = parse_relative_date(job.get("datePosted", "1970-01-01"))
        job_provider = job.get("jobProviders", [{}])[0].get("jobProvider", "Unknown")
        job_url = job.get("jobProviders", [{}])[0].get("url", "#")

        # Insert or find existing company record
        cur.execute("""
            INSERT INTO company (name)
            VALUES (%s)
            ON CONFLICT (name) DO NOTHING
            RETURNING id
        """, (company,))
        company_row = cur.fetchone()

        if company_row is None:
            cur.execute("SELECT id FROM company WHERE name = %s", (company,))
            existing_company = cur.fetchone()
            if existing_company:
                company_id = existing_company[0]
            else:
                print(f"No company found or inserted for {company}. Skipping job: {title}.")
                continue
        else:
            company_id = company_row[0]

        # Insert or find existing location record
        cur.execute("""
            INSERT INTO location (city)
            VALUES (%s)
            ON CONFLICT (city) DO NOTHING
            RETURNING id
        """, (location,))
        location_id_row = cur.fetchone()
        if location_id_row is None:
            cur.execute("SELECT id FROM location WHERE city = %s", (location,))
            loc_existing = cur.fetchone()
            location_id = loc_existing[0] if loc_existing else None
        else:
            location_id = location_id_row[0]

        # Insert job or retrieve existing job ID
        cur.execute("""
            INSERT INTO job (
                company_id, 
                location_id, 
                title, 
                pay, 
                description, 
                employment_type, 
                date_posted, 
                job_provider, 
                job_url
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (title, company_id, location_id, date_posted, job_provider)
            DO NOTHING
            RETURNING id
        """, (
            company_id,
            location_id,
            title,
            pay,
            description,
            employment_type,
            date_posted,
            job_provider,
            job_url
        ))

        job_row = cur.fetchone()
        if job_row is None:
            print(f"Job might already exist. Searching for existing job_id for: {title}")
            # Coulds use IS NOT DISTINCT FROM if NULL
            cur.execute("""
                SELECT id
                FROM job
                WHERE title = %s
                  AND company_id = %s
                  AND location_id IS NOT DISTINCT FROM %s
                  AND date_posted IS NOT DISTINCT FROM %s
                  AND job_provider = %s
            """, (title, company_id, location_id, date_posted, job_provider))

            existing = cur.fetchone()
            if existing is None:
                print(f"No matching job found for '{title}'. Skipping skill extraction.")
                continue
            else:
                job_id = existing[0]
                print(f"Found existing job_id: {job_id} for '{title}'")
        else:
            job_id = job_row[0]
            print(f"Inserted new job: '{title}', job_id={job_id}")

        # Commit job insertion or fallback retrieval
        conn.commit()

        # --- Extract and Store Skills ---
        skills = skill_extractor.extract_skills(description)
        if job_id is None:
            print(f"Skipping skill extraction: No valid job_id for '{title}'")
            continue

        if not skills:
            print(f"ℹNo skills extracted for job '{title}'.")
        else:
            print(f"Extracted skills for '{title}': {skills}")

        skill_extractor.store_skills(job_id, skills)

    # Commit all changes and close the database connection
    conn.commit()
    conn.close()