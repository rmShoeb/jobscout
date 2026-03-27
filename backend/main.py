from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Job Scout Backend API")

# Configure CORS dynamically based on environment configuration
ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN", "http://localhost:4200")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "Backend proxy is awake and ready."}

@app.get("/")
def read_root():
    return {"message": "Job Scout Proxy API Running"}

from providers import TheirStackProvider, JobSearchRequest

provider = TheirStackProvider()

@app.post("/api/search")
def search_jobs(request: JobSearchRequest):
    # This runs in a background thread implicitly because it's a `def` instead of `async def`
    # Therefore, the synchronous requests.post in the provider will not block FastAPI.
    return provider.search(request)

if __name__ == "__main__":
    import uvicorn
    # Run the server directly from this file
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
