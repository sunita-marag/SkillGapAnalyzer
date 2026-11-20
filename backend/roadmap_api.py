
import os
import json
import time
import requests

from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from database import db


# --------------------------------------------------
# ENVIRONMENT CONFIGURATION
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.8-flash"
).strip()

GEMINI_MODEL = GEMINI_MODEL.removeprefix("models/")

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/"
    f"models/{GEMINI_MODEL}:generateContent"
)


# --------------------------------------------------
# ROUTER
# --------------------------------------------------

roadmap_router = APIRouter(
    prefix="/api",
    tags=["Learning Roadmap"]
)

# MongoDB collection for learning roadmaps
learning_roadmaps = db["learning_roadmaps"]

# --------------------------------------------------
# REQUEST MODEL
# --------------------------------------------------

class RoadmapRequest(BaseModel):
    skill: str = Field(min_length=1, max_length=100)
    current_level: str = "Beginner"
    goal: str = Field(
        default="Become job-ready",
        max_length=200
    )
    duration_weeks: int = Field(
        default=8,
        ge=1,
        le=52
    )
    hours_per_day: int = Field(
        default=1,
        ge=1,
        le=12
    )


# --------------------------------------------------
# LOCAL ROADMAP TOPICS
# --------------------------------------------------

def get_topics(skill: str):

    name = skill.strip().lower()

    templates = {
        "python": [
            ["Python setup", "Variables", "Data types"],
            ["Conditions", "Loops", "Basic problem solving"],
            ["Lists", "Tuples", "Sets", "Dictionaries"],
            ["Functions", "Modules", "Error handling"],
            ["Files", "JSON", "Working with packages"],
            ["Object-oriented programming", "Classes", "Objects"],
            ["APIs", "Requests", "Testing and debugging"],
            ["Portfolio project", "Git", "Project documentation"]
        ],

        "react": [
            ["HTML", "CSS", "JavaScript fundamentals"],
            ["ES6", "Modules", "Array methods"],
            ["React setup", "JSX", "Components"],
            ["Props", "State", "Event handling"],
            ["Hooks", "useEffect", "Forms"],
            ["React Router", "API requests", "Loading states"],
            ["Reusable components", "Error handling", "Testing"],
            ["Portfolio project", "Git", "Deployment"]
        ],

        "javascript": [
            ["Variables", "Data types", "Operators"],
            ["Conditions", "Loops", "Functions"],
            ["Arrays", "Objects", "Array methods"],
            ["DOM", "Events", "Forms"],
            ["ES6", "Modules", "Promises"],
            ["Async and await", "Fetch API", "Error handling"],
            ["Testing", "Debugging", "Code organization"],
            ["Web project", "Git", "Deployment"]
        ],

        "sql": [
            ["Databases", "Tables", "SELECT"],
            ["WHERE", "ORDER BY", "LIMIT"],
            ["Aggregate functions", "GROUP BY", "HAVING"],
            ["INNER JOIN", "LEFT JOIN", "Relationships"],
            ["Subqueries", "Aliases", "CASE"],
            ["INSERT", "UPDATE", "DELETE", "Constraints"],
            ["Indexes", "Database design", "Normalization"],
            ["Database project", "Analytical queries"]
        ]
    }

    return templates.get(
        name,
        [
            [f"Introduction to {skill}", "Key concepts", "Setup and tools"],
            ["Core fundamentals", "Basic exercises", "Terminology"],
            ["Essential techniques", "Guided practice"],
            ["Intermediate concepts", "Problem solving"],
            ["Practical exercises", "Common mistakes"],
            ["Advanced fundamentals", "Real-world examples"],
            ["Mini project", "Testing and improvement"],
            ["Final project", "Documentation", "Portfolio preparation"]
        ]
    )


# --------------------------------------------------
# LOCAL FALLBACK ROADMAP
# --------------------------------------------------

