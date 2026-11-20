import React, { useMemo, useRef, useState } from "react";
import "../styles/ResumeCenter.css";

const initialResume = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  jobTitle: "",
  summary: "",
  education: "",
  skills: "",
  projects: "",
  certifications: "",
  experience: "",
};

const templates = [
  { id: "modern", name: "Modern", description: "Clean and contemporary" },
  { id: "classic", name: "Classic", description: "Traditional professional" },
  { id: "minimal", name: "Minimal", description: "Simple and elegant" },
];

function ResumeCenter() {
  const [resume, setResume] = useState(initialResume);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [resumeFile, setResumeFile] = useState(null);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const fileInputRef = useRef(null);

  const updateField = (event) => {
    const { name, value } = event.target;

    setResume((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSaved(false);
    setNotice("");
  };

  const completion = useMemo(() => {
    const fields = [
      resume.fullName,
      resume.email,
      resume.phone,
      resume.location,
      resume.jobTitle,
      resume.summary,
      resume.education,
      resume.skills,
      resume.projects,
      resume.certifications,
      resume.experience,
    ];

    return Math.round(
      (fields.filter((field) => field.trim().length > 0).length /
        fields.length) *
        100
    );
  }, [resume]);

  const suggestions = useMemo(() => {
    const items = [];

    if (!resume.summary.trim()) {
      items.push({
        title: "Add a professional summary",
        detail: "Introduce yourself and describe your career goals.",
      });
    }

    if (!resume.skills.trim()) {
      items.push({
        title: "Add your technical skills",
        detail: "Include relevant programming languages, tools and frameworks.",
      });
    }

    if (!resume.projects.trim()) {
      items.push({
        title: "Showcase your projects",
        detail: "Include your project objectives, technologies and results.",
      });
    }

    if (!resume.education.trim()) {
      items.push({
        title: "Complete your education",
        detail: "Add your degree or diploma, institution and graduation year.",
      });
    }

    if (!resume.certifications.trim()) {
      items.push({
        title: "Include certifications",
        detail: "Add relevant courses, training or professional certificates.",
      });
    }

    if (!resume.experience.trim()) {
      items.push({
        title: "Add experience or internships",
        detail: "Include internships, practical training or relevant work.",
      });
    }

    if (items.length === 0) {
      items.push({
        title: "Your resume sections are complete!",
        detail: "Review your spelling and add measurable project achievements.",
      });
    }

    return items;
  }, [resume]);

  const handleSave = (event) => {
    event.preventDefault();

    if (!resume.fullName.trim()) {
      setNotice("Please enter your full name before saving.");
      return;
    }

    localStorage.setItem("skillgap-resume", JSON.stringify(resume));
    localStorage.setItem("skillgap-resume-template", selectedTemplate);

    setSaved(true);
    setNotice("Resume saved successfully in this browser.");
  };

  const loadSavedResume = () => {
    try {
      const storedResume = localStorage.getItem("skillgap-resume");
      const storedTemplate = localStorage.getItem(
        "skillgap-resume-template"
      );

      if (storedResume) {
        setResume({ ...initialResume, ...JSON.parse(storedResume) });
        setSelectedTemplate(storedTemplate || "modern");
        setSaved(true);
        setShowForm(true);
        setShowPreview(false);
        setNotice("Your saved resume has been loaded.");
      } else {
        setShowForm(true);
        setActiveTab("details");
        setNotice("Start entering your resume details below.");
      }
    } catch {
      setNotice("Unable to load the saved resume.");
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const validExtension = /\.(pdf|doc|docx)$/i.test(file.name);

    if (!validExtension) {
      setNotice("Please select a PDF, DOC or DOCX resume.");
      event.target.value = "";
      return;
    }

    setResumeFile(file);
    setNotice(
      `${file.name} selected. Its contents are not parsed automatically yet.`
    );
  };

  const escapeHtml = (value = "") =>
    value.replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };

      return entities[character];
    });

  const downloadResume = () => {
    if (!resume.fullName.trim()) {
      setNotice("Enter your name before downloading your resume.");
      setShowForm(true);
      return;
    }

    const section = (heading, content) =>
      content.trim()
        ? `<section><h2>${heading}</h2><p>${escapeHtml(content).replace(
            /\n/g,
            "<br>"
          )}</p></section>`
        : "";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(resume.fullName)} - Resume</title>
<style>
body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:30px;color:#1e293b;line-height:1.6}
header{border-bottom:3px solid #635bdb;padding-bottom:18px}
h1{color:#312e81;margin-bottom:4px}
h2{font-size:17px;color:#4338ca;border-bottom:1px solid #ddd;padding-bottom:5px}
p{white-space:normal;overflow-wrap:anywhere}
@media print{body{margin:0;padding:20px}}
</style>
</head>
<body>
<header>
<h1>${escapeHtml(resume.fullName)}</h1>
<p>${escapeHtml(resume.jobTitle)}</p>
<p>${escapeHtml(resume.email)} ${
      resume.phone ? "| " + escapeHtml(resume.phone) : ""
    } ${resume.location ? "| " + escapeHtml(resume.location) : ""}</p>
</header>
${section("Professional Summary", resume.summary)}
${section("Education", resume.education)}
${section("Technical Skills", resume.skills)}
${section("Projects", resume.projects)}
${section("Experience / Internships", resume.experience)}
${section("Certifications", resume.certifications)}
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${resume.fullName
      .trim()
      .replace(/[^a-z0-9_-]+/gi, "_")}_Resume.html`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setNotice(
      "Resume downloaded as HTML. Open it in your browser and choose Print → Save as PDF."
    );
  };

  const startNewResume = () => {
    setResume(initialResume);
    setResumeFile(null);
    setSaved(false);
    setShowPreview(false);
    setShowForm(true);
    setActiveTab("details");
    setNotice("Create your new resume by filling in the details.");
  };

  return (
    <div className="resume-page">
      <div className="resume-header">
        <div className="resume-heading">
          <span className="resume-eyebrow">CAREER TOOLKIT</span>
          <h1>Resume Center</h1>
          <p>Create, customize and improve your professional resume.</p>
        </div>

        <button
          className="resume-primary-button"
          onClick={startNewResume}
        >
          <span>＋</span> Create Resume
        </button>
      </div>

      {notice && (
        <div className="resume-notice" role="status">
          <span>{saved ? "✓" : "ℹ"}</span>
          {notice}
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      <section className="resume-welcome">
        <div className="resume-welcome-content">
          <span className="resume-welcome-label">
            YOUR NEXT OPPORTUNITY STARTS HERE
          </span>
          <h2>Make your skills stand out.</h2>
          <p>
            Build a resume that highlights your education, technical skills
            and projects. Get ready for your next internship or job.
          </p>
          <button
            className="resume-light-button"
            onClick={loadSavedResume}
          >
            {localStorage.getItem("skillgap-resume")
              ? "Continue My Resume →"
              : "Build My Resume →"}
          </button>
        </div>

        <div className="resume-welcome-art" aria-hidden="true">
          <div className="resume-art-orbit orbit-one"></div>
          <div className="resume-art-orbit orbit-two"></div>
          <div className="resume-art-paper">
            <div className="resume-art-avatar">✦</div>
            <div className="resume-art-line line-wide"></div>
            <div className="resume-art-line"></div>
            <div className="resume-art-heading"></div>
            <div className="resume-art-line line-wide"></div>
            <div className="resume-art-line"></div>
            <div className="resume-art-line line-short"></div>
            <div className="resume-art-badge">✓ Ready to grow</div>
          </div>
        </div>
      </section>

      <div className="resume-section-heading">
        <div>
          <h2>Your resume workspace</h2>
          <p>Everything you need to prepare a job-ready resume.</p>
        </div>
      </div>

      <section className="resume-grid">
        <article className="resume-card resume-main-card">
          <div className="resume-card-top">
            <div className="resume-icon resume-icon-purple">▤</div>
            <span className="resume-status">
              {saved ? "Saved" : "Workspace"}
            </span>
          </div>

          <h3>My Resume</h3>
          <p>
            {resume.fullName
              ? `${resume.fullName} — ${resume.jobTitle || "Add your target role"}`
              : "Create your first resume or continue editing your existing one."}
          </p>

          <div className="resume-progress">
            <span>Profile completion</span>
            <strong>{completion}%</strong>
          </div>

          <div
            className="resume-bar"
            role="progressbar"
            aria-valuenow={completion}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Resume profile completion"
          >
            <div style={{ width: `${completion}%` }}></div>
          </div>

          <button
            className="resume-card-button"
            onClick={loadSavedResume}
          >
            {resume.fullName ? "Edit Resume" : "Create Your Resume"} →
          </button>
        </article>

        <article className="resume-card">
          <div className="resume-card-top">
            <div className="resume-icon resume-icon-orange">✧</div>
            <span className="resume-count">{suggestions.length} tips</span>
          </div>

          <h3>Resume Suggestions</h3>
          <p>Identify missing sections and improve your resume content.</p>

          <ul className="resume-suggestion-list">
            {suggestions.slice(0, 2).map((suggestion) => (
              <li key={suggestion.title}>
                <span className="resume-check">✓</span>
                {suggestion.title}
              </li>
            ))}
          </ul>

          <button
            className="resume-card-button"
            onClick={() => {
              setShowForm(true);
              setActiveTab("suggestions");
              setShowPreview(false);
            }}
          >
            View Suggestions →
          </button>
        </article>

        <article className="resume-card">
          <div className="resume-card-top">
            <div className="resume-icon resume-icon-blue">▧</div>
            <span className="resume-count">3 styles</span>
          </div>

          <h3>Resume Templates</h3>
          <p>
            Choose a layout that presents your education, skills and
            experience professionally.
          </p>

          <div className="resume-template-mini-list">
            {templates.map((template) => (
              <button
                type="button"
                key={template.id}
                className={`resume-template-chip ${
                  selectedTemplate === template.id ? "selected" : ""
                }`}
                onClick={() => {
                  setSelectedTemplate(template.id);
                  setSaved(false);
                }}
                aria-pressed={selectedTemplate === template.id}
              >
                {template.name}
              </button>
            ))}
          </div>

          <button
            className="resume-card-button"
            onClick={() => {
              setShowForm(true);
              setActiveTab("details");
              setShowPreview(true);
            }}
          >
            Customize Template →
          </button>
        </article>
      </section>

      <section className="resume-upload-panel">
        <div className="resume-upload-icon">↑</div>
        <div className="resume-upload-text">
          <h3>Already have a resume?</h3>
          <p>
            Select an existing PDF, DOC or DOCX file to keep it ready for
            review. Automatic document parsing is not enabled yet.
          </p>
          {resumeFile && (
            <div className="resume-selected-file">
              <span>📄</span>
              <span>{resumeFile.name}</span>
              <button
                type="button"
                onClick={() => {
                  setResumeFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                aria-label="Remove selected file"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="resume-hidden-input"
          onChange={handleFileChange}
          aria-label="Choose an existing resume"
        />

        <button
          className="resume-outline-button"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload Resume
        </button>
      </section>

      {showForm && (
        <section className="resume-editor" id="resume-editor">
          <div className="resume-editor-header">
            <div>
              <span className="resume-eyebrow">RESUME BUILDER</span>
              <h2>{showPreview ? "Resume Preview" : "Build your resume"}</h2>
              <p>Complete your details, then preview and download.</p>
            </div>

            <button
              className="resume-close-button"
              onClick={() => {
                setShowForm(false);
                setShowPreview(false);
              }}
              aria-label="Close resume builder"
            >
              ×
            </button>
          </div>

          <div className="resume-editor-tabs">
            <button
              className={activeTab === "details" ? "active" : ""}
              onClick={() => {
                setActiveTab("details");
                setShowPreview(false);
              }}
            >
              1. Personal Details
            </button>
            <button
              className={activeTab === "suggestions" ? "active" : ""}
              onClick={() => {
                setActiveTab("suggestions");
                setShowPreview(false);
              }}
            >
              2. Improvement Tips
            </button>
          </div>

          {activeTab === "details" && !showPreview && (
            <form className="resume-form" onSubmit={handleSave}>
              <div className="resume-form-grid">
                <label>
                  Full Name *
                  <input
                    name="fullName"
                    value={resume.fullName}
                    onChange={updateField}
                    placeholder="e.g. Your Full Name"
                    required
                  />
                </label>

                <label>
                  Target Job Role
                  <input
                    name="jobTitle"
                    value={resume.jobTitle}
                    onChange={updateField}
                    placeholder="e.g. Python Developer"
                  />
                </label>

                <label>
                  Email Address
                  <input
                    type="email"
                    name="email"
                    value={resume.email}
                    onChange={updateField}
                    placeholder="you@example.com"
                  />
                </label>

                <label>
                  Phone Number
                  <input
                    type="tel"
                    name="phone"
                    value={resume.phone}
                    onChange={updateField}
                    placeholder="Your contact number"
                  />
                </label>

                <label className="resume-full-width">
                  Location
                  <input
                    name="location"
                    value={resume.location}
                    onChange={updateField}
                    placeholder="City, State"
                  />
                </label>

                <label className="resume-full-width">
                  Professional Summary
                  <textarea
                    name="summary"
                    value={resume.summary}
                    onChange={updateField}
                    rows="3"
                    placeholder="Write 2–4 sentences about your skills, strengths and career goals."
                  />
                </label>

                <label className="resume-full-width">
                  Education
                  <textarea
                    name="education"
                    value={resume.education}
                    onChange={updateField}
                    rows="3"
                    placeholder="Degree or diploma, institution, graduation year and grades (optional)"
                  />
                </label>

                <label className="resume-full-width">
                  Technical Skills
                  <textarea
                    name="skills"
                    value={resume.skills}
                    onChange={updateField}
                    rows="3"
                    placeholder="e.g. Python, Java, React, SQL, Git"
                  />
                </label>

                <label className="resume-full-width">
                  Projects
                  <textarea
                    name="projects"
                    value={resume.projects}
                    onChange={updateField}
                    rows="4"
                    placeholder="Project name, technologies used, your contribution and results."
                  />
                </label>

                <label className="resume-full-width">
                  Experience / Internships
                  <textarea
                    name="experience"
                    value={resume.experience}
                    onChange={updateField}
                    rows="3"
                    placeholder="Role, organization, dates and responsibilities. Include relevant training if applicable."
                  />
                </label>

                <label className="resume-full-width">
                  Certifications
                  <textarea
                    name="certifications"
                    value={resume.certifications}
                    onChange={updateField}
                    rows="2"
                    placeholder="Certification name and issuing organization"
                  />
                </label>
              </div>

              <div className="resume-form-actions">
                <button type="submit" className="resume-primary-button">
                  Save Resume
                </button>
                <button
                  type="button"
                  className="resume-outline-button"
                  onClick={() => setShowPreview(true)}
                >
                  Preview Resume
                </button>
                <button
                  type="button"
                  className="resume-outline-button"
                  onClick={downloadResume}
                >
                  Download Resume
                </button>
              </div>
            </form>
          )}

          {activeTab === "suggestions" && (
            <div className="resume-tips-panel">
              <div className="resume-tip-summary">
                <strong>{completion}%</strong>
                <span>of your resume fields completed</span>
              </div>

              {suggestions.map((suggestion) => (
                <div className="resume-tip-item" key={suggestion.title}>
                  <span className="resume-tip-dot">✦</span>
                  <div>
                    <h4>{suggestion.title}</h4>
                    <p>{suggestion.detail}</p>
                  </div>
                </div>
              ))}

              <button
                className="resume-primary-button"
                onClick={() => {
                  setActiveTab("details");
                  setShowPreview(false);
                }}
              >
                Improve My Resume →
              </button>
            </div>
          )}

          {activeTab === "details" && showPreview && (
            <div className={`resume-preview resume-preview-${selectedTemplate}`}>
              <div className="resume-preview-header">
                <div>
                  <h1>{resume.fullName || "Your Name"}</h1>
                  <p>{resume.jobTitle || "Your Target Job Role"}</p>
                  <p className="resume-preview-contact">
                    {[resume.email, resume.phone, resume.location]
                      .filter(Boolean)
                      .join(" · ") || "Your contact information"}
                  </p>
                </div>
                <span className="resume-preview-template">
                  {selectedTemplate} template
                </span>
              </div>

              {[
                ["Professional Summary", resume.summary],
                ["Education", resume.education],
                ["Technical Skills", resume.skills],
                ["Projects", resume.projects],
                ["Experience / Internships", resume.experience],
                ["Certifications", resume.certifications],
              ].map(
                ([heading, content]) =>
                  content.trim() && (
                    <div className="resume-preview-section" key={heading}>
                      <h3>{heading}</h3>
                      <p>{content}</p>
                    </div>
                  )
              )}

              <div className="resume-form-actions">
                <button
                  className="resume-outline-button"
                  onClick={() => setShowPreview(false)}
                >
                  ← Back to Editing
                </button>
                <button
                  className="resume-primary-button"
                  onClick={downloadResume}
                >
                  Download Resume
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      <div className="resume-bottom-note">
        <span>✦</span>
        <p>
          <strong>Resume tip:</strong> Highlight real projects, relevant
          technical skills and measurable achievements. Tailor your resume
          to the role you are applying for.
        </p>
      </div>
    </div>
  );
}

export default ResumeCenter;