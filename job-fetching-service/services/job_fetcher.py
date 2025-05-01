import requests
import json
import time
from config.api_config import RAPIDAPI_KEY, JOBS_ENDPOINT, RAPIDAPI_HOST

HEADERS = {
    "X-RapidAPI-Key": RAPIDAPI_KEY,
    "X-RapidAPI-Host": RAPIDAPI_HOST
}

MAX_REQUESTS_PER_RUN = 10 
DELAY_BETWEEN_REQUESTS = 2  # Seconds between paginated requests

def fetch_jobs():
    """Fetch job postings using pagination while respecting API limits."""
    all_jobs = []
    params = {
        "query": "software engineer OR software developer",
        "location": "England OR Scotland OR  Wales",
        "employmentTypes": "fulltime;intern",
        "datePosted": "month"  # Last month’s jobs
    }

    request_count = 0
    next_page = None

    while request_count < MAX_REQUESTS_PER_RUN:
        if next_page:
            params["nextPage"] = next_page

        response = requests.get(JOBS_ENDPOINT, headers=HEADERS, params=params)
        request_count += 1

        if response.status_code != 200:
            print(f"Error fetching jobs (Request {request_count}): {response.text}")
            break

        data = response.json()
        jobs = data.get("jobs", [])

        all_jobs.extend(jobs)
        print(f"Fetched {len(jobs)} jobs (Total collected: {len(all_jobs)})")

        next_page = data.get("nextPage")
        if not next_page:
            print("No more pages available.")
            break

        if request_count < MAX_REQUESTS_PER_RUN:
            time.sleep(DELAY_BETWEEN_REQUESTS)

    return all_jobs