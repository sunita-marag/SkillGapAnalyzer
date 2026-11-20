import React, { useEffect, useState } from "react";
import "../styles/SkillGapAnalysis.css";

/*
  Career requirements.

  1 = Beginner
  2 = Intermediate
  3 = Advanced
*/

const careerRequirements = {
  "Python Developer": {
    Python: 3,
    DSA: 2,
    Database: 2,
    "Git & GitHub": 2,
    "REST API": 3,
    "Web Development": 2,
    "Backend Development": 3,
    "Problem Solving": 2,
  },

  "Frontend Developer": {
    Programming: 2,
    "Web Development": 3,
    "Git & GitHub": 2,
    "Frontend Development": 3,
    "REST API": 2,
    "Problem Solving": 2,
  },

  "Full Stack Developer": {
    Programming: 2,
    "Web Development": 3,
    Database: 2,
    "Git & GitHub": 2,
    "Frontend Development": 3,
    "Backend Development": 3,
    "REST API": 3,
    "Problem Solving": 2,
  },

  "Data Analyst": {
    Programming: 2,
    Database: 3,
    Python: 2,
    "Git & GitHub": 2,
    "Problem Solving": 2,
  },

  "Software Developer": {
    Programming: 3,
    DSA: 3,
    Database: 2,
    "Git & GitHub": 2,
    "Problem Solving": 3,
    "Web Development": 2,
  },
};

const levelToNumber = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

const levelToPercentage = {
  Beginner: 35,
  Intermediate: 65,
  Advanced: 90,
};

const numberToLevel = {
  1: "Beginner",
  2: "Intermediate",
  3: "Advanced",
};

