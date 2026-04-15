import os
import requests
from fastapi import HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging
from geodata import GEO_ZONES, COUNTRY_NAME_TO_CODE

logger = logging.getLogger("jobscout.provider")

class JobSearchRequest(BaseModel):
    keyword: str
    company: Optional[str] = None
    locationZones: Optional[List[str]] = []
    ignoreLocations: Optional[str] = ""
    maxAgeDays: int = 30
    experienceLevel: Optional[List[str]] = []
    jobType: Optional[List[str]] = []
    isRemote: bool = False
    page: int = 1

# Mapping frontend experience level labels to TheirStack's expected values
EXPERIENCE_LEVEL_MAP = {
    "Entry Level": "junior",
    "Mid Level": "mid_level",
    "Senior Level": "senior",
    "Lead Level": "staff",
    "Manager Level": "senior",
    "Director Level": "c_level",
    "Executive Level": "c_level"
}

# Mapping frontend job type labels to TheirStack's expected values
JOB_TYPE_MAP = {
    "Full-time": "full_time",
    "Part-time": "part_time",
    "Contract": "contract",
    "Temporary": "temporary",
    "Internship": "internship",
    "Other": "other"
}

class TheirStackProvider:
    def __init__(self):
        self.api_key = os.getenv("THEIRSTACK_API_KEY")
        self.base_url = "https://api.theirstack.com/v1/jobs/search"
        # TheirStack free tier caps at 25 results per page
        self.page_size = 25

    def search(self, request: JobSearchRequest) -> dict:
        if not self.api_key or self.api_key == "your_theirstack_api_key_here":
            raise HTTPException(status_code=500, detail="API Key is not configured correctly on the backend.")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Build the core payload with mandatory fields
        payload = {
            "page": request.page - 1,
            "limit": self.page_size,
            "posted_at_max_age_days": request.maxAgeDays,
        }

        # --- Keyword / Title filter ---
        if request.keyword:
            payload["job_title_or"] = [k.strip() for k in request.keyword.split(",")]

        # --- Company filter ---
        if request.company:
            payload["company_name_or"] = [c.strip() for c in request.company.split(",")]
        
        # --- Location filter (Zone to ISO2 mapping) ---
        if request.locationZones:
            location_codes = set()
            for zone in request.locationZones:
                if zone in GEO_ZONES:
                    location_codes.update(GEO_ZONES[zone])
            if location_codes:
                payload["job_country_code_or"] = list(location_codes)

        # --- Ignored locations (Text to ISO2 fuzzy mapping) ---
        if request.ignoreLocations and request.ignoreLocations.strip():
            ignore_codes = set()
            parts = [p.strip().lower() for p in request.ignoreLocations.split(",")]
            for p in parts:
                if p in COUNTRY_NAME_TO_CODE:
                    ignore_codes.add(COUNTRY_NAME_TO_CODE[p])
            if ignore_codes:
                payload["job_country_code_not"] = list(ignore_codes)

        # --- Remote filter ---
        if request.isRemote:
            payload["remote"] = True

        # --- Experience / Seniority Level ---
        if request.experienceLevel:
            mapped = [EXPERIENCE_LEVEL_MAP.get(level) for level in request.experienceLevel if EXPERIENCE_LEVEL_MAP.get(level)]
            if mapped:
                payload["job_seniority_or"] = mapped

        # --- Job Type ---
        if request.jobType:
            mapped = [JOB_TYPE_MAP.get(jt) for jt in request.jobType if JOB_TYPE_MAP.get(jt)]
            if mapped:
                payload["employment_statuses_or"] = mapped

        logger.info(f"Outbound TheirStack payload: {payload}")

        try:
            response = requests.post(self.base_url, json=payload, headers=headers, timeout=15)
            response.raise_for_status()
            
            api_data = response.json()
            jobs = api_data.get("data", [])
            total = api_data.get("total", len(jobs))
            
            # Map TheirStack's schema to our standardized frontend schema
            mapped_jobs = []
            for j in jobs:
                mapped_jobs.append({
                    "id": str(j.get("id", "")),
                    "title": j.get("job_title", "Unknown Title"),
                    "type": j.get("organization_name", "Unknown Company"),
                    "location": j.get("city", j.get("country", "Remote")),
                    "salary": "",
                    "descriptionSnippet": "Click 'Go to job post' for more context on this role.",
                    "fullDescription": j.get("description", j.get("original_description", "Detailed description is not provided in the search preview. Click the button below to view the official posting.")),
                    "url": j.get("url", "#")
                })
                
            return {
                "jobs": mapped_jobs,
                "total": total
            }
        except requests.exceptions.HTTPError as e:
            error_msg = getattr(e.response, 'text', str(e))
            status = e.response.status_code
            logger.error(f"Upstream API responded with HTTP {status}: {error_msg}")
            
            if status == 402:
                detail = "The search service is temporarily unavailable due to usage limits. Please try again later."
            elif status == 401 or status == 403:
                detail = "The search service is not properly configured. Please contact the administrator."
            elif status == 429:
                detail = "Too many requests have been made. Please wait a moment and try again."
            else:
                detail = "Something went wrong while fetching job listings. Please try again later."
            
            raise HTTPException(status_code=503, detail=detail)
        except requests.exceptions.Timeout:
            logger.error("Upstream API request timed out.")
            raise HTTPException(status_code=503, detail="The search service is taking too long to respond. Please try again later.")
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to reach upstream API: {str(e)}")
            raise HTTPException(status_code=503, detail="The search service is currently unreachable. Please try again later.")
