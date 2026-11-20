
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone
from database import db

router = APIRouter(
    prefix="/api/soft-skills",
    tags=["Soft Skills Assessment"]
)

# MongoDB collection
soft_skill_results = db["soft_skill_results"]

SKILL_NAMES = [
    "Communication",
    "Teamwork",
    "Leadership",
    "Problem Solving",
    "Adaptability",
    "Time Management"
]

# Skill-wise improvement guidance
IMPROVEMENT_TIPS = {
    "Communication": [
        "Roz 10 minutes kisi topic par bolne ki practice karo.",
        "Active listening practice karo: saamne wale ki baat dhyan se suno.",
        "Roz ek short paragraph padhkar apne words mein explain karo."
    ],
    "Teamwork": [
        "Kisi group activity ya discussion mein participate karo.",
        "Team members ki opinions dhyan se suno.",
        "Group task mein apni responsibility time par complete karo."
    ],
    "Leadership": [
        "Ek chhote task ki responsibility lo.",
        "Kisi problem ke 2-3 possible solutions sochkar decision lo.",
        "Team members ko respectfully guide aur encourage karo."
    ],
    "Problem Solving": [
        "Roz ek logical reasoning ya problem-solving question solve karo.",
        "Problem ko chhote steps mein divide karo.",
        "Solution choose karne se pehle different options compare karo."
    ],
    "Adaptability": [
        "Har week ek nayi skill ya tool try karo.",
        "Unexpected changes par calm rehkar possible solutions socho.",
        "Apne routine mein ek chhota positive change introduce karo."
    ],
    "Time Management": [
        "Har morning apne top 3 tasks likho.",
        "25 minutes focus aur 5 minutes break wali Pomodoro technique try karo.",
        "Important tasks ko priority do aur deadlines note karo."
    ]
}

# Request format:
# {
#   "username": "Shrushti",
#   "answers": {
#       "0": 3,
#       "1": 4,
#       "2": 2,
#       "3": 5,
#       "4": 3,
#       "5": 2
#   }
# }
#
# Answer values: 1 to 5


class SoftSkillSubmission(BaseModel):
    username: str
    answers: dict[str, int]


def create_improvement_plan(weak_skills):
    """Create a simple 7-day plan for the user's weakest skills."""

    if not weak_skills:
        weak_skills = ["Communication", "Teamwork"]

    plan = []

    for day in range(1, 8):
        skill = weak_skills[(day - 1) % len(weak_skills)]
        tip_index = (day - 1) % len(IMPROVEMENT_TIPS[skill])

        plan.append({
            "day": day,
            "skill": skill,
            "task": IMPROVEMENT_TIPS[skill][tip_index]
        })

    return plan


@router.post("/submit")
def submit_assessment(data: SoftSkillSubmission):

    username = data.username.strip()

    if not username:
        raise HTTPException(
            status_code=400,
            detail="Username is required"
        )

    # Check that all 6 questions are answered
    if set(data.answers.keys()) != {str(i) for i in range(6)}:
        raise HTTPException(
            status_code=400,
            detail="Please answer all 6 questions"
        )

    scores = {}

    for index, skill in enumerate(SKILL_NAMES):
        answer = data.answers[str(index)]

        if answer not in [1, 2, 3, 4, 5]:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid answer for {skill}. Choose 1 to 5."
            )

        # Convert answer 1-5 into score 20-100
        scores[skill] = answer * 20

    overall_score = round(
        sum(scores.values()) / len(scores)
    )

    strong_skills = [
        skill for skill, score in scores.items()
        if score >= 80
    ]

    weak_skills = [
        skill for skill, score in scores.items()
        if score < 80
    ]

    recommendations = {
        skill: IMPROVEMENT_TIPS[skill]
        for skill in weak_skills
    }

    improvement_plan = create_improvement_plan(weak_skills)

    result = {
        "username": username,
        "scores": scores,
        "overall_score": overall_score,
        "strong_skills": strong_skills,
        "weak_skills": weak_skills,
        "recommendations": recommendations,
        "improvement_plan": improvement_plan,
        "created_at": datetime.now(timezone.utc)
    }

    inserted = soft_skill_results.insert_one(result)

    result["_id"] = str(inserted.inserted_id)
    result["created_at"] = result["created_at"].isoformat()

    return {
        "success": True,
        "message": "Assessment and improvement plan saved successfully",
        "result": result
    }


@router.get("/results/{username}")
def get_assessment_results(username: str):

    results = list(
    soft_skill_results.find(
        {"username": username}
    ).sort("created_at", -1)
)

    # Fetch complete documents for this user's previous assessments
    for result in results:
        result["_id"] = str(result["_id"])
        result["created_at"] = result["created_at"].isoformat()

    return {
        "success": True,
        "username": username,
        "results": results
    }
