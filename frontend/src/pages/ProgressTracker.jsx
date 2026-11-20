
import React, { useEffect, useState } from "react";
import "../styles/ProgressTracker.css";

const API_BASE_URL = "http://127.0.0.1:8002";

const skillColors = ["purple", "blue", "green", "orange", "pink"];

function formatDate(dateValue) {
  if (!dateValue) return "Recently updated";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "Recently updated";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function ProgressTracker() {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [goal, setGoal] = useState(10);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      const username = localStorage.getItem("username");

      if (!username) {
        setError("Username not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/progress-tracker/${encodeURIComponent(username)}`
        );

        if (!response.ok) {
          throw new Error("Unable to fetch progress data.");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Progress data could not be loaded.");
        }

        setProgressData(data);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="progress-page">
        <h2>Loading your learning progress...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-page">
        <h2>Progress Tracker</h2>
        <p>{error}</p>
        <p>Please check that the backend is running and try again.</p>
      </div>
    );
  }

  const summary = progressData?.summary || {};
  const modules = progressData?.modules || [];

  const totalModules = Number(summary.total_modules) || 0;
  const completedModules = Number(summary.completed_modules) || 0;
  const inProgressModules = Number(summary.in_progress_modules) || 0;

  const overallProgress = Math.min(
    100,
    Math.max(0, Number(summary.overall_progress) || 0)
  );

  const displayedModules = [...modules].sort(
    (a, b) => new Date(b.updated_at || b.created_at || 0) -
              new Date(a.updated_at || a.created_at || 0)
  );

  const displayedActivities = showAll
    ? displayedModules
    : displayedModules.slice(0, 3);

  return (
    <div className="progress-page">
      {/* Header */}
      <header className="progress-header">
        <div>
          <div className="progress-eyebrow">
            YOUR LEARNING ANALYTICS
          </div>

          <h1>Progress Tracker</h1>

          <p>
            Track your learning progress and monitor your completed modules.
          </p>
        </div>

        <div className="streak">
          <span className="streak-icon">📊</span>
          <div>
            <strong>Live Progress</strong>
            <span>Synced with your learning activity</span>
          </div>
        </div>
      </header>

      {/* Live data notice */}
      <div className="progress-demo-notice">
        <span>ⓘ</span>
        <p>
          Your module progress is loaded from your saved account data.
          Study hours and daily streaks are not tracked yet.
        </p>
      </div>

      {/* Summary cards */}
      <section className="progress-stats">
        <article className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon purple-icon">↗</div>
            <span className="stat-badge">Learning</span>
          </div>

          <strong className="stat-number">{overallProgress}%</strong>
          <span className="stat-label">Overall Progress</span>

          <div className="stat-track">
            <div style={{ width: `${overallProgress}%` }} />
          </div>

          <span className="stat-footnote">
            Based on saved module progress
          </span>
        </article>

        <article className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon blue-icon">✧</div>
            <span className="stat-badge">Modules</span>
          </div>

          <strong className="stat-number">{totalModules}</strong>
          <span className="stat-label">Modules Tracked</span>

          <div className="stat-mini-pills">
            <span>{completedModules} completed</span>
            <span>{inProgressModules} in progress</span>
          </div>

          <span className="stat-footnote">
            Saved learning modules
          </span>
        </article>

        <article className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon orange-icon">◷</div>
            <span className="stat-badge">Study time</span>
          </div>

          <strong className="stat-number">—</strong>
          <span className="stat-label">Hours Learned</span>

          <div className="stat-mini-pills">
            <span>Not tracked</span>
          </div>

          <span className="stat-footnote">
            Study-session tracking is not connected yet
          </span>
        </article>

        <article className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon green-icon">✓</div>
            <span className="stat-badge">Achievements</span>
          </div>

          <strong className="stat-number">{completedModules}</strong>
          <span className="stat-label">Completed Modules</span>

          <div className="stat-mini-pills">
            <span>Saved in MongoDB</span>
          </div>

          <span className="stat-footnote">
            Your completed learning modules
          </span>
        </article>
      </section>

      {/* Main analytics */}
      <section className="progress-main">
        <article className="progress-card activity-chart-card">
          <div className="card-heading">
            <div>
              <h2>Learning Activity</h2>
              <p>Your recorded module activity.</p>
            </div>
          </div>

          <div className="chart-summary">
            <div>
              <strong>{totalModules}</strong>
              <span>Modules tracked</span>
            </div>
            <span className="chart-legend">
              <span className="legend-dot" />
              Saved modules
            </span>
          </div>

          {modules.length > 0 ? (
            <div className="activity-chart">
              {modules.map((module, index) => {
                const moduleProgress = Math.min(
                  100,
                  Math.max(0, Number(module.progress) || 0)
                );

                return (
                  <div
                    className="chart-column"
                    key={module.module_id || index}
                  >
                    <span className="chart-value">
                      {moduleProgress}%
                    </span>

                    <div className="chart-bar-area">
                      <div
                        className="chart-bar"
                        style={{
                          height: `${Math.max(7, moduleProgress)}%`
                        }}
                        title={`${module.module_title}: ${moduleProgress}%`}
                      />
                    </div>

                    <span className="chart-day">
                      {module.module_title}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>
              No learning modules recorded yet. Complete a module to see
              your progress here.
            </p>
          )}

          <div className="chart-footer">
            <span>Progress is based on your saved modules.</span>
            <span>Live backend data</span>
          </div>
        </article>

        {/* Overall circular progress */}
        <article className="progress-card overall-card">
          <div className="card-heading">
            <div>
              <h2>Overall Progress</h2>
              <p>Your learning journey at a glance.</p>
            </div>
            <span className="heading-symbol">✦</span>
          </div>

          <div className="overall-progress">
            <div
              className="circle-progress"
              style={{ "--progress": `${overallProgress}%` }}
              role="img"
              aria-label={`${overallProgress}% overall progress`}
            >
              <div className="circle-inner">
                <strong>{overallProgress}%</strong>
                <span>Completed</span>
              </div>
            </div>

            <div className="overall-progress-text">
              <span className="progress-small-label">YOUR JOURNEY</span>

              <h3>
                {overallProgress === 100
                  ? "All modules completed!"
                  : overallProgress > 0
                  ? "You're making progress!"
                  : "Your journey starts here!"}
              </h3>

              <p>
                You have completed {completedModules} out of {totalModules}
                {" "}tracked modules.
              </p>

              <div className="goal-milestone">
                <span className="milestone-check">✓</span>
                <span>{inProgressModules} modules in progress</span>
              </div>
            </div>
          </div>

          <div className="milestone-track">
            <div className="milestone-track-labels">
              <span>Started</span>
              <span>{overallProgress}% complete</span>
              <span>Target</span>
            </div>

            <div className="milestone-bar">
              <div style={{ width: `${overallProgress}%` }} />
            </div>
          </div>
        </article>
      </section>

      {/* Module progress and weekly goal */}
      <section className="progress-lower">
        <article className="progress-card skills-card">
          <div className="card-heading">
            <div>
              <h2>Skills in Progress</h2>
              <p>Progress of your saved learning modules.</p>
            </div>

            <span className="skills-count">
              {modules.length} modules
            </span>
          </div>

          <div className="skill-progress-list">
            {modules.length > 0 ? (
              modules.map((module, index) => {
                const moduleProgress = Math.min(
                  100,
                  Math.max(0, Number(module.progress) || 0)
                );

                const color = skillColors[index % skillColors.length];

                return (
                  <div
                    className="skill-progress-item"
                    key={module.module_id || index}
                  >
                    <div className="skill-row">
                      <div className="skill-details">
                        <span className={`skill-dot ${color}`} />

                        <div>
                          <strong>{module.module_title}</strong>
                          <span>
                            {module.status === "completed"
                              ? "Completed"
                              : "Learning"}
                          </span>
                        </div>
                      </div>

                      <strong className="skill-percentage">
                        {moduleProgress}%
                      </strong>
                    </div>

                    <div
                      className={`skill-track ${color}`}
                      role="progressbar"
                      aria-label={`${module.module_title} progress`}
                      aria-valuenow={moduleProgress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      <div style={{ width: `${moduleProgress}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No modules available yet.</p>
            )}
          </div>

          <p className="skills-note">
            These percentages represent saved module completion,
            not verified skill proficiency.
          </p>
        </article>

        <article className="progress-card goal-card">
          <div className="card-heading">
            <div>
              <h2>Weekly Learning Goal</h2>
              <p>Set a target for your learning time.</p>
            </div>

            <span className="goal-icon">🎯</span>
          </div>

          <div className="goal-number-row">
            <strong>—</strong>
            <span>of {goal} hours</span>
          </div>

          <p>
            Actual study hours are not available because study sessions
            are not currently saved by the backend.
          </p>

          <label className="goal-setting">
            Weekly target
            <select
              value={goal}
              onChange={(event) => setGoal(Number(event.target.value))}
            >
              <option value={5}>5 hours</option>
              <option value={7}>7 hours</option>
              <option value={10}>10 hours</option>
              <option value={14}>14 hours</option>
              <option value={20}>20 hours</option>
            </select>
          </label>

          <div className="goal-tip">
            <span>💡</span>
            <p>
              Study-hour tracking can be added as a separate feature
              when study sessions are saved to the database.
            </p>
          </div>
        </article>
      </section>

      {/* Recent activity */}
      <section className="progress-card recent-activity-card">
        <div className="card-heading">
          <div>
            <h2>Recent Activity</h2>
            <p>Your latest saved learning modules.</p>
          </div>
        </div>

        <div className="activity-list">
          {displayedActivities.length > 0 ? (
            displayedActivities.map((module, index) => (
              <div
                className="activity-item"
                key={module.module_id || index}
              >
                <div className="activity-item-icon">
                  {module.status === "completed" ? "✓" : "📚"}
                </div>

                <div className="activity-item-details">
                  <strong>{module.module_title}</strong>
                  <span>
                    {module.progress || 0}% progress
                  </span>
                </div>

                <span
                  className={`activity-status ${
                    module.status === "completed"
                      ? "completed"
                      : "in-progress"
                  }`}
                >
                  {module.status === "completed"
                    ? "Completed"
                    : "In progress"}
                </span>

                <time className="activity-date">
                  {formatDate(module.updated_at || module.created_at)}
                </time>
              </div>
            ))
          ) : (
            <p>No recent learning activity found.</p>
          )}
        </div>

        {modules.length > 3 && (
          <button
            className="view-activities-button"
            onClick={() => setShowAll((previous) => !previous)}
          >
            {showAll ? "Show less ↑" : "View all activity →"}
          </button>
        )}
      </section>
    </div>
  );
}

export default ProgressTracker;
