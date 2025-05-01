from services.job_fetcher import fetch_jobs
from services.db_handler import store_jobs


if __name__ == "__main__":
    print("Fetching jobs...")
    job_listings = fetch_jobs()

    if job_listings:
        print(f"Fetched {len(job_listings)} job postings. Storing in database...")
        try:
            store_jobs(job_listings)
        except Exception as e:
            print(f"Job Fetcher failed: {e}")
        print("Job postings stored successfully!")
    else:
        print("No jobs found.")