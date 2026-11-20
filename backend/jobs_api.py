
import os

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Query
from pymongo import MongoClient

load_dotenv()

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

mongo_url = os.getenv("MONGO_URI") or os.getenv("MONGO_URL")

if not mongo_url:
    raise RuntimeError("Set MONGO_URI or MONGO_URL in backend/.env")

client = MongoClient(mongo_url, serverSelectionTimeoutMS=5000)
db = client["skillgap_analyzer"]
jobs_collection = db["jobs"]


@router.get("/")
def get_jobs(
    search: str = Query(default=""),
    location: str = Query(default="All"),
    experience: str = Query(default="All"),
):
    try:
        query = {}

        if search.strip():
            term = search.strip()
            query["$or"] = [
                {"title": {"$regex": term, "$options": "i"}},
                {"company": {"$regex": term, "$options": "i"}},
                {"skills": {"$regex": term, "$options": "i"}},
            ]

        if location != "All":
            query["location"] = location

        if experience != "All":
            query["experience"] = experience

        jobs = list(jobs_collection.find(query, {"_id": 0}))

        return {"success": True, "jobs": jobs}

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to fetch jobs from the database."
        ) from exc
