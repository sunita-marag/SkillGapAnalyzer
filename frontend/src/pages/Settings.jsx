import React, { useState } from "react";
import "../styles/Settings.css";

function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="settings-page">

      <div className="settings-header">

        <div>
          <h1>Settings</h1>
          <p>Manage your account and application preferences.</p>
        </div>

      </div>


      <div className="settings-container">


        {/* ACCOUNT */}

        <div className="settings-card">

          <h2>Account Settings</h2>

          <div className="setting-row">

            <div>
              <strong>Profile Information</strong>
              <p>Update your personal and educational information.</p>
            </div>

            <button>
              Edit
            </button>

          </div>


          <div className="setting-row">

            <div>
              <strong>Password</strong>
              <p>Change your account password.</p>
            </div>

            <button>
              Change
            </button>

          </div>

        </div>


        {/* NOTIFICATIONS */}

        <div className="settings-card">

          <h2>Notifications</h2>

          <div className="setting-row">

            <div>
              <strong>Push Notifications</strong>
              <p>Receive notifications about your learning progress.</p>
            </div>

            <label className="toggle">

              <input
                type="checkbox"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
              />

              <span></span>

            </label>

          </div>


          <div className="setting-row">

            <div>
              <strong>Email Updates</strong>
              <p>Receive course and career opportunity updates.</p>
            </div>

            <label className="toggle">

              <input
                type="checkbox"
                checked={emailUpdates}
                onChange={() => setEmailUpdates(!emailUpdates)}
              />

              <span></span>

            </label>

          </div>

        </div>


        {/* APPEARANCE */}

        <div className="settings-card">

          <h2>Appearance</h2>

          <div className="setting-row">

            <div>
              <strong>Dark Mode</strong>
              <p>Change the appearance of the application.</p>
            </div>

            <label className="toggle">

              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />

              <span></span>

            </label>

          </div>

        </div>


        {/* DANGER */}

        <div className="settings-card danger-card">

          <h2>Account Actions</h2>

          <div className="setting-row">

            <div>
              <strong>Log Out</strong>
              <p>Log out from your SkillGap account.</p>
            </div>

            <button className="logout-button">
              Log Out
            </button>

          </div>

        </div>


      </div>

    </div>
  );
}

export default Settings;