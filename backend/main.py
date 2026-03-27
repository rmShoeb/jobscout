from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi import Request
import os
import logging
from dotenv import load_dotenv

load_dotenv()

# Configure standard console logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("jobscout")

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

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error on {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": "Invalid search parameters provided. Please verify your keyword and location inputs."},
    )


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "Backend proxy is awake and ready."}

@app.get("/")
def read_root():
    return {"message": "Job Scout Proxy API Running"}

from providers import TheirStackProvider, JobSearchRequest

provider = TheirStackProvider()

@app.post("/api/search")
def search_jobs(request: JobSearchRequest):
    logger.info(f"Triggering search for keyword: '{request.keyword}' | Location: '{request.location}'")
    try:
        results = provider.search(request)
        logger.info(f"Search successful. Returned {results.get('total', 0)} jobs.")
        return results
    except Exception as e:
        logger.error(f"Search endpoint encountered an error: {str(e)}")
        raise

if __name__ == "__main__":
    import uvicorn
    # Run the server directly from this file
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