def make_local_roadmap(request: RoadmapRequest):

    skill = request.skill.strip()
    topics_by_week = get_topics(skill)

    phases = []

    for week in range(1, request.duration_weeks + 1):

        template_index = min(
            ((week - 1) * len(topics_by_week))
            // request.duration_weeks,
            len(topics_by_week) - 1
        )

        topics = topics_by_week[template_index]

        if week == request.duration_weeks:

            project = (
                f"Complete a {skill} project related to "
                f"your goal: {request.goal}. "
                "Document what you built and learned."
            )

            milestone = (
                "Finish the project, test it, and explain your work."
            )

        else:

            project = (
                f"Build a small {skill} exercise "
                "using this week's topics."
            )

            milestone = (
                f"Explain the main concepts and complete at least "
                f"one practical exercise in {skill}."
            )

        phases.append({
            "week": week,
            "title": f"Week {week}: {topics[0]}",
            "topics": topics,

            "activities": [
                f"Study {skill} for "
                f"{request.hours_per_day} hour(s) daily.",
                "Write notes and practise with small examples.",
                "Review your work and fix mistakes."
            ],

            "project": project,
            "milestone": milestone,

            "resources": [
                {
                    "name": f"{skill} official documentation",
                    "url": (
                        "https://www.google.com/search?q="
                        + skill.replace(" ", "+")
                        + "+official+documentation"
                    )
                }
            ]
        })

    return {
        "success": True,

        "roadmap": {
            "skill": skill,
            "current_level": request.current_level,
            "goal": request.goal,
            "duration_weeks": request.duration_weeks,

            "overview": (
                f"A {request.duration_weeks}-week learning plan for "
                f"{skill}, starting at {request.current_level} level. "
                f"Study {request.hours_per_day} hour(s) daily. "
                "Generated locally from templates."
            ),

            "phases": phases,
            "generation_source": "local_template"
        }
    }


# --------------------------------------------------
# GEMINI AI ROADMAP GENERATION
# --------------------------------------------------

