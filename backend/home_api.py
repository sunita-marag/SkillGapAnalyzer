
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from pypdf import PdfReader
from docx import Document
from io import BytesIO
import re


# =========================================
# ROUTER
# =========================================

router = APIRouter()


# =========================================
# SKILLS DATABASE
# =========================================

SKILLS = [
    "Python",
    "Java",
    "JavaScript",
    "React",
    "Node.js",
    "SQL",
    "MongoDB",
    "Excel",
    "Power BI",
    "Tableau",
    "Machine Learning",
    "Data Analysis",
    "HTML",
    "CSS",
    "FastAPI",
    "Django",
    "Flask",
    "AWS",
    "Azure",
    "Docker",
    "Git",
    "Communication",
    "Leadership",
    "C++",
    "C#",
    "TypeScript",
    "PostgreSQL",
    "TensorFlow",
]


# =========================================
# REQUEST MODELS
# =========================================

class JobAnalysisRequest(BaseModel):
    job_description: str
    career_goal: str = ""


class SkillAnalysisRequest(BaseModel):
    resume_text: str
    job_description: str = ""
    career_goal: str = ""


# =========================================
# SKILL EXTRACTION
# =========================================

def extract_skills(text: str):
    found = []
    text_lower = text.lower()

    for skill in SKILLS:
        pattern = (
            r"(?<!\w)"
            + re.escape(skill.lower())
            + r"(?!\w)"
        )

        if re.search(pattern, text_lower):
            found.append(skill)

    return found


# =========================================
# HOME
# =========================================

@router.get("/")
def home():
    return {
        "success": True,
        "message": "SkillGap Analyzer FastAPI backend is running!"
    }


# =========================================
# HEALTH CHECK
# =========================================

@router.get("/api/health")
def health():
    return {
        "success": True,
        "status": "healthy"
    }


# =========================================
# UPLOAD AND ANALYZE RESUME
# Supports PDF, TXT and DOCX
# =========================================

@router.post("/api/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    filename = file.filename or ""
    extension = filename.lower()

    # Validate the file type
    if not extension.endswith((".pdf", ".txt", ".docx")):
        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF, TXT or DOCX resume."
        )

    # Read the uploaded file
    content = await file.read()

    # Maximum file size: 5 MB
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Resume must be smaller than 5 MB."
        )

    if not content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty."
        )

    # Extract text from the selected file
    try:
        if extension.endswith(".pdf"):
            reader = PdfReader(BytesIO(content))

            if reader.is_encrypted:
                raise HTTPException(
                    status_code=400,
                    detail="Password-protected PDFs are not supported."
                )

            resume_text = "\n".join(
                page.extract_text() or ""
                for page in reader.pages
            )

        elif extension.endswith(".docx"):
            document = Document(BytesIO(content))

            paragraphs = [
                paragraph.text
                for paragraph in document.paragraphs
                if paragraph.text.strip()
            ]

            resume_text = "\n".join(paragraphs)

            # Also extract text from tables in the DOCX
            for table in document.tables:
                for row in table.rows:
                    row_text = " | ".join(
                        cell.text.strip()
                        for cell in row.cells
                    )

                    if row_text.strip():
                        resume_text += "\n" + row_text

        else:
            resume_text = content.decode("utf-8-sig")

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=400,
            detail=(
                "Could not read the resume. "
                "Please check that the file is valid."
            )
        )

    if not resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail=(
                "No readable text was found. "
                "Scanned PDFs may require OCR."
            )
        )

    # Detect skills
    skills = extract_skills(resume_text)

    return {
        "success": True,
        "filename": filename,
        "skills": skills,
        "skill_count": len(skills),
        "resume_text": resume_text,
        "message": "Resume processed successfully."
    }


# =========================================
# ANALYZE JOB DESCRIPTION
# =========================================

@router.post("/api/analyze-job")
def analyze_job(request: JobAnalysisRequest):
    description = request.job_description.strip()

    if not description:
        raise HTTPException(
            status_code=400,
            detail="Please provide a job description."
        )

    required_skills = extract_skills(description)

    return {
        "success": True,
        "career_goal": request.career_goal,
        "required_skills": required_skills,
        "required_skill_count": len(required_skills),
        "message": "Job description analyzed successfully."
    }


# =========================================
# ANALYZE SKILL GAPS
# =========================================

@router.post("/api/analyze-skills")
def analyze_skills(request: SkillAnalysisRequest):
    if not request.resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Resume text is required."
        )

    resume_skills = extract_skills(request.resume_text)
    required_skills = extract_skills(
        request.job_description
    )

    resume_skill_set = {
        skill.lower()
        for skill in resume_skills
    }

    matched = [
        skill
        for skill in required_skills
        if skill.lower() in resume_skill_set
    ]

    missing = [
        skill
        for skill in required_skills
        if skill.lower() not in resume_skill_set
    ]

    score = (
        round(len(matched) / len(required_skills) * 100)
        if required_skills
        else 0
    )

    return {
        "success": True,
        "career_goal": request.career_goal,
        "resume_skills": resume_skills,
        "required_skills": required_skills,
        "matched_skills": matched,
        "missing_skills": missing,
        "match_percentage": score
    }
