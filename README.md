# JobScout

JobScout is a full-stack, zoneless Angular 18 and FastAPI application designed to aggregate job postings securely and privately using the TheirStack API. 

## Features
- **Modern Angular**: Built with Angular 18 utilizing the new *Zoneless Change Detection* and RxJS Observables.
- **UI/UX**: Features an intelligent loading overlay, pagination, and a graceful Render server cold-start handler via independent Modal interactions.

## Project Structure
- `/frontend`: The Angular application.
- `/backend`: The Python FastAPI application acting as a secure proxy.

## Setup Instructions

### Backend (FastAPI)
1. Navigate to the `/backend` directory: 
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies: 
   ```bash
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and fill in your `THEIRSTACK_API_KEY`.
5. Run the server proxy: 
   ```bash
   uvicorn main:app --reload
   ```

### Frontend (Angular)
1. Navigate to the `/frontend` directory: 
    ```bash
    cd frontend
    ```
2. Install dependencies: 
    ```bash
    npm install
    ```
3. Start the development server: 
    ```bash
    npm start
    ```
4. Open your browser to `http://localhost:4200`
