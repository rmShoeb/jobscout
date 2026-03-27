import os
import requests
from pydantic import BaseModel
from typing import List, Optional

class JobSearchRequest(BaseModel):
    keyword: str
    location: Optional[str] = None
    page: int = 1
    limit: int = 10

class TheirStackProvider:
    def __init__(self):
        self.api_key = os.getenv("THEIRSTACK_API_KEY")
        # Base URL for TheirStack API - adjust if the actual endpoint path differs
        self.base_url = "https://api.theirstack.com/v1/jobs/search"

    def search(self, request: JobSearchRequest) -> dict:
        if not self.api_key or self.api_key == "your_theirstack_api_key_here":
            return {"error": "API Key is not configured correctly on the backend."}
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # TheirStack typically uses complex JSON bodies for exact tech filters,
        # but for a generic keyword/location search, we structure it broadly.
        payload = {
            "query": request.keyword,
            "location": request.location,
            "page": request.page,
            "limit": request.limit
        }
        
        try:
            # Using synchronous requests as required
            response = requests.post(self.base_url, json=payload, headers=headers, timeout=15)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            return {"error": f"API Error: {e.response.status_code} - {e.response.text}"}
        except requests.exceptions.RequestException as e:
            return {"error": f"Network Error: {str(e)}"}
