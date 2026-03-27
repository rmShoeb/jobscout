import os
import requests
from fastapi import HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging

logger = logging.getLogger("jobscout.provider")

class JobSearchRequest(BaseModel):
    keyword: str
    location: Optional[str] = None
    ignoreLocations: Optional[str] = None
    maxAgeDays: int = 30
    page: int = 1
    limit: int = 10

class TheirStackProvider:
    def __init__(self):
        self.api_key = os.getenv("THEIRSTACK_API_KEY")
        # Base URL for TheirStack API POST endpoint
        self.base_url = "https://api.theirstack.com/v1/jobs/search"

    def search(self, request: JobSearchRequest) -> dict:
        if not self.api_key or self.api_key == "your_theirstack_api_key_here":
            raise HTTPException(status_code=500, detail="API Key is not configured correctly on the backend.")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # TheirStack POST endpoint expects specific search blocks instead of 'query'
        # We wrap the keyword into a title keyword criteria
        payload = {
            "page": request.page - 1, # Many APIs 0-index pages
            "limit": request.limit,
            "job_title_or": [k.strip() for k in request.keyword.split(",")] if request.keyword else [],
            "posted_at_max_age_days": request.maxAgeDays # Mandatory limit dynamically selected by user
        }
        
        # If they add location constraints
        # if request.location:
        #      payload["job_location_or"] = [l.strip().lower() for l in request.location.split(",")]
             
        # # If they add ignored locations
        # if request.ignoreLocations:
        #      payload["job_location_not"] = [l.strip().lower() for l in request.ignoreLocations.split(",")]

        try:
            logger.info("Executing outbound search query to TheirStack API...")
            response = requests.post(self.base_url, json=payload, headers=headers, timeout=15)
            response.raise_for_status()
            
            # TheirStack returns a list under "data"
            api_data = response.json()
            jobs = api_data.get("data", [])
            total = api_data.get("total", len(jobs))
            
            # Map TheirStack's schema to our expected frontend schema
            mapped_jobs = []
            for j in jobs:
                mapped_jobs.append({
                    "id": str(j.get("id", "")),
                    "title": j.get("job_title", "Unknown Title"),
                    "type": j.get("organization_name", "Unknown Company"), # Mapped company to type field temporarily
                    "location": j.get("city", "Remote"),
                    "salary": "", # Setting empty string to let the Angular client fall back properly
                    "descriptionSnippet": "Click 'Go to job post' for more context on this role.",
                    "fullDescription": j.get("description", j.get("original_description", "Detailed description is not provided in the search preview. Click the button below to view the official posting.")),
                    "url": j.get("url", "#")
                })
                
            return {
                "jobs": mapped_jobs,
                "total": total
            }
        except requests.exceptions.HTTPError as e:
            # RAISING the error correctly informs FastAPI to send a 400-level HTTP response
            error_msg = getattr(e.response, 'text', str(e))
            logger.error(f"TheirStack API responded with HTTP {e.response.status_code}: {error_msg}")
            raise HTTPException(status_code=e.response.status_code, detail="TheirStack API connection failed or returned an invalid response. Please try adjusting your search terms.")
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to reach TheirStack API network: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to connect to backend data provider. Please check proxy connectivity.")
