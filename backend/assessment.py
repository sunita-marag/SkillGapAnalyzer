
import random
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from database import db


router = APIRouter(
    prefix="/api/assessment",
    tags=["Skill Assessment"],
)

assessments_collection = db["assessments"]
users_collection = db["users"]


# Each skill has its own set of questions.
QUESTION_BANK = [
    # Python
    {
        "id": "python_1",
        "skill": "Python",
        "question": "Which keyword defines a function in Python?",
        "options": ["func", "def", "function", "define"],
        "correct_answer": "def",
    },
    {
        "id": "python_2",
        "skill": "Python",
        "question": "Which data type stores key-value pairs?",
        "options": ["List", "Tuple", "Dictionary", "Set"],
        "correct_answer": "Dictionary",
    },
    {
        "id": "python_3",
        "skill": "Python",
        "question": "What is the output of len([10, 20, 30])?",
        "options": ["2", "3", "4", "Error"],
        "correct_answer": "3",
    },
    {
        "id": "python_4",
        "skill": "Python",
        "question": "Which keyword handles an exception?",
        "options": ["catch", "error", "except", "handle"],
        "correct_answer": "except",
    },
    {
        "id": "python_5",
        "skill": "Python",
        "question": "Which symbol starts a comment in Python?",
        "options": ["//", "#", "/*", "--"],
        "correct_answer": "#",
    },

    # Data Structures and Algorithms
    {
        "id": "dsa_1",
        "skill": "DSA",
        "question": "Which data structure follows FIFO?",
        "options": ["Stack", "Queue", "Tree", "Graph"],
        "correct_answer": "Queue",
    },
    {
        "id": "dsa_2",
        "skill": "DSA",
        "question": "Which data structure follows LIFO?",
        "options": ["Queue", "Stack", "Graph", "Array"],
        "correct_answer": "Stack",
    },
    {
        "id": "dsa_3",
        "skill": "DSA",
        "question": "What is the average time complexity of binary search?",
        "options": ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        "correct_answer": "O(log n)",
    },
    {
        "id": "dsa_4",
        "skill": "DSA",
        "question": "Which structure represents hierarchical data?",
        "options": ["Queue", "Stack", "Tree", "Hash table"],
        "correct_answer": "Tree",
    },
    {
        "id": "dsa_5",
        "skill": "DSA",
        "question": "Which algorithmic technique divides a problem into smaller subproblems?",
        "options": [
            "Linear search",
            "Divide and conquer",
            "Sequential access",
            "Brute force only",
        ],
        "correct_answer": "Divide and conquer",
    },

    # Database
    {
        "id": "database_1",
        "skill": "Database",
        "question": "Which SQL command retrieves data?",
        "options": ["INSERT", "UPDATE", "SELECT", "DELETE"],
        "correct_answer": "SELECT",
    },
    {
        "id": "database_2",
        "skill": "Database",
        "question": "Which SQL clause filters rows?",
        "options": ["ORDER BY", "WHERE", "GROUP BY", "JOIN"],
        "correct_answer": "WHERE",
    },
    {
        "id": "database_3",
        "skill": "Database",
        "question": "What is a primary key used for?",
        "options": [
            "Identifying a row uniquely",
            "Sorting every column",
            "Deleting a table",
            "Encrypting a database",
        ],
        "correct_answer": "Identifying a row uniquely",
    },
    {
        "id": "database_4",
        "skill": "Database",
        "question": "Which SQL operation combines related rows from tables?",
        "options": ["JOIN", "DROP", "ALTER", "TRUNCATE"],
        "correct_answer": "JOIN",
    },
    {
        "id": "database_5",
        "skill": "Database",
        "question": "What does SQL INSERT do?",
        "options": [
            "Adds rows",
            "Deletes a database",
            "Sorts rows",
            "Renames a server",
        ],
        "correct_answer": "Adds rows",
    },

    # Web Development
    {
        "id": "web_1",
        "skill": "Web Development",
        "question": "What does HTML define?",
        "options": [
            "Webpage structure",
            "Database tables",
            "Server hardware",
            "Network routing",
        ],
        "correct_answer": "Webpage structure",
    },
    {
        "id": "web_2",
        "skill": "Web Development",
        "question": "What is CSS primarily used for?",
        "options": [
            "Styling webpages",
            "Managing databases",
            "Compiling Python",
            "Creating HTTP servers only",
        ],
        "correct_answer": "Styling webpages",
    },
    {
        "id": "web_3",
        "skill": "Web Development",
        "question": "Which protocol is commonly used to transfer web content?",
        "options": ["FTP only", "HTTP", "SMTP", "SSH only"],
        "correct_answer": "HTTP",
    },
    {
        "id": "web_4",
        "skill": "Web Development",
        "question": "Which HTML element creates a hyperlink?",
        "options": ["<p>", "<a>", "<div>", "<img>"],
        "correct_answer": "<a>",
    },
    {
        "id": "web_5",
        "skill": "Web Development",
        "question": "Which JavaScript keyword declares a block-scoped variable that can be reassigned?",
        "options": ["let", "const", "static", "define"],
        "correct_answer": "let",
    },

    # Git and GitHub
    {
        "id": "git_1",
        "skill": "Git & GitHub",
        "question": "Which command creates a Git repository?",
        "options": ["git start", "git init", "git new", "git create"],
        "correct_answer": "git init",
    },
    {
        "id": "git_2",
        "skill": "Git & GitHub",
        "question": "Which command records staged changes in a commit?",
        "options": ["git push", "git add", "git commit", "git pull"],
        "correct_answer": "git commit",
    },
    {
        "id": "git_3",
        "skill": "Git & GitHub",
        "question": "Which command uploads local commits to a remote repository?",
        "options": ["git push", "git status", "git init", "git diff"],
        "correct_answer": "git push",
    },
    {
        "id": "git_4",
        "skill": "Git & GitHub",
        "question": "Which command shows the working tree status?",
        "options": ["git log", "git status", "git merge", "git clone"],
        "correct_answer": "git status",
    },
    {
        "id": "git_5",
        "skill": "Git & GitHub",
        "question": "What does git clone do?",
        "options": [
            "Copies a repository",
            "Deletes a branch",
            "Creates a commit",
            "Uploads a database",
        ],
        "correct_answer": "Copies a repository",
    },

    # REST APIs
    {
        "id": "api_1",
        "skill": "REST API",
        "question": "Which HTTP method is commonly used to retrieve a resource?",
        "options": ["POST", "GET", "DELETE", "PATCH"],
        "correct_answer": "GET",
    },
    {
        "id": "api_2",
        "skill": "REST API",
        "question": "Which HTTP status code usually means a resource was created?",
        "options": ["200", "201", "404", "500"],
        "correct_answer": "201",
    },
    {
        "id": "api_3",
        "skill": "REST API",
        "question": "Which format is commonly used for JSON API responses?",
        "options": ["JSON", "EXE", "DLL", "MP3"],
        "correct_answer": "JSON",
    },
    {
        "id": "api_4",
        "skill": "REST API",
        "question": "What does HTTP status code 404 indicate?",
        "options": [
            "Success",
            "Unauthorized",
            "Resource not found",
            "Server started",
        ],
        "correct_answer": "Resource not found",
    },
    {
        "id": "api_5",
        "skill": "REST API",
        "question": "Which HTTP method is commonly used to partially update a resource?",
        "options": ["GET", "PATCH", "TRACE", "OPTIONS"],
        "correct_answer": "PATCH",
    },
]


