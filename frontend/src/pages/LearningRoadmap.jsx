
import React, { useEffect, useState } from "react";
import "../styles/LearningRoadmap.css";

const API_URL = "http://127.0.0.1:8002/api/learning-roadmap";
const PROGRESS_API = "http://127.0.0.1:8002/api/progress-tracker";

function createModuleId(skill) {
  const slug = skill
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  return `roadmap_${slug}`;
}

function calculateProgress(modules) {
  if (!modules || modules.length === 0) return 0;

  const total = modules.reduce(
    (sum, module) => sum + Number(module.progress || 0),
    0
  );

  return Math.round(total / modules.length);
}

function LearningRoadmap() {
  const [roadmap, setRoadmap] = useState([]);
  const [career, setCareer] = useState("Python Developer");
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [savingModule, setSavingModule] = useState(null);

  const username = localStorage.getItem("username");

  useEffect(() => {
    const generateRoadmaps = async () => {
      try {
        const savedGaps = localStorage.getItem("skillGaps");
        const savedCareer = localStorage.getItem("careerGoal");

        setCareer(savedCareer || "Python Developer");

        if (!savedGaps) {
          setRoadmap([]);
          setLoading(false);
          return;
        }

        const gaps = JSON.parse(savedGaps);

        const positiveGaps = gaps
          .filter((item) => Number(item.gap) > 0)
          .sort((a, b) => Number(b.gap) - Number(a.gap));

        if (positiveGaps.length === 0) {
          setRoadmap([]);
          setLoading(false);
          return;
        }

        const savedRoadmap = JSON.parse(
          localStorage.getItem("learningRoadmap") || "[]"
        );

        // Generate AI roadmaps
        const generatedModules = await Promise.all(
          positiveGaps.map(async (item, index) => {
            const response = await fetch(API_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                skill: item.skill,
                current_level: item.currentLevel || "Beginner",
                goal: savedCareer || "Become job-ready",
                duration_weeks: 4,
                hours_per_day: 2,
              }),
            });

            if (!response.ok) {
              throw new Error(
                `Roadmap generation failed for ${item.skill}`
              );
            }

            const data = await response.json();

            if (!data.success || !data.roadmap) {
              throw new Error(
                `Invalid roadmap response for ${item.skill}`
              );
            }

            const generated = data.roadmap;

            const previous = savedRoadmap.find(
              (module) => module.skill === item.skill
            );

            return {
              moduleId: createModuleId(item.skill),
              number: String(index + 1).padStart(2, "0"),
              skill: item.skill,
              title: `${item.skill} Learning Roadmap`,
              duration: `${generated.duration_weeks} Weeks`,
              overview: generated.overview,
              phases: generated.phases,
              generationSource: generated.generation_source,
              gap: item.gap,
              currentLevel: item.currentLevel || "Beginner",
              requiredLevel: item.requiredLevel || "Job Ready",
              status: previous?.status || (
                index === 0 ? "In Progress" : "Upcoming"
              ),
              progress: previous?.progress || 0,
            };
          })
        );

        // Restore progress from MongoDB
        let finalModules = generatedModules;
        let savedProgressMap = new Map();
        let progressFetchSucceeded = false;

        if (username) {
          try {
            const progressResponse = await fetch(
              `${PROGRESS_API}/${encodeURIComponent(username)}`
            );

            if (!progressResponse.ok) {
              throw new Error("Unable to fetch saved progress");
            }

            const progressData = await progressResponse.json();

            if (progressData.success && progressData.modules) {
              savedProgressMap = new Map(
                progressData.modules.map((module) => [
                  module.module_id,
                  module,
                ])
              );

              progressFetchSucceeded = true;

              finalModules = generatedModules.map((module) => {
                const saved = savedProgressMap.get(module.moduleId);

                if (!saved) return module;

                return {
                  ...module,
                  progress: saved.progress ?? 0,
                  status:
                    saved.status === "completed"
                      ? "Completed"
                      : saved.status === "in_progress"
                      ? "In Progress"
                      : "Upcoming",
                };
              });
            }
          } catch (progressError) {
            console.error(
              "Progress restore error:",
              progressError
            );

            setActionError(
              "Saved progress could not be loaded. Please check your backend connection."
            );
          }
        }

        // NEW: Save the first module as In Progress
        // only if it does not already exist in MongoDB.
        if (
          username &&
          progressFetchSucceeded &&
          finalModules.length > 0
        ) {
          const firstModule = finalModules[0];
          const alreadySaved = savedProgressMap.has(
            firstModule.moduleId
          );

          if (!alreadySaved) {
            try {
              await saveModuleProgress(
                firstModule,
                "in_progress",
                0
              );

              finalModules[0] = {
                ...firstModule,
                progress: 0,
                status: "In Progress",
              };
            } catch (saveError) {
              console.error(
                "Initial progress save error:",
                saveError
              );

              setActionError(
                "Your roadmap loaded, but initial progress could not be saved. Please check your backend connection."
              );
            }
          }
        }

        setRoadmap(finalModules);
        setOverallProgress(calculateProgress(finalModules));

        localStorage.setItem(
          "learningRoadmap",
          JSON.stringify(finalModules)
        );

        setError("");
      } catch (err) {
        console.error("Learning roadmap error:", err);

        setError(
          err.message ||
          "Unable to generate your learning roadmap."
        );
      } finally {
        setLoading(false);
      }
    };

    generateRoadmaps();
  }, []);

  // Save module progress to MongoDB
  const saveModuleProgress = async (module, status, progress) => {
    if (!username) {
      throw new Error(
        "Username not found. Please login again."
      );
    }

    const response = await fetch(`${PROGRESS_API}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username,
        module_id: module.moduleId,
        module_title: module.title,
        status,
        progress,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.detail || "Unable to save module progress."
      );
    }

    return data;
  };

  // Mark module as completed
  const updateModule = async (number) => {
    const moduleIndex = roadmap.findIndex(
      (module) => module.number === number
    );

    if (moduleIndex === -1) return;

    const currentModule = roadmap[moduleIndex];

    if (currentModule.status === "Completed") return;

    setSavingModule(number);
    setActionError("");

    try {
      // Save completed module in MongoDB
      await saveModuleProgress(
        currentModule,
        "completed",
        100
      );

      let updated = roadmap.map((module) => ({ ...module }));

      updated[moduleIndex] = {
        ...updated[moduleIndex],
        progress: 100,
        status: "Completed",
      };

      // Start the next module
      if (moduleIndex + 1 < updated.length) {
        const nextModule = updated[moduleIndex + 1];

        if (nextModule.status === "Upcoming") {
          await saveModuleProgress(
            nextModule,
            "in_progress",
            0
          );

          updated[moduleIndex + 1] = {
            ...nextModule,
            progress: 0,
            status: "In Progress",
          };
        }
      }

      setRoadmap(updated);
      setOverallProgress(calculateProgress(updated));

      localStorage.setItem(
        "learningRoadmap",
        JSON.stringify(updated)
      );
    } catch (err) {
      console.error("Progress update error:", err);
      setActionError(err.message);
    } finally {
      setSavingModule(null);
    }
  };

  if (!localStorage.getItem("skillGaps")) {
    return (
      <div className="roadmap-page">
        <div className="roadmap-empty">
          <div className="roadmap-empty-icon">🗺️</div>

          <h1>Learning Roadmap Not Available</h1>

          <p>
            Complete your Skill Assessment and Skill Gap
            Analysis first. Your personalized roadmap will
            then be generated from your identified skill gaps.
          </p>

          <button
            onClick={() => {
              window.location.href = "/skill-assessment";
            }}
          >
            Start Skill Assessment →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="roadmap-page">
      {/* HEADER */}
      <div className="roadmap-header">
        <div>
          <span className="roadmap-label">
            PERSONALIZED ROADMAP
          </span>

          <h1>Your Learning Roadmap</h1>

          <p>
            Your AI-generated learning path for{" "}
            <strong>{career}</strong>.
          </p>
        </div>

        <div className="roadmap-score">
          <strong>{overallProgress}%</strong>
          <span>Overall Progress</span>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="roadmap-empty">
          <div className="roadmap-empty-icon">🤖</div>
          <h2>Generating Your AI Roadmap...</h2>
          <p>
            Gemini is preparing personalized topics,
            activities and projects for your skill gaps.
            Please wait.
          </p>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="roadmap-empty">
          <div className="roadmap-empty-icon">⚠️</div>
          <h2>Roadmap Generation Failed</h2>
          <p>{error}</p>

          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      )}

      {/* PROGRESS SAVE ERROR */}
      {!loading && actionError && (
        <div className="roadmap-empty">
          <p>{actionError}</p>
        </div>
      )}

      {/* ROADMAP */}
      {!loading && !error && roadmap.length > 0 && (
        <div className="roadmap-container">
          <div className="roadmap-intro">
            <strong>
              Your roadmap is generated using AI
            </strong>

            <p>
              Skills with larger gaps are prioritized.
              Each roadmap contains weekly topics,
              practical activities, projects and milestones.
            </p>
          </div>

          {roadmap.map((item) => (
            <div className="roadmap-step" key={item.moduleId}>
              <div className="step-number">
                {item.number}
              </div>

              <div className="step-content">
                <div className="step-top">
                  <div>
                    <h2>{item.title}</h2>
                    <span>{item.duration}</span>
                  </div>

                  <span
                    className={`roadmap-status ${item.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="gap-information">
                  Skill Gap:{" "}
                  <strong>{item.currentLevel}</strong>
                  {" → "}
                  <strong>{item.requiredLevel}</strong>

                  <span>Gap: {item.gap}%</span>
                </div>

                <p>{item.overview}</p>

                <p>
                  <strong>AI Source: </strong>
                  {item.generationSource === "gemini"
                    ? "Google Gemini"
                    : "Local Roadmap Templates"}
                </p>

                {/* WEEKLY PHASES */}
                {item.phases.map((phase) => (
                  <div
                    className="roadmap-week"
                    key={phase.week}
                  >
                    <h3>
                      Week {phase.week}: {phase.title}
                    </h3>

                    <h4>Topics to Learn</h4>

                    <div className="topic-list">
                      {phase.topics.map((topic, index) => (
                        <span key={index}>{topic}</span>
                      ))}
                    </div>

                    <h4>Activities</h4>

                    <ul>
                      {phase.activities.map((activity, index) => (
                        <li key={index}>{activity}</li>
                      ))}
                    </ul>

                    <h4>Practical Project</h4>
                    <p>{phase.project}</p>

                    <h4>Weekly Milestone</h4>
                    <p>{phase.milestone}</p>

                    <h4>Learning Resources</h4>

                    <ul>
                      {phase.resources?.map((resource, index) => (
                        <li key={index}>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {resource.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* PROGRESS */}
                <div className="module-progress">
                  <div className="module-progress-info">
                    <span>Module Progress</span>
                    <strong>{item.progress}%</strong>
                  </div>

                  <div className="module-progress-bar">
                    <div
                      className="module-progress-fill"
                      style={{
                        width: `${item.progress}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <button
                  onClick={() => updateModule(item.number)}
                  disabled={
                    item.status === "Completed" ||
                    savingModule === item.number
                  }
                >
                  {savingModule === item.number
                    ? "Saving..."
                    : item.status === "Completed"
                    ? "Module Completed ✓"
                    : "Mark Module Complete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NO SKILL GAPS */}
      {!loading && !error && roadmap.length === 0 && (
        <div className="roadmap-empty">
          <div className="roadmap-empty-icon">🎉</div>

          <h1>No Major Skill Gaps Found</h1>

          <p>
            Your assessment shows that your current skills
            already meet the selected career requirements.
            Continue practicing and building projects.
          </p>
        </div>
      )}
    </div>
  );
}

export default LearningRoadmap;