function SkillGapAnalysis() {
  const [assessment, setAssessment] = useState(null);
  const [career, setCareer] = useState("");
  const [analysis, setAnalysis] = useState([]);

  useEffect(() => {
    const savedAssessment = localStorage.getItem("skillAssessment");
    const savedCareer = localStorage.getItem("careerGoal");

    if (savedAssessment) {
      setAssessment(JSON.parse(savedAssessment));
    }

    setCareer(savedCareer || "Python Developer");
  }, []);

  useEffect(() => {
    if (!assessment) {
      return;
    }

    const selectedCareer =
      careerRequirements[career] ||
      careerRequirements["Python Developer"];

    const result = Object.entries(selectedCareer).map(
      ([skill, requiredLevel]) => {
        const currentLevel =
          assessment[skill] || "Beginner";

        const currentNumber =
          levelToNumber[currentLevel];

        const currentPercentage =
          levelToPercentage[currentLevel];

        const targetPercentage =
          levelToPercentage[numberToLevel[requiredLevel]];

        const gap = Math.max(
          targetPercentage - currentPercentage,
          0
        );

        let status = "Strong";

        if (currentNumber < requiredLevel) {
          if (gap >= 30) {
            status = "Needs Improvement";
          } else {
            status = "Developing";
          }
        }

        return {
          skill,
          currentLevel,
          requiredLevel: numberToLevel[requiredLevel],
          currentPercentage,
          targetPercentage,
          gap,
          status,
        };
      }
    );

    setAnalysis(result);

    /*
      Save the gaps.

      Learning Roadmap will use this data.
    */
    localStorage.setItem(
      "skillGaps",
      JSON.stringify(result)
    );
  }, [assessment, career]);

  const overallScore =
    analysis.length > 0
      ? Math.round(
          analysis.reduce(
            (sum, item) => sum + item.currentPercentage,
            0
          ) / analysis.length
        )
      : 0;

  const totalCurrent =
    analysis.reduce(
      (sum, item) => sum + item.currentPercentage,
      0
    );

  const totalTarget =
    analysis.reduce(
      (sum, item) => sum + item.targetPercentage,
      0
    );

  const careerReadiness =
    analysis.length > 0
      ? Math.min(
          Math.round(
            (totalCurrent / totalTarget) * 100
          ),
          100
        )
      : 0;

  const strongSkills = analysis.filter(
    (item) => item.status === "Strong"
  ).length;

  const skillGaps = analysis.filter(
    (item) => item.status !== "Strong"
  ).length;

  const priorityGaps = [...analysis]
    .filter((item) => item.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);

  if (!assessment) {
    return (
      <div className="gap-page">

        <div className="gap-empty">

          <div className="empty-icon">
            📝
          </div>

          <h1>Complete Your Skill Assessment</h1>

          <p>
            Skill Gap Analysis uses the results from your Skill
            Assessment. Please complete the assessment first.
          </p>

          <button
            onClick={() => {
              window.location.href =
                "/skill-assessment";
            }}
          >
            Take Skill Assessment →
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="gap-page">

      {/* HEADER */}

      <div className="gap-header">

        <div>
          <span className="gap-label">
            SKILL GAP ANALYSIS
          </span>

          <h1>Your Skill Gap Analysis</h1>

          <p>
            Your assessment results compared with the
            requirements for{" "}
            <strong>{career}</strong>.
          </p>
        </div>

        <button
          className="refresh-analysis"
          onClick={() => {
            window.location.reload();
          }}
        >
          ↻ Re-analyze
        </button>

      </div>

      {/* SUMMARY */}

      <div className="gap-summary">

        <div className="summary-card">
          <span>Overall Skill Score</span>

          <strong>{overallScore}%</strong>

          <small>
            Based on assessment
          </small>
        </div>

        <div className="summary-card">
          <span>Strong Skills</span>

          <strong>{strongSkills}</strong>

          <small>
            Meeting career target
          </small>
        </div>

        <div className="summary-card">
          <span>Skill Gaps</span>

          <strong>{skillGaps}</strong>

          <small>
            Need improvement
          </small>
        </div>

        <div className="summary-card">
          <span>Career Readiness</span>

          <strong>{careerReadiness}%</strong>

          <small>
            Based on required skills
          </small>
        </div>

      </div>

      {/* EXPLANATION */}

      <div className="analysis-info">

        <div className="info-icon">
          ✓
        </div>

        <div>
          <strong>
            How your analysis works
          </strong>

          <p>
            Your Skill Assessment result is compared with
            the expected skill level for your selected career.
            No additional assessment is required here.
          </p>
        </div>

      </div>

      {/* SKILLS */}

      <div className="skills-panel">

        <div className="panel-heading">

          <div>
            <h2>Skills Overview</h2>

            <p className="panel-description">
              Current level compared with the required level
              for {career}.
            </p>
          </div>

        </div>

        {analysis.map((item) => (
          <div
            className="skill-item"
            key={item.skill}
          >

            <div className="skill-name">

              <div>
                <strong>{item.skill}</strong>

                <span className="level-text">
                  {item.currentLevel} → Required{" "}
                  {item.requiredLevel}
                </span>
              </div>

              <span>
                {item.currentPercentage}%
              </span>

            </div>

            <div className="skill-bar">

              <div
                className="skill-target"
                style={{
                  left: `${item.targetPercentage}%`,
                }}
              ></div>

              <div
                className={`skill-progress ${
                  item.status === "Strong"
                    ? "strong"
                    : item.status === "Developing"
                    ? "developing"
                    : "needs-improvement"
                }`}
                style={{
                  width: `${item.currentPercentage}%`,
                }}
              ></div>

            </div>

            <div className="skill-bottom">

              <small>
                Target: {item.targetPercentage}%
              </small>

              <span
                className={`skill-status ${item.status
                  .toLowerCase()
                  .replaceAll(" ", "-")}`}
              >
                {item.status}
              </span>

            </div>

          </div>
        ))}

      </div>

      {/* PRIORITY GAPS */}

      {priorityGaps.length > 0 && (
        <div className="priority-panel">

          <div>
            <span className="gap-label">
              PRIORITY AREAS
            </span>

            <h2>
              Skills You Should Focus On
            </h2>

            <p>
              These are the largest gaps identified from
              your assessment.
            </p>
          </div>

          <div className="priority-list">

            {priorityGaps.map((item, index) => (
              <div
                className="priority-item"
                key={item.skill}
              >

                <div className="priority-number">
                  {index + 1}
                </div>

                <div className="priority-content">

                  <strong>{item.skill}</strong>

                  <span>
                    {item.currentLevel} →{" "}
                    {item.requiredLevel}
                  </span>

                </div>

                <div className="priority-gap">
                  -{item.gap}%
                </div>

              </div>
            ))}

          </div>

        </div>
      )}

      {/* ROADMAP LINK */}

      <div className="recommendation-card">

        <div className="recommendation-icon">
          🤖
        </div>

        <div>

          <h2>
            Your Personalized Learning Roadmap
          </h2>

          <p>
            Your identified skill gaps have been saved and
            will be used to create a learning roadmap focused
            on the areas that need improvement.
          </p>

          <button
            onClick={() => {
              window.location.href =
                "/learning-roadmap";
            }}
          >
            View Learning Roadmap →
          </button>

        </div>

      </div>

    </div>
  );
}

export default SkillGapAnalysis;