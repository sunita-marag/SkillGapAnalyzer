
import React, { useEffect, useState } from "react";
import "../styles/Jobs.css";

function Jobs() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All");
  const [experience, setExperience] = useState("All");

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  // Demo student skills
  // Later, connect these skills to the logged-in user's profile.
  const studentSkills = [
    "Python",
    "SQL",
    "React",
    "JavaScript",
    "HTML",
    "CSS",
    "Git",
  ];

  // Fetch jobs from FastAPI backend and MongoDB
  useEffect(() => {
    const controller = new AbortController();

    async function fetchJobs() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (location !== "All") {
          params.set("location", location);
        }

        if (experience !== "All") {
          params.set("experience", experience);
        }

        const query = params.toString();

        const url = `http://127.0.0.1:8002/api/jobs/${
          query ? `?${query}` : ""
        }`;

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Unable to load jobs. Server returned ${response.status}.`
          );
        }

        const data = await response.json();

        // Support either a direct array or { success: true, jobs: [...] }
        const jobsData = Array.isArray(data) ? data : data.jobs;

        if (!Array.isArray(jobsData)) {
          throw new Error("Invalid response received from Jobs API.");
        }

        setJobs(jobsData);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message ||
              "Could not connect to the backend. Check whether the server is running."
          );
          setJobs([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchJobs();

    return () => controller.abort();
  }, [search, location, experience, retry]);

  // Calculate skill match
  const calculateMatch = (jobSkills = []) => {
    if (!Array.isArray(jobSkills) || jobSkills.length === 0) {
      return 0;
    }

    const matched = jobSkills.filter((jobSkill) =>
      studentSkills.some(
        (studentSkill) =>
          studentSkill.toLowerCase() ===
          String(jobSkill).toLowerCase()
      )
    ).length;

    return Math.round((matched / jobSkills.length) * 100);
  };

  // Add match percentage and safe default values to database jobs
  const jobsWithMatch = jobs.map((job, index) => ({
    ...job,
    id: job.id ?? job._id ?? `${job.title || "job"}-${index}`,
    logo: job.logo || "💼",
    skills: Array.isArray(job.skills) ? job.skills : [],
    match: calculateMatch(job.skills),
  }));

  // Search and filters are handled by the backend API
  const filteredJobs = jobsWithMatch;

  return (
    <div className="jobs-page">
      {/* Header */}
      <div className="jobs-header">
        <div>
          <span className="jobs-label">CAREER OPPORTUNITIES</span>

          <h1>Jobs For You</h1>

          <p>
            Find job opportunities based on your skills and career goals.
          </p>
        </div>

        <div className="jobs-count">
          {loading ? "Loading..." : `${filteredJobs.length} Jobs`}
        </div>
      </div>

      {/* Student Skills */}
      <div className="student-skills-card">
        <h2>Your Current Skills</h2>

        <p>
          These skills are currently used to calculate your job match.
        </p>

        <div className="student-skills">
          {studentSkills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="jobs-controls">
        <div className="search-box">
          <span>🔍</span>

          <input
            type="text"
            placeholder="Search jobs, companies or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="All">All Locations</option>
          <option value="Pune">Pune</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Remote">Remote</option>
        </select>

        <select
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
        >
          <option value="All">All Experience</option>
          <option value="Fresher">Fresher</option>
          <option value="Internship">Internship</option>
        </select>
      </div>

      {/* Jobs */}
      <div className="jobs-section">
        <div className="section-heading">
          <div>
            <h2>Recommended Jobs</h2>

            <p>
              Jobs matched with your current skill profile.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="no-jobs">
            <h2>Loading Jobs...</h2>

            <p>
              Please wait while jobs are loaded from the database.
            </p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="no-jobs">
            <h2>Could Not Load Jobs</h2>

            <p>{error}</p>

            <button
              className="view-job"
              onClick={() => setRetry((value) => value + 1)}
            >
              Try Again
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          /* Empty State */
          <div className="no-jobs">
            <div className="no-jobs-icon">🔍</div>

            <h2>No Jobs Found</h2>

            <p>
              Try changing your search or filter options.
            </p>
          </div>
        ) : (
          /* Job Cards */
          <div className="jobs-list">
            {filteredJobs.map((job) => (
              <div className="job-card" key={job.id}>
                {/* Job Logo */}
                <div className="job-logo">
                  {job.logo}
                </div>

                {/* Job Content */}
                <div className="job-content">
                  <div className="job-top">
                    <div>
                      <h2>{job.title}</h2>

                      <p className="company">
                        {job.company}
                      </p>
                    </div>

                    <div
                      className={`match ${
                        job.match >= 80
                          ? "high"
                          : job.match >= 60
                          ? "medium"
                          : "low"
                      }`}
                    >
                      {job.match}% Match
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="job-details">
                    <span>
                      📍 {job.location || "Not specified"}
                    </span>

                    <span>
                      💼 {job.workMode || "Not specified"}
                    </span>

                    <span>
                      🎓 {job.experience || "Not specified"}
                    </span>

                    <span>
                      💰 {job.salary || "Not specified"}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="job-description">
                    {job.description || "No description available."}
                  </p>

                  {/* Skills */}
                  <div className="job-skills">
                    {job.skills.map((skill) => {
                      const matched = studentSkills.some(
                        (studentSkill) =>
                          studentSkill.toLowerCase() ===
                          String(skill).toLowerCase()
                      );

                      return (
                        <span
                          key={skill}
                          className={
                            matched
                              ? "skill matched"
                              : "skill"
                          }
                        >
                          {matched ? "✓ " : ""}
                          {skill}
                        </span>
                      );
                    })}
                  </div>

                  {/* Bottom */}
                  <div className="job-bottom">
                    <div className="match-info">
                      <span>
                        Skill Compatibility
                      </span>

                      <div className="progress">
                        <div
                          className="progress-bar"
                          style={{
                            width: `${job.match}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <button
                      className="view-job"
                      onClick={() =>
                        alert(
                          `Job: ${job.title}\n` +
                            `Company: ${job.company}\n` +
                            `Location: ${job.location || "Not specified"}\n` +
                            `Salary: ${job.salary || "Not specified"}\n\n` +
                            `${job.description || "No description available."}`
                        )
                      }
                    >
                      View Job →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Jobs;
