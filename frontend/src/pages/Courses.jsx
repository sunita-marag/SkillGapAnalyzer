
import React, { useEffect, useState } from "react";
import "../styles/Courses.css";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadCourses() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          search,
          category,
        });

        const response = await fetch(
          `http://127.0.0.1:8002/api/courses/?${params}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to load courses.");
        }

        const data = await response.json();
        setCourses(data.courses || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Could not load courses. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCourses();

    return () => controller.abort();
  }, [search, category]);

  return (
    <div className="courses-page">
      <div className="courses-header">
        <div>
          <span>LEARNING RESOURCES</span>
          <h1>Courses & Resources</h1>
          <p>Learn the skills you need to close your skill gaps.</p>
        </div>

        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="course-filters">
        {[
          "All",
          "Programming",
          "Web Development",
          "Data & AI",
          "Career",
        ].map((item) => (
          <button
            key={item}
            className={category === item ? "active" : ""}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {loading && <p>Loading courses...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && (
        <div className="course-grid">
          {courses.map((course) => (
            <div className="course-card" key={course.title}>
              <div className="course-icon">{course.icon}</div>

              <div className="course-rating">
                ⭐ {course.rating}
              </div>

              <h2>{course.title}</h2>

              <p className="course-provider">
                {course.provider}
              </p>

              <div className="course-meta">
                <span>{course.level}</span>
                <span>{course.duration}</span>
              </div>

              <button
                onClick={() => {
                  if (course.course_url) {
                    window.open(
                      course.course_url,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  } else {
                    alert("Course link has not been added yet.");
                  }
                }}
              >
                View Course →
              </button>
            </div>
          ))}

          {courses.length === 0 && <p>No courses found.</p>}
        </div>
      )}
    </div>
  );
}

export default Courses;
