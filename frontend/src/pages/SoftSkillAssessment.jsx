
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/SoftSkillAssessment.css";

function SoftSkillAssessment() {
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "Shrushti";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [assessmentResult, setAssessmentResult] = useState(null);

  const questions = [
    {
      skill: "Communication",
      icon: "💬",
      question:
        "How confident are you when explaining your ideas to others?",
      options: [
        "Not confident",
        "Slightly confident",
        "Moderately confident",
        "Very confident",
        "Extremely confident",
      ],
    },
    {
      skill: "Teamwork",
      icon: "🤝",
      question:
        "How effectively do you work with other people in a team?",
      options: [
        "I struggle with teamwork",
        "I need significant improvement",
        "I work well with others",
        "I work very well in teams",
        "I am excellent at teamwork",
      ],
    },
    {
      skill: "Leadership",
      icon: "👑",
      question:
        "How comfortable are you taking responsibility and leading a team?",
      options: [
        "Not comfortable",
        "Slightly comfortable",
        "Moderately comfortable",
        "Very comfortable",
        "Extremely comfortable",
      ],
    },
    {
      skill: "Problem Solving",
      icon: "🧩",
      question:
        "How effectively do you handle difficult problems and find solutions?",
      options: [
        "I struggle with problems",
        "I need significant improvement",
        "I can solve most problems",
        "I solve problems effectively",
        "I am highly effective at problem solving",
      ],
    },
    {
      skill: "Adaptability",
      icon: "🔄",
      question:
        "How well do you adapt when situations, requirements or environments change?",
      options: [
        "I find change very difficult",
        "I need time to adapt",
        "I can adapt when necessary",
        "I adapt quickly",
        "I adapt very easily",
      ],
    },
    {
      skill: "Time Management",
      icon: "⏰",
      question:
        "How effectively do you manage your time and complete tasks on schedule?",
      options: [
        "I often miss deadlines",
        "I need significant improvement",
        "I usually manage my time",
        "I manage my time well",
        "I manage my time extremely well",
      ],
    },
  ];

  const question = questions[currentQuestion];

  const progress =
    ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (answer) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [currentQuestion]: answer,
    }));

    setError("");
  };

  const nextQuestion = () => {
    if (answers[currentQuestion] === undefined) {
      setError("Please select an answer before continuing.");
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
      setError("");
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((previous) => previous - 1);
      setError("");
    }
  };

  const submitAssessment = async () => {
    const allQuestionsAnswered =
      Object.keys(answers).length === questions.length;

    if (!allQuestionsAnswered) {
      setError("Please answer all 6 questions before submitting.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Convert selected option text into numeric answers 1–5
      const numericAnswers = {};

      questions.forEach((item, index) => {
        const selectedAnswer = answers[index];
        const selectedOptionIndex =
          item.options.indexOf(selectedAnswer);

        if (selectedOptionIndex === -1) {
          throw new Error(
            `Please select an answer for ${item.skill}.`
          );
        }

        numericAnswers[String(index)] =
          selectedOptionIndex + 1;
      });

      const response = await fetch(
        "http://127.0.0.1:8002/api/soft-skills/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            answers: numericAnswers,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Assessment submission failed."
        );
      }

      if (!data.success || !data.result) {
        throw new Error(
          "Assessment was submitted, but no result was returned."
        );
      }

      setAssessmentResult(data.result);
      setCurrentQuestion(questions.length - 1);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("Soft Skills Assessment Error:", err);

      setError(
        err.message ||
          "Backend se connect nahi ho pa raha. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Strong";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs Improvement";
    return "Needs Focus";
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <div className="soft-assessment-page">
      {/* SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          className="soft-sidebar-overlay"
          onClick={closeSidebar}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside
        className={`soft-sidebar ${
          sidebarOpen ? "soft-sidebar-open" : ""
        }`}
      >
        <div className="soft-sidebar-logo">
          <div className="soft-sidebar-logo-icon">
            🎓
          </div>

          <div>
            <strong>SkillGap</strong>
            <span>Analyzer</span>
          </div>
        </div>

        <div className="soft-sidebar-title">
          MAIN MENU
        </div>

        <nav className="soft-sidebar-nav">
          <Link
            to="/home"
            className="soft-sidebar-link"
            onClick={closeSidebar}
          >
            <span>▣</span>
            Dashboard
          </Link>

          <Link
            to="/skill-assessment"
            className="soft-sidebar-link"
            onClick={closeSidebar}
          >
            <span>✓</span>
            Skill Assessment
          </Link>

          <Link
            to="/skill-gap-analysis"
            className="soft-sidebar-link"
            onClick={closeSidebar}
          >
            <span>◈</span>
            Skill Gap Analysis
          </Link>

          <Link
            to="/learning-roadmap"
            className="soft-sidebar-link"
            onClick={closeSidebar}
          >
            <span>↗</span>
            Learning Roadmap
          </Link>

          <Link
            to="/courses"
            className="soft-sidebar-link"
            onClick={closeSidebar}
          >
            <span>▤</span>
            Courses & Resources
          </Link>

          <Link
            to="/jobs"
            className="soft-sidebar-link"
            onClick={closeSidebar}
          >
            <span>▣</span>
            Job Opportunities
          </Link>

          <Link
            to="/career-guidance"
            className="soft-sidebar-link"
            onClick={closeSidebar}
          >
            <span>★</span>
            Career Guidance
          </Link>

          <Link
            to="/resume"
            className="soft-sidebar-link"
            onClick={closeSidebar}
          >
            <span>▤</span>
            Resume Center
          </Link>

          <Link
            to="/ai"
            className="soft-sidebar-link"
            onClick={closeSidebar}
          >
            <span>✦</span>
            SkillGap AI
          </Link>

          <Link
            to="/progress"
            className="soft-sidebar-link"
            onClick={closeSidebar}
          >
            <span>◔</span>
            Progress Tracker
          </Link>
        </nav>

        <div className="soft-sidebar-title">
          ACCOUNT
        </div>

        <nav className="soft-sidebar-nav">
          <Link
            to="/profile"
            className="soft-sidebar-link"
            onClick={closeSidebar}
          >
            <span>◯</span>
            My Profile
          </Link>

          <Link
            to="/settings"
            className="soft-sidebar-link"
            onClick={closeSidebar}
          >
            <span>⚙</span>
            Settings
          </Link>
        </nav>

        <button
          className="soft-sidebar-logout"
          onClick={handleLogout}
        >
          <span>↪</span>
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="soft-assessment-main">
        {/* NAVBAR */}
        <header className="soft-assessment-navbar">
          <div className="soft-navbar-left">
            <button
              className="soft-hamburger"
              onClick={() =>
                setSidebarOpen(!sidebarOpen)
              }
              aria-label="Toggle sidebar"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            <div className="soft-navbar-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search skills, courses, jobs..."
              />
            </div>
          </div>

          <div className="soft-navbar-right">
            <button
              className="soft-notification"
              type="button"
              aria-label="Notifications"
            >
              🔔
              <span>3</span>
            </button>

            <Link
              to="/profile"
              className="soft-profile"
            >
              <div className="soft-avatar">
                {username.charAt(0).toUpperCase()}
              </div>

              <div className="soft-profile-info">
                <strong>{username}</strong>
                <small>CSE Student</small>
              </div>
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="soft-assessment-content">
          <Link
            to="/home"
            className="soft-back-button"
          >
            ← Back to Dashboard
          </Link>

          {/* PAGE HEADER */}
          <section className="soft-assessment-header">
            <div>
              <span className="soft-header-label">
                PERSONAL DEVELOPMENT
              </span>

              <h1>Soft Skills Assessment</h1>

              <p>
                Assess your interpersonal and professional
                skills to understand your strengths and
                identify areas for improvement.
              </p>
            </div>

            <div className="soft-header-icon">
              🧠
            </div>
          </section>

          {/* ERROR MESSAGE */}
          {error && (
            <p
              className="soft-error-message"
              role="alert"
            >
              {error}
            </p>
          )}

          {/* ASSESSMENT RESULT */}
          {assessmentResult && (
            <section className="soft-result-card">
              <div className="soft-result-header">
                <span className="soft-header-label">
                  YOUR ASSESSMENT RESULT
                </span>

                <h1>Assessment Completed! 🎉</h1>

                <p>
                  Hi {username}, here is your soft skills
                  self-assessment and personalized
                  improvement plan.
                </p>
              </div>

              <div className="soft-overall-score">
                <span>Overall Score</span>

                <strong>
                  {assessmentResult.overall_score}/100
                </strong>
              </div>

              <h2>Your Soft Skills</h2>

              <div className="soft-result-skills">
                {Object.entries(
                  assessmentResult.scores || {}
                ).map(([skill, score]) => (
                  <div
                    className="soft-result-skill"
                    key={skill}
                  >
                    <div className="soft-result-skill-top">
                      <strong>{skill}</strong>

                      <span>
                        {score}/100 · {getScoreLabel(score)}
                      </span>
                    </div>

                    <div className="soft-result-bar">
                      <div
                        className="soft-result-bar-fill"
                        style={{
                          width: `${score}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <h2>Your Strengths 💪</h2>

              {assessmentResult.strong_skills?.length > 0 ? (
                <ul>
                  {assessmentResult.strong_skills.map(
                    (skill) => (
                      <li key={skill}>{skill}</li>
                    )
                  )}
                </ul>
              ) : (
                <p>
                  Keep practicing consistently. You can
                  build strengths with regular effort.
                </p>
              )}

              <h2>Skills to Improve 🎯</h2>

              {assessmentResult.weak_skills?.length > 0 ? (
                assessmentResult.weak_skills.map(
                  (skill) => (
                    <div
                      className="soft-recommendation"
                      key={skill}
                    >
                      <h3>{skill}</h3>

                      <ul>
                        {(
                          assessmentResult.recommendations?.[
                            skill
                          ] || []
                        ).map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )
                )
              ) : (
                <p>
                  Great work! Your self-assessment scores
                  are strong across all six skills.
                  Keep practicing to maintain them.
                </p>
              )}

              <h2>Your 7-Day Improvement Plan 📅</h2>

              <div className="soft-seven-day-plan">
                {(
                  assessmentResult.improvement_plan || []
                ).map((item) => (
                  <div
                    className="soft-plan-day"
                    key={item.day}
                  >
                    <strong>Day {item.day}</strong>
                    <span>{item.skill}</span>
                    <p>{item.task}</p>
                  </div>
                ))}
              </div>

              <button
                className="soft-submit-button"
                type="button"
                onClick={() => navigate("/home")}
              >
                Back to Dashboard →
              </button>
            </section>
          )}

          {/* QUESTION FORM - HIDE AFTER RESULT */}
          {!assessmentResult && (
            <>
              {/* PROGRESS */}
              <div className="soft-progress-card">
                <div className="soft-progress-top">
                  <div>
                    <strong>
                      Assessment Progress
                    </strong>

                    <span>
                      Question {currentQuestion + 1} of{" "}
                      {questions.length}
                    </span>
                  </div>

                  <strong>
                    {Math.round(progress)}%
                  </strong>
                </div>

                <div className="soft-progress-bar">
                  <div
                    className="soft-progress-fill"
                    style={{
                      width: `${progress}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* QUESTION CARD */}
              <section className="soft-question-card">
                <div className="soft-question-top">
                  <div className="soft-skill-icon">
                    {question.icon}
                  </div>

                  <div>
                    <span>SOFT SKILL</span>
                    <h2>{question.skill}</h2>
                  </div>
                </div>

                <div className="soft-question-number">
                  Question {currentQuestion + 1}
                </div>

                <h3 className="soft-question">
                  {question.question}
                </h3>

                <div className="soft-options">
                  {question.options.map(
                    (option, index) => (
                      <button
                        key={option}
                        type="button"
                        className={`soft-option ${
                          answers[currentQuestion] ===
                          option
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          handleAnswer(option)
                        }
                      >
                        <span className="soft-option-number">
                          {String.fromCharCode(65 + index)}
                        </span>

                        <span>{option}</span>

                        <span className="soft-option-check">
                          {answers[currentQuestion] ===
                          option
                            ? "✓"
                            : ""}
                        </span>
                      </button>
                    )
                  )}
                </div>

                {/* QUESTION BUTTONS */}
                <div className="soft-question-actions">
                  <button
                    className="soft-previous-button"
                    type="button"
                    onClick={previousQuestion}
                    disabled={currentQuestion === 0 || loading}
                  >
                    ← Previous
                  </button>

                  {currentQuestion ===
                  questions.length - 1 ? (
                    <button
                      className="soft-submit-button"
                      type="button"
                      onClick={submitAssessment}
                      disabled={loading}
                    >
                      {loading
                        ? "Submitting..."
                        : "Submit Assessment ✓"}
                    </button>
                  ) : (
                    <button
                      className="soft-next-button"
                      type="button"
                      onClick={nextQuestion}
                      disabled={
                        answers[currentQuestion] ===
                          undefined || loading
                      }
                    >
                      Next Question →
                    </button>
                  )}
                </div>
              </section>

              {/* ASSESSMENT INFORMATION */}
              <section className="soft-info-grid">
                <div className="soft-info-card">
                  <div className="soft-info-icon">
                    🎯
                  </div>

                  <div>
                    <h3>What will be assessed?</h3>

                    <p>
                      Communication, teamwork, leadership,
                      problem solving, adaptability and
                      time management.
                    </p>
                  </div>
                </div>

                <div className="soft-info-card">
                  <div className="soft-info-icon">
                    🤖
                  </div>

                  <div>
                    <h3>Personalized Insights</h3>

                    <p>
                      Your assessment results identify
                      soft-skill areas to focus on and
                      provide personalized improvement
                      recommendations.
                    </p>
                  </div>
                </div>

                <div className="soft-info-card">
                  <div className="soft-info-icon">
                    📈
                  </div>

                  <div>
                    <h3>Improve Your Career Readiness</h3>

                    <p>
                      Understand your strengths and focus
                      on soft skills that can support your
                      career development.
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default SoftSkillAssessment;
