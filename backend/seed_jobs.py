
from jobs_api import jobs_collection

jobs = [
    {
        "id": 1,
        "logo": "💻",
        "title": "Frontend Developer",
        "company": "TechNova",
        "location": "Pune",
        "workMode": "Hybrid",
        "experience": "Fresher",
        "salary": "₹4 - ₹7 LPA",
        "skills": ["React", "JavaScript", "HTML", "CSS"],
        "description": "Looking for a fresher with good frontend development skills.",
        "course_url": "",
    },
    {
        "id": 2,
        "logo": "🐍",
        "title": "Python Developer",
        "company": "CloudSoft",
        "location": "Pune",
        "workMode": "Remote",
        "experience": "Fresher",
        "salary": "₹5 - ₹8 LPA",
        "skills": ["Python", "FastAPI", "SQL"],
        "description": "Python developer required for backend application development.",
        "course_url": "",
    },
    {
        "id": 3,
        "logo": "📊",
        "title": "Data Analyst",
        "company": "DataWorks",
        "location": "Mumbai",
        "workMode": "On-site",
        "experience": "Fresher",
        "salary": "₹4 - ₹6 LPA",
        "skills": ["Python", "SQL", "Excel", "Power BI"],
        "description": "Entry-level opportunity in data analytics.",
        "course_url": "",
    },
    {
        "id": 4,
        "logo": "⚛️",
        "title": "React Developer Intern",
        "company": "Innovate Labs",
        "location": "Remote",
        "workMode": "Remote",
        "experience": "Internship",
        "salary": "₹15K - ₹25K/month",
        "skills": ["React", "JavaScript", "HTML", "CSS", "Git"],
        "description": "React internship opportunity for students and freshers.",
        "course_url": "",
    },
    {
        "id": 5,
        "logo": "🌐",
        "title": "Full Stack Developer",
        "company": "CodeCraft Technologies",
        "location": "Bangalore",
        "workMode": "Hybrid",
        "experience": "Fresher",
        "salary": "₹6 - ₹10 LPA",
        "skills": ["React", "JavaScript", "SQL", "REST API"],
        "description": "Full stack development role for fresher candidates.",
        "course_url": "",
    },
    {
        "id": 6,
        "logo": "⚙️",
        "title": "Junior Backend Developer",
        "company": "DevCloud",
        "location": "Pune",
        "workMode": "Hybrid",
        "experience": "Fresher",
        "salary": "₹5 - ₹8 LPA",
        "skills": ["Python", "FastAPI", "PostgreSQL", "REST API"],
        "description": "Backend development role using Python and REST APIs.",
        "course_url": "",
    },
]

if __name__ == "__main__":
    for job in jobs:
        jobs_collection.update_one(
            {"id": job["id"]},
            {"$set": job},
            upsert=True,
        )

    print(f"Seeded {jobs_collection.count_documents({})} jobs.")
