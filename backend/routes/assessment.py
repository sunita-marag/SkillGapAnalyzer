
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Literal

from database import db

router = APIRouter(
    prefix="/api/assessment",
    tags=["Skill Assessment"]
)

assessments_collection = db["assessments"]

SKILLS = [
    "Programming",
    "DSA",
    "Database",
    "Web Development",
    "Python",
    "Git & GitHub",
    "REST API",
    "Frontend Development",
    "Backend Development",
    "Problem Solving",
]

LEVELS = {
    "Beginner": 1,
    "Intermediate": 2,
    "Advanced": 3,
}


class AssessmentRequest(BaseModel):
    user_id: str
    answers: dict[str, Literal["Beginner", "Intermediate", "Advanced"]]


@router.post("/submit")
def submit_assessment(data: AssessmentRequest):
    if not ObjectId.is_valid(data.user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")

    if set(data.answers.keys()) != set(SKILLS):
        raise HTTPException(
            status_code=400,
            detail="Please submit all 10 assessment answers"
        )

    user = db["users"].find_one({"_id": ObjectId(data.user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    total = sum(LEVELS[level] for level in data.answers.values())
    score = round((total / (len(SKILLS) * 3)) * 100)

    document = {
        "user_id": data.user_id,
        "answers": data.answers,
        "score": score,
        "submitted_at": datetime.now(timezone.utc),
    }

    result = assessments_collection.insert_one(document)

    return {
        "message": "Assessment saved successfully",
        "assessment_id": str(result.inserted_id),
        "score": score,
        "answers": data.answers,
    }
