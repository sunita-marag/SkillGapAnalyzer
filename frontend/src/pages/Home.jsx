
import React, { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import "../styles/Home.css";



function Home() {

  const navigate = useNavigate();



  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);



  const [careerSelectorOpen, setCareerSelectorOpen] = useState(false);

  const [careerSearch, setCareerSearch] = useState("");



  const [selectedCareer, setSelectedCareer] = useState(

    localStorage.getItem("careerGoal") || ""

  );



  const [resumeFile, setResumeFile] = useState(null);

  const [jobDescription, setJobDescription] = useState("");

  const [jobAnalysisOpen, setJobAnalysisOpen] = useState(false);

  // FastAPI integration
const API_BASE_URL = "http://127.0.0.1:8002";
  const [resumeResult, setResumeResult] = useState(null);
  const [jobResult, setJobResult] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState("");



  /* =========================================

     LOGGED-IN USER

  ========================================= */



  const username = localStorage.getItem("username") || "Student";

  const userEmail = localStorage.getItem("email") || "";

  const userCourse = localStorage.getItem("course") || "Student";

  const userYear = localStorage.getItem("year") || "";
  const userId = localStorage.getItem("userId");



  /* =========================================

     CAREER OPTIONS

  ========================================= */



  const careerOptions = [

    "Data Analyst",

    "Business Analyst",

    "Data Scientist",

    "Data Engineer",

    "Machine Learning Engineer",

    "AI Engineer",

    "AI / ML Engineer",

    "Python Developer",

    "Java Developer",

    "C++ Developer",

    "C# Developer",

    "Software Developer",

    "Software Engineer",

    "Frontend Developer",

    "Backend Developer",

    "Full Stack Developer",

    "React Developer",

    "Angular Developer",

    "Node.js Developer",

    "Flutter Developer",

    "Android Developer",

    "Mobile App Developer",

    "Web Developer",

    "UI Developer",

    "UI/UX Designer",

    "Product Designer",

    "Cloud Engineer",

    "Cloud Architect",

    "DevOps Engineer",

    "Site Reliability Engineer",

    "Cybersecurity Analyst",

    "Cybersecurity Engineer",

    "Network Engineer",

    "Database Administrator",

    "Database Developer",

    "QA Engineer",

    "Software Testing Engineer",

    "Automation Test Engineer",

    "Embedded Systems Engineer",

    "IoT Developer",

    "Blockchain Developer",

    "Game Developer",

    "AR/VR Developer",

    "Technical Support Engineer",

    "System Administrator",

    "Solutions Architect",

    "Product Manager",

    "Project Manager",

    "Business Intelligence Developer",

    "Power BI Developer",

    "Technical Writer",

    "Cloud Security Engineer",

    "MLOps Engineer",

  ];



  const filteredCareers = careerOptions.filter((career) =>

    career.toLowerCase().includes(careerSearch.toLowerCase())

  );



  const selectCareer = (career) => {

    setSelectedCareer(career);

    localStorage.setItem("careerGoal", career);

    setCareerSelectorOpen(false);

    setCareerSearch("");

  };



  /* =========================================

     TECHNICAL SKILLS

  ========================================= */



  const skills = [

    {

      name: "Python",

      percentage: 80,

      color: "#665CE7",

      status: "Good",

      level: "Good",

    },

    {

      name: "SQL",

      percentage: 55,

      color: "#EF6B86",

      status: "Needs Improvement",

      level: "Basic",

    },

    {

      name: "Excel",

      percentage: 70,

      color: "#55AD78",

      status: "Good",

      level: "Intermediate",

    },

    {

      name: "Power BI",

      percentage: 30,

      color: "#F1AD3D",

      status: "Skill Gap",

      level: "Beginner",

    },

  ];



  const totalSkillValue = skills.reduce(

    (total, skill) => total + skill.percentage,

    0

  );



  let currentAngle = 0;



  const pieParts = skills.map((skill) => {

    const part = (skill.percentage / totalSkillValue) * 100;



    const start = currentAngle;

    currentAngle += part;



    return {

      ...skill,

      start,

      end: currentAngle,

    };

  });



  const pieGradient = pieParts

    .map(

      (skill) =>

        `${skill.color} ${skill.start}% ${skill.end}%`

    )

    .join(", ");



  /* =========================================

     RESUME UPLOAD

  ========================================= */



  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setResumeFile(file);
    setResumeResult(null);
    setAnalysisResult(null);
    setApiError("");
    setApiLoading(true);
    try {
      if (!/\.(pdf|txt)$/i.test(file.name)) {
        throw new Error("Please upload a PDF or TXT resume. The current FastAPI endpoint does not support DOC/DOCX yet.");
      }
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${API_BASE_URL}/api/upload-resume`, { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Resume upload failed.");
      setResumeResult(data);
    } catch (error) {
      setApiError(error.message || "Could not connect to FastAPI.");
    } finally {
      setApiLoading(false);
    }
  };



  /* =========================================

     JOB DESCRIPTION

  ========================================= */



  const handleJobAnalysis = async () => {
    if (!jobDescription.trim()) {
      alert("Please enter a job description first.");
      return;
    }
    setJobAnalysisOpen(true);
    setJobResult(null);
    setAnalysisResult(null);
    setApiError("");
    setApiLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_description: jobDescription, career_goal: selectedCareer }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Job analysis failed.");
      setJobResult(data);
      if (resumeResult?.resume_text) {
        const matchResponse = await fetch(`${API_BASE_URL}/api/analyze-skills`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume_text: resumeResult.resume_text, job_description: jobDescription, career_goal: selectedCareer }),
        });
        const matchData = await matchResponse.json();
        if (!matchResponse.ok) throw new Error(matchData.detail || "Skill matching failed.");
        setAnalysisResult(matchData);
      }
    } catch (error) {
      setApiError(error.message || "Could not connect to FastAPI.");
    } finally {
      setApiLoading(false);
    }
  };



  /* =========================================

     SIDEBAR

  ========================================= */



  const closeSidebar = () => {

    setSidebarOpen(false);

  };



  /* =========================================

     LOGOUT

  ========================================= */



 const handleLogout = () => {

  localStorage.removeItem("username");

  localStorage.removeItem("email");

  localStorage.removeItem("course");

  localStorage.removeItem("year");

  localStorage.removeItem("isLoggedIn");

  localStorage.removeItem("authProvider");
localStorage.removeItem("userId");


  navigate("/");

};



  return (

    <div className="home-page">



      {/* =========================================

          SIDEBAR

      ========================================= */}



      <aside

        className={`home-sidebar ${

          sidebarOpen ? "sidebar-open" : ""

        }`}

        onMouseLeave={closeSidebar}

      >



        <div className="sidebar-logo">

          <div className="sidebar-logo-icon">

            🎓

          </div>



          <div>

            <strong>NexEvo</strong>

            <span></span>

          </div>

        </div>



        <div className="sidebar-section-title">

          MAIN MENU

        </div>



        <nav className="sidebar-nav">



          <Link

            to="/home"

            className="sidebar-link active"

          >

            <span>▣</span>

            <span>Dashboard</span>

          </Link>



          <Link

            to="/skill-assessment"

            className="sidebar-link"

          >

            <span>✓</span>

            <span>Skill Assessment</span>

          </Link>



          <Link

            to="/skill-gap-analysis"

            className="sidebar-link"

          >

            <span>◈</span>

            <span>Skill Gap Analysis</span>

          </Link>



          <Link

            to="/learning-roadmap"

            className="sidebar-link"

          >

            <span>↗</span>

            <span>Learning Roadmap</span>

          </Link>



          <Link

            to="/courses"

            className="sidebar-link"

          >

            <span>▤</span>

            <span>Courses & Resources</span>

          </Link>



          <Link

            to="/jobs"

            className="sidebar-link"

          >

            <span>▣</span>

            <span>Job Opportunities</span>

          </Link>



          <Link

            to="/career-guidance"

            className="sidebar-link"

          >

            <span>★</span>

            <span>Career Guidance</span>

          </Link>



          <Link

            to="/resume"

            className="sidebar-link"

          >

            <span>▤</span>

            <span>Resume Center</span>

          </Link>



          <Link

            to="/ai"

            className="sidebar-link"

          >

            <span>✦</span>

            <span>NexEvoAI</span>

          </Link>



          <Link

            to="/progress"

            className="sidebar-link"

          >

            <span>◔</span>

            <span>Progress Tracker</span>

          </Link>



        </nav>



        <div className="sidebar-section-title account-title">

          ACCOUNT

        </div>



        <nav className="sidebar-nav">



          <Link

            to="/profile"

            className="sidebar-link"

          >

            <span>◯</span>

            <span>My Profile</span>

          </Link>



          <Link

            to="/settings"

            className="sidebar-link"

          >

            <span>⚙</span>

            <span>Settings</span>

          </Link>



        </nav>



        <button

          className="sidebar-logout"

          onClick={handleLogout}

        >

          <span>↪</span>

          <span>Logout</span>

        </button>



      </aside>



      {/* =========================================

          MAIN

      ========================================= */}



      <main className="home-main">



        {/* =========================================

            NAVBAR

        ========================================= */}



        <header className="home-navbar">



          <div className="navbar-left">



            <button

              className="hamburger-button"

              onClick={() =>

                setSidebarOpen(!sidebarOpen)

              }

            >

              <span></span>

              <span></span>

              <span></span>

            </button>



            <div className="navbar-search">

              <span>⌕</span>



              <input

                type="text"

                placeholder="Search skills, courses, jobs..."

              />

            </div>



          </div>



          <div className="navbar-right">



            <button className="notification-button">

              🔔

              <span>3</span>

            </button>



            <div className="navbar-profile-wrapper">



              <button

                type="button"

                className="navbar-profile"

                onClick={() =>

                  setProfileMenuOpen(!profileMenuOpen)

                }

              >



                <div className="navbar-avatar">

                  {username.charAt(0).toUpperCase()}

                </div>



                <div className="navbar-user-info">

                  <strong>{username}</strong>



                  <small>

                    {userCourse}

                    {userYear ? ` • ${userYear}` : ""}

                  </small>

                </div>



                <span className="profile-arrow">

                  {profileMenuOpen ? "▲" : "▼"}

                </span>



              </button>



              {profileMenuOpen && (

                <div className="profile-dropdown">



                  <button

                    type="button"

                    onClick={() => {

                      setProfileMenuOpen(false);

                      navigate("/profile");

                    }}

                  >

                    <span>◯</span>

                    <span>Profile</span>

                  </button>



                  <button

                    type="button"

                    onClick={handleLogout}

                  >

                    <span>↪</span>

                    <span>Logout</span>

                  </button>



                </div>

              )}



            </div>



          </div>



        </header>



        {/* =========================================

            CONTENT

        ========================================= */}



        <div className="home-content">



          {/* =========================================

              WELCOME

          ========================================= */}



          <section className="welcome-card">



            <div className="welcome-content">



              <span className="welcome-small">

                STUDENT DASHBOARD

              </span>



              <h1>

                Hello, {username}! 👋

              </h1>



              <p>

                Welcome back! Continue building your

                skills and move closer to your career goals.

              </p>



              <div className="welcome-buttons">



                <Link

                  to="/skill-assessment"

                  className="welcome-primary-button"

                >

                  Take Skill Assessment

                </Link>



                <Link

                  to="/learning-roadmap"

                  className="welcome-secondary-button"

                >

                  View Roadmap

                </Link>



              </div>



            </div>



            <div className="welcome-illustration">

              🎓

            </div>



          </section>



          {/* =========================================

              CAREER GOAL

          ========================================= */}



          <section className="career-goal-card">



            <div className="career-goal-left">



              <div className="career-icon">

                🎯

              </div>



              <div>



                <span>

                  YOUR CAREER GOAL

                </span>



                <h2>

                  {selectedCareer || "Choose a Career"}

                </h2>



                <p>

                  Choose your target career so your assessments,

                  roadmap and AI recommendations can be personalized.

                </p>



              </div>



            </div>



            <div className="career-goal-actions">



              <button

                type="button"

                className="career-change-button"

                onClick={() =>

                  setCareerSelectorOpen(!careerSelectorOpen)

                }

              >

                Choose Career

              </button>



            </div>



          </section>



          {/* =========================================

              CAREER SELECTOR

          ========================================= */}



          {careerSelectorOpen && (

            <section className="career-selector-card">



              <div className="career-selector-header">



                <div>



                  <span className="card-label">

                    CAREER PERSONALIZATION

                  </span>



                  <h2>

                    What career are you preparing for?

                  </h2>



                  <p>

                    Select your target role so NexEvo

                   can compare your skills with

                    the skills required for that career.

                  </p>



                </div>



                <button

                  className="selector-close"

                  onClick={() =>

                    setCareerSelectorOpen(false)

                  }

                >

                  ×

                </button>



              </div>



              <div className="career-search-box">



                <span>⌕</span>



                <input

                  type="text"

                  value={careerSearch}

                  onChange={(e) =>

                    setCareerSearch(e.target.value)

                  }

                  placeholder="Search career or job role..."

                  autoFocus

                />



              </div>



              <div className="popular-careers">



                <span>CAREER OPTIONS</span>



                <div className="career-option-grid">



                  {filteredCareers.map((career) => (

                    <button

                      key={career}

                      className={

                        career === selectedCareer

                          ? "career-option selected"

                          : "career-option"

                      }

                      onClick={() =>

                        selectCareer(career)

                      }

                    >

                      <span>💼</span>

                      {career}

                    </button>

                  ))}



                </div>



                {filteredCareers.length === 0 && (

                  <p className="no-career">

                    No matching career found.

                  </p>

                )}



              </div>



            </section>

          )}



          {/* =========================================

              JOB DESCRIPTION ANALYZER

          ========================================= */}



          {jobAnalysisOpen && (

            <section className="job-analysis-card">



              <div className="job-analysis-header">



                <div>



                  <span className="card-label">

                    JOB DESCRIPTION ANALYSIS

                  </span>



                  <h2>

                    Compare your profile with a job

                  </h2>



                </div>



                <button

                  onClick={() =>

                    setJobAnalysisOpen(false)

                  }

                >

                  ×

                </button>



              </div>



              <textarea

                value={jobDescription}

                onChange={(e) =>

                  setJobDescription(e.target.value)

                }

                placeholder={`Paste the job description here...



Example:

We are looking for a Python Developer with experience

in Python, FastAPI, REST APIs, PostgreSQL, Git and Docker.`}

              />



              <div className="job-analysis-bottom">



                <small>

                  AI will later extract required skills

                  from this job description.

                </small>



                <button

                  className="primary-analysis-button"

                  onClick={handleJobAnalysis}

                >

                  Analyze Job Description

                </button>



              </div>



            </section>

          )}



          {/* =========================================

              RESUME + JOB MATCH

          ========================================= */}



          <section className="career-tools-grid">



            <div className="career-tool-card">



              <div className="career-tool-icon">

                📄

              </div>



              <div className="career-tool-content">



                <span className="card-label">

                  RESUME ANALYZER

                </span>



                <h2>

                  Upload Your Resume

                </h2>



                <p>

                  Upload your resume to identify your skills, projects

                  and experience. Resume analysis can later be connected

                  to the FastAPI backend.

                </p>



                <label

                  htmlFor="resume-upload"

                  className="resume-upload-area"

                >

                  <span className="resume-upload-icon">

                    📎

                  </span>



                  <span>



                    <strong>

                      {resumeFile

                        ? "Resume Selected"

                        : "Click to Upload Resume"}

                    </strong>



                    <small>

                      PDF, DOC or DOCX

                    </small>



                  </span>



                </label>



                <input

                  id="resume-upload"

                  type="file"

                  accept=".pdf,.doc,.docx"

                  onChange={handleResumeUpload}

                  hidden

                />



                {resumeFile && (

                  <div className="resume-ready-box">



                    <span>✓</span>



                    <div>



                      <strong>

                        {resumeFile.name}

                      </strong>



                      <small>

                        Resume selected and ready for analysis.

                      </small>



                    </div>



                  </div>

                )}



                <Link

                  to="/resume"

                  className="tool-link"

                >

                  Open Resume Center →

                </Link>



              </div>



            </div>



            <div className="career-tool-card job-match-card">



              <div className="career-tool-icon">

                🎯

              </div>



              <div className="career-tool-content">



                <span className="card-label">

                  JOB MATCH

                </span>



                <h2>

                  Resume–Job Match

                </h2>



                <p>

                  Paste a job description to compare the required skills,

                  technologies and keywords with your profile.

                </p>



                <textarea

                  className="home-job-match-textarea"

                  value={jobDescription}

                  onChange={(e) =>

                    setJobDescription(e.target.value)

                  }

                  placeholder="Paste the job description here..."

                  rows="6"

                />



                <button

                  type="button"

                  className="tool-primary-button"

                  onClick={handleJobAnalysis}

                >

                  Analyze Job Match →

                </button>



{apiLoading && (
  <p>Analyzing job match...</p>
)}

{apiError && (
  <p style={{ color: "red" }}>{apiError}</p>
)}

{jobResult && (
  <div className="job-match-result">
    <h3>Required Job Skills</h3>
    <p>
      {jobResult.required_skills?.join(", ") ||
        "No matching skills detected."}
    </p>
  </div>
)}

{analysisResult && (
  <div className="job-match-result">
    <h3>Resume–Job Match</h3>
    <h2>{analysisResult.match_percentage}%</h2>

    <p>
      <strong>Matched Skills:</strong>{" "}
      {analysisResult.matched_skills?.join(", ") || "None"}
    </p>

    <p>
      <strong>Missing Skills:</strong>{" "}
      {analysisResult.missing_skills?.join(", ") || "None"}
    </p>
  </div>
)}



              </div>



            </div>



          </section>



          {/* =========================================

              STATS

          ========================================= */}



          <section className="stats-grid">



            <div className="stat-card">



              <div className="stat-icon purple">

                ✓

              </div>



              <div>



                <span>

                  Skills Assessed

                </span>



                <strong>

                  12

                </strong>



                <small>

                  <b>8 strong</b> · 4 need improvement

                </small>



              </div>



            </div>



            <div className="stat-card">



              <div className="stat-icon pink">

                ◈

              </div>



              <div>



                <span>

                  Skill Gaps

                </span>



                <strong>

                  5

                </strong>



                <small>

                  Areas requiring improvement

                </small>



              </div>



            </div>



            <div className="stat-card">



              <div className="stat-icon green">

                ↗

              </div>



              <div>



                <span>

                  Learning Progress

                </span>



                <strong>

                  3/8

                </strong>



                <small>

                  Courses completed

                </small>



              </div>



            </div>



            <div className="stat-card">



              <div className="stat-icon orange">

                ★

              </div>



              <div>



                <span>

                  Resume Score

                </span>



                <strong>

                  74%

                </strong>



                <small>

                  Good · Keep improving

                </small>



              </div>



            </div>



          </section>



          {/* =========================================

              SKILL ANALYSIS + AI

          ========================================= */}



          <section className="analysis-grid">



            <div className="dashboard-card skill-analysis-card">



              <div className="card-heading">



                <div>



                  <span className="card-label">

                    TECHNICAL SKILLS

                  </span>



                  <h2>

                    Skill Analysis

                  </h2>



                </div>



                <Link to="/skill-gap-analysis">

                  View Details →

                </Link>



              </div>



              <div className="skill-analysis-body">



                <div className="pie-chart-wrapper">



                  <div

                    className="skill-pie-chart"

                    style={{

                      background:

                        `conic-gradient(${pieGradient})`,

                    }}

                  >



                    <div className="pie-center">



                      <strong>

                        100%

                      </strong>



                      <span>

                        Skills

                      </span>



                      <small>

                        Distribution

                      </small>



                    </div>



                  </div>



                </div>



                <div className="skill-list">



                  {skills.map((skill) => (



                    <div

                      className="skill-list-item"

                      key={skill.name}

                    >



                      <div className="skill-item-top">



                        <div className="skill-name-wrapper">



                          <span

                            className="skill-dot"

                            style={{

                              backgroundColor:

                                skill.color,

                            }}

                          ></span>



                          <strong>

                            {skill.name}

                          </strong>



                        </div>



                        <span

                          className={`skill-status ${

                            skill.status

                              .toLowerCase()

                              .replaceAll(" ", "-")

                          }`}

                        >

                          {skill.status}

                        </span>



                      </div>



                      <div className="skill-progress-row">



                        <div className="skill-progress">



                          <div

                            className="skill-progress-fill"

                            style={{

                              width:

                                `${skill.percentage}%`,

                              backgroundColor:

                                skill.color,

                            }}

                          ></div>



                        </div>



                        <strong>

                          {skill.percentage}%

                        </strong>



                      </div>



                      <div className="skill-level-row">



                        Current Level:



                        <b>

                          {skill.level}

                        </b>



                      </div>



                    </div>



                  ))}



                </div>



              </div>



            </div>



            {/* AI */}



            <div className="dashboard-card ai-recommendation-card">



              <div className="ai-card-top">



                <div className="ai-icon">

                  ✦

                </div>



                <span>

                  AI RECOMMENDATION

                </span>



              </div>



              <h2>

                Focus on Power BI

              </h2>



              <p>

                Based on your current assessment,

                Power BI is your biggest skill gap.

                Your current proficiency is 30%, while

                the target for your selected career is

                approximately 80%.

              </p>



              <div className="ai-score-box">



                <div>



                  <span>

                    Current

                  </span>



                  <strong>

                    30%

                  </strong>



                </div>



                <div className="ai-arrow">

                  →

                </div>



                <div>



                  <span>

                    Target

                  </span>



                  <strong>

                    80%

                  </strong>



                </div>



              </div>



              <div className="ai-gap-message">



                <strong>

                  Skill Gap: 50 points

                </strong>



                <span>

                  Learn Power BI fundamentals, dashboards

                  and data visualization.

                </span>



              </div>



              <Link

                to="/learning-roadmap"

                className="ai-button"

              >

                View Recommended Roadmap →

              </Link>



            </div>



          </section>



          {/* =========================================

              RECOMMENDED LEARNING

          ========================================= */}



          <section className="dashboard-section">



            <div className="section-top">



              <div>



                <span className="card-label">

                  KEEP LEARNING

                </span>



                <h2>

                  Recommended Learning

                </h2>



              </div>



              <Link to="/courses">

                View All →

              </Link>



            </div>



            <div className="learning-grid">



              <div className="learning-card">



                <div className="learning-thumbnail powerbi">

                  <span>

                    Power BI

                  </span>

                </div>



                <div className="learning-content">



                  <div className="learning-tag gap">

                    Skill Gap

                  </div>



                  <h3>

                    Power BI Fundamentals

                  </h3>



                  <p>

                    Learn dashboards, reports,

                    data visualization and analytics.

                  </p>



                  <div className="learning-meta">

                    <span>Beginner</span>

                    <span>4 Weeks</span>

                  </div>



                  <Link to="/courses">

                    Start Learning →

                  </Link>



                </div>



              </div>



              <div className="learning-card">



                <div className="learning-thumbnail sql">

                  <span>

                    SQL

                  </span>

                </div>



                <div className="learning-content">



                  <div className="learning-tag recommended">

                    Recommended

                  </div>



                  <h3>

                    SQL for Data Analytics

                  </h3>



                  <p>

                    Strengthen SQL queries and

                    database analysis skills.

                  </p>



                  <div className="learning-meta">

                    <span>Beginner</span>

                    <span>3 Weeks</span>

                  </div>



                  <Link to="/courses">

                    Start Learning →

                  </Link>



                </div>



              </div>



              <div className="learning-card">



                <div className="learning-thumbnail python">

                  <span>

                    Python

                  </span>

                </div>



                <div className="learning-content">



                  <div className="learning-tag improve">

                    Improve

                  </div>



                  <h3>

                    Python for Data Analysis

                  </h3>



                  <p>

                    Use Python for data cleaning,

                    analysis and visualization.

                  </p>



                  <div className="learning-meta">

                    <span>Intermediate</span>

                    <span>4 Weeks</span>

                  </div>



                  <Link to="/courses">

                    Start Learning →

                  </Link>



                </div>



              </div>



            </div>



          </section>



          {/* =========================================

              SOFT SKILLS

          ========================================= */}



          <section className="soft-skill-section">



            <div className="soft-skill-header">



              <div>



                <span className="section-label">

                  PERSONAL DEVELOPMENT

                </span>



                <h2>

                  Soft Skills Assessment

                </h2>



                <p>

                  Evaluate your communication, teamwork,

                  leadership and other essential soft

                  skills to improve your overall career

                  readiness.

                </p>



              </div>



              <div className="soft-skill-icon">

                🧠

              </div>



            </div>



            <div className="soft-skill-content">



              <div className="soft-skill-items">



                <Link

                  to="/soft-skill-assessment"

                  className="soft-skill-item"

                >

                  <span>💬</span>



                  <div>



                    <strong>

                      Communication

                    </strong>



                    <small>

                      Verbal and written communication

                    </small>



                  </div>



                </Link>



                <Link

                  to="/soft-skill-assessment"

                  className="soft-skill-item"

                >

                  <span>🤝</span>



                  <div>



                    <strong>

                      Teamwork

                    </strong>



                    <small>

                      Collaboration and cooperation

                    </small>



                  </div>



                </Link>



                <Link

                  to="/soft-skill-assessment"

                  className="soft-skill-item"

                >

                  <span>👑</span>



                  <div>



                    <strong>

                      Leadership

                    </strong>



                    <small>

                      Decision making and responsibility

                    </small>



                  </div>



                </Link>



                <Link

                  to="/soft-skill-assessment"

                  className="soft-skill-item"

                >

                  <span>🧩</span>



                  <div>



                    <strong>

                      Problem Solving

                    </strong>



                    <small>

                      Critical thinking and solutions

                    </small>



                  </div>



                </Link>



              </div>



              <Link

                to="/soft-skill-assessment"

                className="soft-skill-button"

              >

                Start Assessment →

              </Link>



            </div>



          </section>



          {/* =========================================

              AI CAREER TOOLS

          ========================================= */}



          <section className="dashboard-section">



            <div className="section-top">



              <div>



                <span className="card-label">

                  AI CAREER TOOLS

                </span>



                <h2>

                  Prepare for Your Career

                </h2>



              </div>



            </div>



            <div className="ai-tools-grid">



              <Link

                to="/ai"

                className="ai-tool-card"

              >

                <span>✦</span>



                <div>



                  <strong>

                    NexEvo AI

                  </strong>



                  <small>

                    Get personalized career guidance

                  </small>



                </div>



                <b>→</b>

              </Link>



              <Link

                to="/learning-roadmap"

                className="ai-tool-card"

              >

                <span>🗺️</span>



                <div>



                  <strong>

                    Personalized Roadmap

                  </strong>



                  <small>

                    Learn based on your actual skill gaps

                  </small>



                </div>



                <b>→</b>

              </Link>



              <Link

                to="/ai-mock-interview"

                className="ai-tool-card"

              >

                <span>🎤</span>



                <div>



                  <strong>

                    AI Mock Interview

                  </strong>



                  <small>

                    Practice technical and soft-skill interviews

                  </small>



                </div>



                <b>→</b>

              </Link>



            </div>



          </section>



          {/* =========================================

              TASKS

          ========================================= */}



          <section className="dashboard-section">



            <div className="section-top">



              <div>



                <span className="card-label">

                  TODAY'S PRIORITIES

                </span>



                <h2>

                  Your Tasks

                </h2>



              </div>



            </div>



            <div className="tasks-grid">



              <div className="task-card">



                <div className="task-check">

                  ✓

                </div>



                <div className="task-content">



                  <span>

                    SKILL ASSESSMENT

                  </span>



                  <h3>

                    Complete SQL Assessment

                  </h3>



                  <p>

                    Test your current SQL knowledge.

                  </p>



                </div>



                <Link to="/skill-assessment">

                  →

                </Link>



              </div>



              <div className="task-card">



                <div className="task-check">

                  !

                </div>



                <div className="task-content">



                  <span>

                    LEARNING

                  </span>



                  <h3>

                    Complete Power BI Lesson

                  </h3>



                  <p>

                    Continue your recommended course.

                  </p>



                </div>



                <Link to="/courses">

                  →

                </Link>



              </div>



              <div className="task-card">



                <div className="task-check">

                  ✎

                </div>



                <div className="task-content">



                  <span>

                    RESUME

                  </span>



                  <h3>

                    Update Your Resume

                  </h3>



                  <p>

                    Improve your resume score.

                  </p>



                </div>



                <Link to="/resume">

                  →

                </Link>



              </div>



            </div>



          </section>



          {/* =========================================

              QUICK ACTIONS

          ========================================= */}



          <section className="dashboard-section">



            <div className="section-top">



              <div>



                <span className="card-label">

                  QUICK ACCESS

                </span>



                <h2>

                  Quick Actions

                </h2>



              </div>



            </div>



            <div className="quick-actions">



              <Link

                to="/skill-assessment"

                className="quick-action"

              >

                <span>✓</span>



                <div>



                  <strong>

                    Skill Assessment

                  </strong>



                  <small>

                    Evaluate your skills

                  </small>



                </div>



              </Link>



              <Link

                to="/skill-gap-analysis"

                className="quick-action"

              >

                <span>◈</span>



                <div>



                  <strong>

                    Skill Gap Analysis

                  </strong>



                  <small>

                    Find your skill gaps

                  </small>



                </div>



              </Link>



              <Link

                to="/ai"

                className="quick-action"

              >

                <span>✦</span>



                <div>



                  <strong>

                    Ask NexEvo AI

                  </strong>



                  <small>

                    Get AI career guidance

                  </small>



                </div>



              </Link>



              <Link

                to="/resume"

                className="quick-action"

              >

                <span>▤</span>



                <div>



                  <strong>

                    Resume Center

                  </strong>



                  <small>

                    Improve your resume

                  </small>



                </div>



              </Link>



            </div>



          </section>



        </div>



                {/* Live results returned by FastAPI */}
          {(apiLoading || apiError || resumeResult || jobResult || analysisResult) && (
            <section className="job-analysis-card" aria-live="polite">
              {apiLoading && <p>Analyzing with backend, please wait...</p>}
              {apiError && <p role="alert" style={{ color: "#b91c1c" }}>{apiError}</p>}
              {resumeResult && <div>
                <h3>Resume skills detected</h3>
                <p>{resumeResult.skill_count} skills found in {resumeResult.filename}.</p>
                {resumeResult.skills?.length ? <ul>{resumeResult.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul> : <p>No matching skills detected.</p>}
              </div>}
              {jobResult && <div>
                <h3>Required job skills</h3>
                {jobResult.required_skills?.length ? <ul>{jobResult.required_skills.map((skill) => <li key={skill}>{skill}</li>)}</ul> : <p>No matching skills detected.</p>}
              </div>}
              {analysisResult && <div>
                <h3>Resume–job match</h3>
                <h2>{analysisResult.match_percentage}%</h2>
                <p><strong>Matched skills:</strong> {analysisResult.matched_skills?.join(", ") || "None"}</p>
                <p><strong>Missing skills:</strong> {analysisResult.missing_skills?.join(", ") || "None"}</p>
              </div>}
            </section>
          )}

</main>



    </div>

  );

}



export default Home;

