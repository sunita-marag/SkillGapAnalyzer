from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from database import db


router = APIRouter(
    prefix="/api/progress-tracker",
    tags=["Progress Tracker"]
)

progress_collection = db["learning_progress"]


# ---------- REQUEST MODEL ----------

class ModuleProgressRequest(BaseModel):
    username: str = Field(..., min_length=1)
    module_id: str = Field(..., min_length=1)
    module_title: str = Field(..., min_length=1)

    status: Literal["not_started", "in_progress", "completed"]
    progress: int = Field(default=0, ge=0, le=100)


# ---------- SAVE / UPDATE MODULE PROGRESS ----------

@router.post("/update")
async def update_module_progress(data: ModuleProgressRequest):
    try:
        username = data.username.strip()

        # Keep status and percentage consistent
        progress = data.progress

        if data.status == "completed":
            progress = 100
        elif data.status == "not_started":
            progress = 0

        now = datetime.now(timezone.utc)

        progress_collection.update_one(
            {
                "username": username,
                "module_id": data.module_id
            },
            {
                "$set": {
                    "username": username,
                    "module_id": data.module_id,
                    "module_title": data.module_title,
                    "status": data.status,
                    "progress": progress,
                    "updated_at": now
                },
                "$setOnInsert": {
                    "created_at": now
                }
            },
            upsert=True
        )

        return {
            "success": True,
            "message": "Module progress saved successfully",
            "module": {
                "module_id": data.module_id,
                "module_title": data.module_title,
                "status": data.status,
                "progress": progress
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save progress: {str(e)}"
        )


# ---------- GET USER'S PROGRESS ----------

@router.get("/{username}")
async def get_progress_tracker(username: str):
    try:
        modules = list(
            progress_collection.find(
                {"username": username},
                {"_id": 0}
            ).sort("updated_at", -1)
        )

        total_modules = len(modules)
        completed_modules = sum(
            1 for module in modules
            if module.get("status") == "completed"
        )

        overall_progress = (
            round((completed_modules / total_modules) * 100)
            if total_modules > 0
            else 0
        )

        in_progress_modules = sum(
            1 for module in modules
            if module.get("status") == "in_progress"
        )

        return {
            "success": True,
            "username": username,
            "summary": {
                "total_modules": total_modules,
                "completed_modules": completed_modules,
                "in_progress_modules": in_progress_modules,
                "overall_progress": overall_progress
            },
            "modules": modules
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch progress: {str(e)}"
        )


# ---------- DELETE A MODULE'S PROGRESS ----------

@router.delete("/{username}/{module_id}")
async def delete_module_progress(username: str, module_id: str):
    try:
        result = progress_collection.delete_one({
            "username": username,
            "module_id": module_id
        })

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Module progress not found"
            )

        return {
            "success": True,
            "message": "Module progress deleted successfully"
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete progress: {str(e)}"
        )