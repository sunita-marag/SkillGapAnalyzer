
from courses_api import courses_collection

courses = [
    {
        "icon": "⚛️",
        "title": "React.js Complete Guide",
        "provider": "Frontend Academy",
        "level": "Intermediate",
        "duration": "24 Hours",
        "rating": 4.8,
        "category": "Web Development",
        "course_url": "",
    },
    {
        "icon": "🐍",
        "title": "Python for Developers",
        "provider": "Code Academy",
        "level": "Beginner",
        "duration": "18 Hours",
        "rating": 4.7,
        "category": "Programming",
        "course_url": "",
    },
    {
        "icon": "🗄️",
        "title": "SQL & Database Design",
        "provider": "DataLearn",
        "level": "Intermediate",
        "duration": "15 Hours",
        "rating": 4.6,
        "category": "Data & AI",
        "course_url": "",
    },
    {
        "icon": "🤖",
        "title": "Machine Learning Fundamentals",
        "provider": "AI Learning",
        "level": "Intermediate",
        "duration": "32 Hours",
        "rating": 4.9,
        "category": "Data & AI",
        "course_url": "",
    },
    {
        "icon": "🔧",
        "title": "Git & GitHub",
        "provider": "DevTools Academy",
        "level": "Beginner",
        "duration": "8 Hours",
        "rating": 4.8,
        "category": "Programming",
        "course_url": "",
    },
    {
        "icon": "🌐",
        "title": "REST API Development",
        "provider": "Backend School",
        "level": "Intermediate",
        "duration": "20 Hours",
        "rating": 4.7,
        "category": "Web Development",
        "course_url": "",
    },
]

for course in courses:
    courses_collection.update_one(
        {"title": course["title"]},
        {"$set": course},
        upsert=True,
    )

print("Courses inserted or updated successfully!")
client = courses_collection.database.client
client.close()
