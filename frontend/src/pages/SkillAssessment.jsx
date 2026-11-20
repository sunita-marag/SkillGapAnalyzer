import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SkillAssessment.css";

const API_URL = "http://127.0.0.1:8002/api/assessment";
const questions = [
  {
    id: 1,
    skill: "Programming",
    question: "How comfortable are you with programming fundamentals?",
  },
  {
    id: 2,
    skill: "DSA",
    question: "How comfortable are you with Data Structures and Algorithms?",
  },
  {
    id: 3,
    skill: "Database",
    question: "How comfortable are you with databases and SQL?",
  },
  {
    id: 4,
    skill: "Web Development",
    question: "How comfortable are you with web development concepts?",
  },
  {
    id: 5,
    skill: "Python",
    question: "How comfortable are you with Python?",
  },
  {
    id: 6,
    skill: "Git & GitHub",
    question: "How comfortable are you with Git and GitHub?",
  },
  {
    id: 7,
    skill: "REST API",
    question: "How comfortable are you with REST APIs?",
  },
  {
    id: 8,
    skill: "Frontend Development",
    question: "How comfortable are you with frontend development?",
  },
  {
    id: 9,
    skill: "Backend Development",
    question: "How comfortable are you with backend development?",
  },
  {
    id: 10,
    skill: "Problem Solving",
    question: "How comfortable are you with programming problem solving?",
  },
];

const options = ["Beginner", "Intermediate", "Advanced"];

function SkillAssessment() {
  const navigate = useNavigate();

  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [score, setScore] = useState(0);

  const userId = localStorage.getItem("userId");

  // Load the current user's saved assessment from MongoDB.
  useEffect(() => {
    let cancelled = false;

    const loadAssessment = async () => {
      if (!userId) {
        setError(
          "Your user ID is missing. Please log out and log in again."
        );
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/${encodeURIComponent(userId)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to load your assessment."
          );
        }

        if (cancelled) return;

        if (data.completed) {
          const savedAnswers = {};

          questions.forEach((question) => {
            const answer = data.answers?.[question.skill];

            if (options.includes(answer)) {
              savedAnswers[question.id] = answer;
            }
          });

          setSelected(savedAnswers);
          setScore(data.score || 0);
          setSubmitted(true);

          localStorage.setItem(
            "skillAssessment",
            JSON.stringify(data.answers)
          );

          localStorage.setItem("assessmentCompleted", "true");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              "Cannot connect to the backend. Check whether FastAPI is running."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadAssessment();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const completedCount = Object.keys(selected).length;

  const handleSelect = (questionId, value) => {
    setSelected((previous) => ({
      ...previous,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    setError("");

    if (completedCount !== questions.length) {
      setError("Please answer all 10 questions before submitting.");
      return;
    }

    if (!userId) {
      setError("Please log in again before submitting your assessment.");
      return;
    }

    const assessmentResult = questions.reduce(
      (result, question) => {
        result[question.skill] = selected[question.id];
        return result;
      },
      {}
    );

    setIsSaving(true);

    try {
      const response = await fetch(`${API_URL}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          answers: assessmentResult,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to save your assessment."
        );
      }

      // Keep localStorage for compatibility with other pages.
      localStorage.setItem(
        "skillAssessment",
        JSON.stringify(data.answers)
      );

      localStorage.setItem("assessmentCompleted", "true");

      setScore(data.score);
      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      setError(
        err.message ||
          "Cannot save assessment. Please check the backend connection."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetake = () => {
    // Do not delete the database record.
    // A new submission will update the user's latest assessment.
    setSelected({});
    setSubmitted(false);
    setScore(0);
    setError("");

    localStorage.removeItem("skillAssessment");
    localStorage.removeItem("assessmentCompleted");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <div className="assessment-page">
        <p>Loading your assessment...</p>
      </div>
    );
  }

  return (
    <div className="assessment-page">
      <div className="assessment-header">
        <div>
          <span className="assessment-label">
            SKILL ASSESSMENT
          </span>

          <h1>Assess Your Skills</h1>

          <p>
            Answer these questions to determine your current
            technical skill level.
          </p>
        </div>

        <div className="assessment-progress">
          <strong>{completedCount}/10</strong>
          <span>Questions Answered</span>
        </div>
      </div>

      {error && (
        <div className="assessment-error" role="alert">
          {error}
        </div>
      )}

      {!submitted ? (
        <>
          <div className="progress-wrapper">
            <div className="progress-info">
              <span>Assessment Progress</span>
              <strong>
                {Math.round(
                  (completedCount / questions.length) * 100
                )}%
              </strong>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    (completedCount / questions.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="questions-container">
            {questions.map((question, index) => (
              <div
                className="question-card"
                key={question.id}
              >
                <div className="question-number">
                  Question {index + 1}
                </div>

                <h2>{question.question}</h2>

                <p className="question-skill">
                  Skill: {question.skill}
                </p>

                <div className="options-container">
                  {options.map((option) => (
                    <button
                      type="button"
                      key={option}
                      className={`assessment-option ${
                        selected[question.id] === option
                          ? "selected"
                          : ""
                      }`}
                      aria-pressed={
                        selected[question.id] === option
                      }
                      onClick={() =>
                        handleSelect(question.id, option)
                      }
                    >
                      <span className="option-radio">
                        {selected[question.id] === option
                          ? "✓"
                          : ""}
                      </span>

                      <span>{option}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="assessment-submit-area">
            <p>
              {completedCount < questions.length
                ? `Please answer ${
                    questions.length - completedCount
                  } more question${
                    questions.length - completedCount === 1
                      ? ""
                      : "s"
                  }.`
                : "All questions answered. You can submit your assessment."}
            </p>

            <button
              type="button"
              className="submit-assessment"
              onClick={handleSubmit}
              disabled={
                completedCount !== questions.length || isSaving
              }
            >
              {isSaving
                ? "Saving Assessment..."
                : "Submit Assessment →"}
            </button>
          </div>
        </>
      ) : (
        <div className="assessment-result">
          <div className="result-icon">✓</div>

          <span className="assessment-label">
            ASSESSMENT COMPLETED
          </span>

          <h1>Your Assessment is Complete</h1>

          <div className="result-score">
            <strong>{score}%</strong>
            <span>Current Skill Score</span>
          </div>

          <p>
            Your assessment result has been saved to the database.
            Skill Gap Analysis can use your current skill levels
            to compare them with the requirements of your selected
            career.
          </p>

          <div className="result-actions">
            <button
              type="button"
              className="view-gap-button"
              onClick={() => navigate("/skill-gap-analysis")}
            >
              View Skill Gap Analysis →
            </button>

            <button
              type="button"
              className="retake-button"
              onClick={handleRetake}
            >
              Retake Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SkillAssessment;
 