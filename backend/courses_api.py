
import os

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Query
from pymongo import MongoClient

load_dotenv()

router = APIRouter(prefix="/api/courses", tags=["Courses"])

# Supports either environment variable name used in your project.
mongo_url = os.getenv("MONGO_URI") or os.getenv("MONGO_URL")

if not mongo_url:
    raise RuntimeError(
        "MongoDB connection URL is missing. "
        "Set MONGO_URI or MONGO_URL in backend/.env"
    )

client = MongoClient(mongo_url, serverSelectionTimeoutMS=5000)
db = client["skillgap_analyzer"]
courses_collection = db["courses"]


@router.get("/")
def get_courses(
    search: str = Query(default=""),
    category: str = Query(default="All"),
):
    try:
        query = {}

        if search.strip():
            query["$or"] = [
                {"title": {"$regex": search.strip(), "$options": "i"}},
                {"provider": {"$regex": search.strip(), "$options": "i"}},
            ]

        if category != "All":
            query["category"] = category

        courses = list(courses_collection.find(query, {"_id": 0}))
        return {"success": True, "courses": courses}

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to fetch courses from the database."
        ) from exc