def make_gemini_roadmap(request: RoadmapRequest):

    if not GEMINI_API_KEY:
        raise RuntimeError(
            "GEMINI_API_KEY is missing from backend .env file."
        )

    prompt = f"""
Create a detailed, personalized learning roadmap.

Skill: {request.skill}
Current level: {request.current_level}
Career goal: {request.goal}
Duration: {request.duration_weeks} weeks
Daily study time: {request.hours_per_day} hours

Return ONLY valid JSON. Do not use Markdown or code fences.

Use exactly this structure:

{{
  "overview": "A short personalized overview",
  "phases": [
    {{
      "week": 1,
      "title": "Week 1: Topic title",
      "topics": ["Topic 1", "Topic 2", "Topic 3"],
      "activities": ["Activity 1", "Activity 2"],
      "project": "A practical project",
      "milestone": "What the learner should achieve",
      "resources": [
        {{
          "name": "Official learning resource",
          "url": "https://example.com"
        }}
      ]
    }}
  ]
}}

IMPORTANT:
1. Generate exactly {request.duration_weeks} phases.
2. Number weeks from 1 to {request.duration_weeks}.
3. Adapt difficulty to the current level.
4. Make the plan practical and career-oriented.
5. Include projects and measurable milestones.
6. Include relevant official learning resources.
7. Do not include text outside the JSON.
"""

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],

        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.3
        }
    }

    headers = {
        "x-goog-api-key": GEMINI_API_KEY,
        "Content-Type": "application/json"
    }

    retry_delays = [2, 4, 8]
    last_error = None

    for attempt in range(3):

        try:

            print(
                f"Calling Gemini model: {GEMINI_MODEL}"
            )

            response = requests.post(
                GEMINI_URL,
                headers=headers,
                json=payload,
                timeout=(15, 120)
            )

            if response.status_code != 200:

                print(
                    "Gemini HTTP Status:",
                    response.status_code
                )

                print(
                    "Gemini Error Details:",
                    response.text[:2000]
                )

            response.raise_for_status()

            data = response.json()

            candidates = data.get("candidates", [])

            if not candidates:
                raise ValueError(
                    "Gemini returned no candidates."
                )

            candidate = candidates[0]

            parts = (
                candidate
                .get("content", {})
                .get("parts", [])
            )

            response_text = "".join(
                part.get("text", "")
                for part in parts
            ).strip()

            if not response_text:
                raise ValueError(
                    "Gemini returned an empty response."
                )

            # Remove Markdown code fences if present.
            cleaned = response_text.strip()

            if cleaned.startswith("```json"):
                cleaned = cleaned[len("```json"):]

            elif cleaned.startswith("```"):
                cleaned = cleaned[3:]

            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]

            cleaned = cleaned.strip()

            result = json.loads(cleaned)

            phases = result.get("phases", [])

            if len(phases) != request.duration_weeks:
                raise ValueError(
                    "Gemini returned an incorrect number of weeks."
                )

            # Validate each weekly phase.
            for index, phase in enumerate(phases, start=1):

                required_fields = [
                    "title",
                    "topics",
                    "activities",
                    "project",
                    "milestone",
                    "resources"
                ]

                for field in required_fields:
                    if field not in phase:
                        raise ValueError(
                            f"Week {index} is missing {field}."
                        )

                phase["week"] = index

            print(
                "Roadmap generated successfully using Gemini!"
            )

            return {
                "success": True,

                "roadmap": {
                    "skill": request.skill.strip(),
                    "current_level": request.current_level,
                    "goal": request.goal,
                    "duration_weeks": request.duration_weeks,

                    "overview": result.get(
                        "overview",
                        "Your personalized Gemini learning roadmap."
                    ),

                    "phases": phases,
                    "generation_source": "gemini"
                }
            }

        except requests.exceptions.HTTPError as error:

            last_error = error

            status_code = (
                error.response.status_code
                if error.response is not None
                else None
            )

            print(
                "Gemini HTTP error:",
                status_code
            )

            if error.response is not None:
                print(
                    "Gemini response:",
                    error.response.text[:2000]
                )

            # Retry only temporary errors.
            if status_code not in [
                429, 500, 502, 503, 504
            ]:
                raise RuntimeError(
                    f"Gemini API HTTP {status_code}: "
                    f"{error.response.text[:1000]}"
                ) from error

        except (
            requests.exceptions.Timeout,
            requests.exceptions.ConnectionError,
            requests.exceptions.RequestException,
            ValueError,
            KeyError,
            IndexError
        ) as error:

            last_error = error

            print(
                "Gemini request/response error:",
                str(error)
            )

        if attempt < 2:

            delay = retry_delays[attempt]

            print(
                f"Gemini attempt {attempt + 1} failed. "
                f"Retrying in {delay} seconds..."
            )

            time.sleep(delay)

    raise RuntimeError(
        f"Gemini failed after 3 attempts: {last_error}"
    )


# --------------------------------------------------
# LEARNING ROADMAP API ENDPOINT
# --------------------------------------------------

@roadmap_router.post("/learning-roadmap")
def generate_learning_roadmap(request: RoadmapRequest):

    if not request.skill.strip():

        raise HTTPException(
            status_code=400,
            detail="Please enter a skill."
        )

    print("\n------------------------------")
    print("Learning Roadmap Request")
    print("Skill:", request.skill)
    print("Current Level:", request.current_level)
    print("Goal:", request.goal)
    print("Gemini Model:", GEMINI_MODEL)
    print(
        "Gemini API Key Configured:",
        bool(GEMINI_API_KEY)
    )
    print("------------------------------")

    # Try Gemini first.
    if GEMINI_API_KEY:

        try:

            result = make_gemini_roadmap(request)

            return result

        except Exception as error:

            print(
                "Gemini roadmap generation failed:",
                str(error)
            )

            print(
                "Using local roadmap fallback."
            )

    else:

        print(
            "Gemini API key not configured. "
            "Using local fallback."
        )

    # Fallback if Gemini is unavailable.
    return make_local_roadmap(request)
