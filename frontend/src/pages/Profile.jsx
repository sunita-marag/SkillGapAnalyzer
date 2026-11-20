import React, { useState } from "react";
import "../styles/Profile.css";

function Profile() {
  const username = localStorage.getItem("username") || "Student";

  // Get saved profile data
  const savedProfile = JSON.parse(
    localStorage.getItem("profileData") || "{}"
  );

  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: savedProfile.name || username,
    email: savedProfile.email || `${username}@gmail.com`,
    phone: savedProfile.phone || "+91 XXXXX XXXXX",
    college: savedProfile.college || "Your College Name",
    degree: savedProfile.degree || "Bachelor of Engineering",
    branch: savedProfile.branch || "Computer Science Engineering",
    year: savedProfile.year || "Final Year",
    location: savedProfile.location || "Maharashtra, India",
    careerGoal: savedProfile.careerGoal || "Software Developer",
    timeline: savedProfile.timeline || "Within 6 Months",
  });

  const [resumeName, setResumeName] = useState(
    localStorage.getItem("resumeName") || ""
  );

  const skills = [
    {
      name: "Python",
      level: 85,
      status: "Strong",
    },
    {
      name: "React",
      level: 60,
      status: "Good",
    },
    {
      name: "SQL",
      level: 55,
      status: "Needs Improvement",
    },
    {
      name: "JavaScript",
      level: 70,
      status: "Good",
    },
  ];

  // Handle profile input changes
  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  // Save profile
  const handleSave = () => {
    localStorage.setItem("profileData", JSON.stringify(profile));

    setIsEditing(false);

    alert("Profile updated successfully!");
  };

  // Cancel editing
  const handleCancel = () => {
    const saved = JSON.parse(
      localStorage.getItem("profileData") || "{}"
    );

    setProfile({
      name: saved.name || username,
      email: saved.email || `${username}@gmail.com`,
      phone: saved.phone || "+91 XXXXX XXXXX",
      college: saved.college || "Your College Name",
      degree: saved.degree || "Bachelor of Engineering",
      branch: saved.branch || "Computer Science Engineering",
      year: saved.year || "Final Year",
      location: saved.location || "Maharashtra, India",
      careerGoal: saved.careerGoal || "Software Developer",
      timeline: saved.timeline || "Within 6 Months",
    });

    setIsEditing(false);
  };

  // Resume upload
  const handleResumeUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      setResumeName(file.name);
      localStorage.setItem("resumeName", file.name);
    }
  };

  return (
    <div className="profile-page">

      {/* ================= HEADER ================= */}

      <div className="profile-header">

        <div>
          <div className="profile-title-row">
            <div className="profile-title-icon">👤</div>

            <div>
              <h1>My Profile</h1>
              <p>
                Manage your personal information and career preferences.
              </p>
            </div>
          </div>
        </div>

        {!isEditing ? (
          <button
            className="edit-profile-button"
            onClick={() => setIsEditing(true)}
          >
            ✏️ Edit Profile
          </button>
        ) : (
          <div className="profile-action-buttons">
            <button
              className="cancel-profile-button"
              onClick={handleCancel}
            >
              Cancel
            </button>

            <button
              className="save-profile-button"
              onClick={handleSave}
            >
              ✓ Save Changes
            </button>
          </div>
        )}

      </div>


      {/* ================= PROFILE TOP SECTION ================= */}

      <div className="profile-layout">

        {/* ================= LEFT PROFILE CARD ================= */}

        <div className="profile-card profile-main-card">

          <div className="profile-avatar">
            {profile.name.charAt(0).toUpperCase()}
          </div>

          <h2>{profile.name}</h2>

          <p className="profile-role">
            {profile.branch}
          </p>

          <div className="profile-status">
            <span className="status-dot"></span>
            Profile Active
          </div>

          <div className="profile-divider"></div>

          <div className="profile-item">
            <span>📧 Email</span>
            <strong>{profile.email}</strong>
          </div>

          <div className="profile-item">
            <span>📱 Phone</span>
            <strong>{profile.phone}</strong>
          </div>

          <div className="profile-item">
            <span>🎓 Education</span>
            <strong>{profile.degree}</strong>
          </div>

          <div className="profile-item">
            <span>💻 Branch</span>
            <strong>{profile.branch}</strong>
          </div>

        </div>


        {/* ================= PERSONAL DETAILS ================= */}

        <div className="profile-card">

          <div className="section-heading">
            <div className="section-icon">📋</div>

            <div>
              <h2>Personal Details</h2>
              <p>
                Your academic and personal information
              </p>
            </div>
          </div>


          <div className="details-grid">

            <div className="detail-field">
              <label>Full Name</label>

              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                />
              ) : (
                <div className="detail-value">
                  {profile.name}
                </div>
              )}
            </div>


            <div className="detail-field">
              <label>Email Address</label>

              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                />
              ) : (
                <div className="detail-value">
                  {profile.email}
                </div>
              )}
            </div>


            <div className="detail-field">
              <label>Phone Number</label>

              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                />
              ) : (
                <div className="detail-value">
                  {profile.phone}
                </div>
              )}
            </div>


            <div className="detail-field">
              <label>College</label>

              {isEditing ? (
                <input
                  type="text"
                  name="college"
                  value={profile.college}
                  onChange={handleChange}
                />
              ) : (
                <div className="detail-value">
                  {profile.college}
                </div>
              )}
            </div>


            <div className="detail-field">
              <label>Degree</label>

              {isEditing ? (
                <input
                  type="text"
                  name="degree"
                  value={profile.degree}
                  onChange={handleChange}
                />
              ) : (
                <div className="detail-value">
                  {profile.degree}
                </div>
              )}
            </div>


            <div className="detail-field">
              <label>Branch</label>

              {isEditing ? (
                <input
                  type="text"
                  name="branch"
                  value={profile.branch}
                  onChange={handleChange}
                />
              ) : (
                <div className="detail-value">
                  {profile.branch}
                </div>
              )}
            </div>


            <div className="detail-field">
              <label>Academic Year</label>

              {isEditing ? (
                <select
                  name="year"
                  value={profile.year}
                  onChange={handleChange}
                >
                  <option>First Year</option>
                  <option>Second Year</option>
                  <option>Third Year</option>
                  <option>Final Year</option>
                  <option>Graduate</option>
                </select>
              ) : (
                <div className="detail-value">
                  {profile.year}
                </div>
              )}
            </div>


            <div className="detail-field">
              <label>Location</label>

              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={profile.location}
                  onChange={handleChange}
                />
              ) : (
                <div className="detail-value">
                  {profile.location}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>


      {/* ================= CAREER GOAL ================= */}

      <div className="profile-card career-goal-card">

        <div className="section-heading">

          <div className="section-icon career-icon">
            🎯
          </div>

          <div>
            <h2>Career Goal</h2>
            <p>
              Define where you want your career to go
            </p>
          </div>

        </div>


        <div className="career-grid">

          <div className="career-field">

            <label>Target Role</label>

            {isEditing ? (
              <select
                name="careerGoal"
                value={profile.careerGoal}
                onChange={handleChange}
              >
                <option>Software Developer</option>
                <option>Frontend Developer</option>
                <option>Backend Developer</option>
                <option>Full Stack Developer</option>
                <option>Data Analyst</option>
                <option>Data Scientist</option>
                <option>AI/ML Engineer</option>
                <option>Cloud Engineer</option>
              </select>
            ) : (
              <div className="career-value">
                💼 {profile.careerGoal}
              </div>
            )}

          </div>


          <div className="career-field">

            <label>Expected Timeline</label>

            {isEditing ? (
              <select
                name="timeline"
                value={profile.timeline}
                onChange={handleChange}
              >
                <option>Within 3 Months</option>
                <option>Within 6 Months</option>
                <option>Within 1 Year</option>
                <option>Within 2 Years</option>
              </select>
            ) : (
              <div className="career-value">
                🗓️ {profile.timeline}
              </div>
            )}

          </div>

        </div>

      </div>


      {/* ================= SKILLS + RESUME ================= */}

      <div className="profile-bottom-grid">

        {/* ================= SKILLS ================= */}

        <div className="profile-card">

          <div className="section-heading">

            <div className="section-icon">
              💡
            </div>

            <div>
              <h2>My Skills</h2>
              <p>
                Your current skill levels
              </p>
            </div>

          </div>


          <div className="skills-container">

            {skills.map((skill) => (

              <div
                className="profile-skill"
                key={skill.name}
              >

                <div className="skill-top-row">

                  <div className="skill-name-section">

                    <span className="skill-name">
                      {skill.name}
                    </span>

                    <span
                      className={`skill-status ${
                        skill.status === "Strong"
                          ? "strong"
                          : skill.status === "Needs Improvement"
                          ? "improvement"
                          : "good"
                      }`}
                    >
                      {skill.status}
                    </span>

                  </div>

                  <strong>
                    {skill.level}%
                  </strong>

                </div>


                <div className="profile-skill-bar">

                  <div
                    style={{
                      width: `${skill.level}%`,
                    }}
                  ></div>

                </div>

              </div>

            ))}

          </div>

        </div>


        {/* ================= RESUME ================= */}

        <div className="profile-card resume-card">

          <div className="section-heading">

            <div className="section-icon">
              📄
            </div>

            <div>
              <h2>Resume</h2>
              <p>
                Keep your resume updated
              </p>
            </div>

          </div>


          {resumeName ? (

            <div className="uploaded-resume">

              <div className="resume-file-icon">
                📄
              </div>

              <div className="resume-file-info">

                <strong>
                  {resumeName}
                </strong>

                <span>
                  Resume uploaded successfully
                </span>

              </div>

              <label className="replace-resume-button">

                Replace

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  hidden
                />

              </label>

            </div>

          ) : (

            <label className="resume-upload-box">

              <div className="upload-icon">
                ⬆️
              </div>

              <strong>
                Upload your resume
              </strong>

              <span>
                PDF, DOC or DOCX files
              </span>

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                hidden
              />

            </label>

          )}

          <div className="resume-note">
            💡 Keep your resume updated to get more accurate
            career and skill-gap recommendations.
          </div>

        </div>

      </div>

{/* ================= PROFILE COMPLETION ================= */}

<div className="profile-card profile-completion">

  <div className="completion-chart-section">

    <div
      className="completion-pie"
      style={{
        background: `conic-gradient(
          #2563eb 0% 85%,
          #e2e8f0 85% 100%
        )`,
      }}
    >
      <div className="completion-pie-inner">
        <strong>85%</strong>
        <span>Complete</span>
      </div>
    </div>

    <div className="completion-info">

      <div className="completion-title">
        <span>Profile Completion</span>
      </div>

      <p>
        Complete your profile to receive more personalized
        skill-gap analysis and career recommendations.
      </p>

      <div className="completion-legend">

        <div className="legend-item">
          <span className="legend-dot completed"></span>
          <span>Completed</span>
          <strong>85%</strong>
        </div>

        <div className="legend-item">
          <span className="legend-dot remaining"></span>
          <span>Remaining</span>
          <strong>15%</strong>
        </div>

      </div>

    </div>

  </div>

</div>
    </div>
  );
}

export default Profile;