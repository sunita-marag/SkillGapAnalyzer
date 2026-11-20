
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from home_api import router as home_router
from routes.auth import router as auth_router
from routes.assessment import router as assessment_router
from roadmap_api import roadmap_router
from courses_api import router as courses_router
from jobs_api import router as jobs_router
from soft_skills_api import router as soft_skills_router
from progress_tracker_api import router as progress_tracker_router
# Create FastAPI application
app = FastAPI(
    title="SkillGap Analyzer API",
    description="API for resume analysis and skill gap detection",
    version="1.0.0",
)


# Configure CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5176",
        "http://127.0.0.1:5176",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register application routers
app.include_router(auth_router)
app.include_router(home_router)
app.include_router(assessment_router)
app.include_router(roadmap_router)
app.include_router(courses_router)

app.include_router(jobs_router)
app.include_router(soft_skills_router)
app.include_router(progress_tracker_router)
# Root endpoint
@app.get("/")
def root():
    return {
        "success": True,
        "message": "SkillGap Analyzer Backend is running!",
    }
