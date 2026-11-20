import React, { useState } from "react";
import "../styles/CareerGuidance.css";

function CareerGuidance() {
  const [selectedCareer, setSelectedCareer] = useState(null);

  const careers = [
    {
      id: 1,
      icon: "💻",
      title: "Software Development",
      shortDescription:
        "Build websites, applications and software products using modern development technologies.",
      overview:
        "Software development is a broad career path that includes frontend, backend, full-stack and application development.",
      roles: [
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "Software Developer",
      ],
      skills: [
        "Programming",
        "JavaScript",
        "Python / Java",
        "Git & GitHub",
        "Database",
        "REST APIs",
      ],
      roadmap: [
        "Learn programming fundamentals",
        "Learn HTML, CSS and JavaScript",
        "Learn React or another frontend framework",
        "Learn backend development",
        "Learn databases and REST APIs",
        "Build real-world projects",
      ],
    },

    {
      id: 2,
      icon: "📊",
      title: "Data Analytics",
      shortDescription:
        "Use data, statistics and visualization tools to discover insights and support business decisions.",
      overview:
        "Data analytics focuses on collecting, cleaning, analyzing and visualizing data to identify useful patterns and insights.",
      roles: [
        "Data Analyst",
        "Business Analyst",
        "BI Analyst",
        "Reporting Analyst",
      ],
      skills: [
        "Excel",
        "SQL",
        "Python",
        "Power BI",
        "Statistics",
        "Data Visualization",
      ],
      roadmap: [
        "Learn Excel fundamentals",
        "Learn SQL",
        "Understand basic statistics",
        "Learn Python for data analysis",
        "Learn Power BI",
        "Build data analysis projects",
      ],
    },

    {
      id: 3,
      icon: "🤖",
      title: "Artificial Intelligence",
      shortDescription:
        "Explore machine learning, AI concepts and intelligent applications using data and algorithms.",
      overview:
        "Artificial Intelligence involves creating systems that can perform tasks such as prediction, classification, recommendation and language understanding.",
      roles: [
        "AI Engineer",
        "Machine Learning Engineer",
        "AI Developer",
        "Data Scientist",
      ],
      skills: [
        "Python",
        "Statistics",
        "Machine Learning",
        "Data Processing",
        "Deep Learning",
        "AI APIs",
      ],
      roadmap: [
        "Learn Python programming",
        "Learn mathematics and statistics basics",
        "Learn data processing",
        "Learn machine learning",
        "Explore deep learning",
        "Build AI projects",
      ],
    },

    {
      id: 4,
      icon: "☁️",
      title: "Cloud & DevOps",
      shortDescription:
        "Work with cloud platforms, deployment, automation and infrastructure technologies.",
      overview:
        "Cloud and DevOps focuses on deploying, managing and automating applications and infrastructure using modern development and cloud tools.",
      roles: [
        "Cloud Engineer",
        "DevOps Engineer",
        "Cloud Developer",
        "Site Reliability Engineer",
      ],
      skills: [
        "Linux",
        "Git",
        "Docker",
        "Cloud Platforms",
        "CI/CD",
        "Networking",
      ],
      roadmap: [
        "Learn Linux fundamentals",
        "Learn Git and GitHub",
        "Understand networking",
        "Learn cloud fundamentals",
        "Learn Docker",
        "Learn CI/CD and deployment",
      ],
    },
  ];

  const openCareer = (career) => {
    setSelectedCareer(career);
  };

  const closeCareer = () => {
    setSelectedCareer(null);
  };

  return (
    <div className="career-guidance-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="career-header">

        <div className="career-header-content">
          <span className="career-label">CAREER EXPLORATION</span>

          <h1>Career Guidance</h1>

          <p>
            Explore career paths based on your skills, interests and
            professional goals.
          </p>
        </div>

        <div className="career-icon">
          🎯
        </div>

      </div>

      {/* =========================================
          INTRO CARD
      ========================================= */}

      <div className="career-intro">

        <div className="intro-icon">
          ✨
        </div>

        <div>
          <h2>Find the Right Career Path</h2>

          <p>
            Explore different technology careers and understand the
            skills, roles and learning steps required for each path.
          </p>
        </div>

      </div>

      {/* =========================================
          CAREER GRID
      ========================================= */}

      <div className="career-section-header">
        <div>
          <h2>Explore Career Paths</h2>

          <p>
            Choose a career path to see required skills and learning roadmap.
          </p>
        </div>
      </div>

      <div className="career-grid">

        {careers.map((career) => (
          <div className="career-card" key={career.id}>

            <div className="career-card-top">

              <div className="career-card-icon">
                {career.icon}
              </div>

              <span className="career-arrow">
                →
              </span>

            </div>

            <h2>
              {career.title}
            </h2>

            <p>
              {career.shortDescription}
            </p>

            {/* Skills Preview */}

            <div className="career-skills-preview">

              {career.skills.slice(0, 4).map((skill) => (
                <span key={skill}>
                  {skill}
                </span>
              ))}

            </div>

            <button
              className="explore-button"
              onClick={() => openCareer(career)}
            >
              Explore Path
              <span>→</span>
            </button>

          </div>
        ))}

      </div>

      {/* =========================================
          CAREER DETAILS MODAL
      ========================================= */}

      {selectedCareer && (
        <div
          className="career-modal-overlay"
          onClick={closeCareer}
        >

          <div
            className="career-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Header */}

            <div className="modal-header">

              <div className="modal-title">

                <div className="modal-icon">
                  {selectedCareer.icon}
                </div>

                <div>
                  <span>CAREER PATH</span>

                  <h2>
                    {selectedCareer.title}
                  </h2>
                </div>

              </div>

              <button
                className="close-button"
                onClick={closeCareer}
              >
                ×
              </button>

            </div>

            {/* Overview */}
            <div classname="model-section">


              <h3>Career Overview</h3>
              <h3> Career</h3>

              <p>
                {selectedCareer.overview}
              </p>

            </div>




            {/* Roles */}

            <div className="modal-section">

              <h3>Possible Job Roles</h3>

              <div className="role-list">

                {selectedCareer.roles.map((role) => (
                  <div className="role-item" key={role}>
                    <span>✓</span>
                    {role}
                  </div>
                ))}

              </div>

            </div>

            {/* Skills */}

            <div className="modal-section">

              <h3>Important Skills</h3>

              <div className="modal-skills">

                {selectedCareer.skills.map((skill) => (
                  <span key={skill}>
                    {skill}
                  </span>
                ))}

              </div>

            </div>

            {/* Roadmap */}

            <div className="modal-section">

              <h3>Suggested Learning Roadmap</h3>

              <div className="roadmap-list">

                {selectedCareer.roadmap.map((step, index) => (
                  <div
                    className="roadmap-item"
                    key={step}
                  >

                    <div className="roadmap-number">
                      {index + 1}

                    </div>

                    <div className="roadmap-content">
                      <span>

                        Step {index + 1}
                      </span>

                      <strong>
                        {step}
                      </strong>
                    </div>

                  </div>
                ))}

              </div>
              

            </div>

            {/* Bottom */}

            <div className="modal-footer">

              <p>
                Your Skill Gap Analysis can be used later to
                identify which skills you need to improve for this
                career.
              </p>

              <button
                onClick={closeCareer}
                className="modal-close-button"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      

          )}
    </div>
  );
}

export default CareerGuidance;