SKILLS = sorted({question["skill"] for question in QUESTION_BANK})


class AssessmentSubmission(BaseModel):
    user_id: str
    answers: dict[str, str] = Field(min_length=1)


@router.get("/questions")
def get_questions(
    skill: str = Query(default="all"),
    limit: int = Query(default=5, ge=1, le=20),
):
    if skill.strip().lower() == "all":
        available = QUESTION_BANK.copy()
    else:
        available = [
            question
            for question in QUESTION_BANK
            if question["skill"].lower() == skill.strip().lower()
        ]

    if not available:
        raise HTTPException(
            status_code=404,
            detail={
                "message": f"No questions found for skill: {skill}",
                "available_skills": SKILLS,
            },
        )

    selected = random.sample(
        available,
        min(limit, len(available)),
    )

    # Never expose correct answers in the question endpoint.
    public_questions = [
        {
            key: value
            for key, value in question.items()
            if key != "correct_answer"
        }
        for question in selected
    ]

    return {
        "success": True,
        "skill": skill,
        "available_skills": SKILLS,
        "total": len(public_questions),
        "questions": public_questions,
    }


@router.post("/submit")
def submit_assessment(data: AssessmentSubmission):
    if not ObjectId.is_valid(data.user_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid user ID",
        )

    user = users_collection.find_one(
        {"_id": ObjectId(data.user_id)}
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    # Validate submitted question IDs and answers.
    question_lookup = {
        question["id"]: question
        for question in QUESTION_BANK
    }

    unknown_ids = [
        question_id
        for question_id in data.answers
        if question_id not in question_lookup
    ]

    if unknown_ids:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Unknown question IDs submitted",
                "question_ids": unknown_ids,
            },
        )

    correct_count = 0
    skill_results = {}

    for question_id, answer in data.answers.items():
        question = question_lookup[question_id]
        skill_name = question["skill"]

        if answer not in question["options"]:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid answer for question {question_id}",
            )

        is_correct = answer == question["correct_answer"]

        if is_correct:
            correct_count += 1

        if skill_name not in skill_results:
            skill_results[skill_name] = {
                "correct": 0,
                "answered": 0,
            }

        skill_results[skill_name]["answered"] += 1

        if is_correct:
            skill_results[skill_name]["correct"] += 1

    total_answered = len(data.answers)
    score = round((correct_count / total_answered) * 100)

    for result in skill_results.values():
        result["score"] = round(
            (result["correct"] / result["answered"]) * 100
        )

    document = {
        "user_id": data.user_id,
        "answers": data.answers,
        "score": score,
        "correct_answers": correct_count,
        "total_questions": total_answered,
        "skill_results": skill_results,
        "submitted_at": datetime.now(timezone.utc),
    }

    result = assessments_collection.insert_one(document)

    return {
        "success": True,
        "message": "Assessment saved successfully",
        "assessment_id": str(result.inserted_id),
        "score": score,
        "correct_answers": correct_count,
        "total_questions": total_answered,
        "skill_results": skill_results,
    }


@router.get("/{user_id}")
def get_assessment(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid user ID",
        )

    user = users_collection.find_one(
        {"_id": ObjectId(user_id)}
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    assessment = assessments_collection.find_one(
        {"user_id": user_id},
        sort=[("_id", -1)],
    )

    if not assessment:
        return {"completed": False}

    return {
        "completed": True,
        "assessment_id": str(assessment["_id"]),
        "answers": assessment.get("answers", {}),
        "score": assessment.get("score", 0),
        "correct_answers": assessment.get("correct_answers", 0),
        "total_questions": assessment.get("total_questions", 0),
        "skill_results": assessment.get("skill_results", {}),
    }
