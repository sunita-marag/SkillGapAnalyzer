import React, { useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Link,
} from "react-router-dom";

import "./App.css";

// Pages
import Home from "./pages/Home";
import Register from "./pages/Register";
import SkillAssessment from "./pages/SkillAssessment";
import SkillGapAnalysis from "./pages/SkillGapAnalysis";
import LearningRoadmap from "./pages/LearningRoadmap";
import Courses from "./pages/Courses";
import Jobs from "./pages/Jobs";
import CareerGuidance from "./pages/CareerGuidance";
import ResumeCenter from "./pages/ResumeCenter";
import SkillGapAI from "./pages/SkillGapAI";
import ProgressTracker from "./pages/ProgressTracker";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SoftSkillAssessment from "./pages/SoftSkillAssessment";

// ======================================================
// LOGIN PAGE
// ======================================================

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Reference for Google's official button
  const googleButtonRef = useRef(null);

  // ====================================================
  // SAVE USER INFORMATION
  // ====================================================

const saveUserAndNavigate = (user, provider = "password") => {
  if (!user || !user.id) {
    setLoginError(
      "Login response is missing the user ID. Please check the backend."
    );
    return;
  }

  localStorage.setItem("userId", user.id);
  localStorage.setItem("username", user.name || "");
  localStorage.setItem("email", user.email || "");
  localStorage.setItem("course", user.course || "");
  localStorage.setItem("year", user.year || "");
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("authProvider", provider);

  navigate("/home");
};

  // ====================================================
  // GOOGLE LOGIN HANDLER
  // ====================================================

  const handleGoogleLogin = async (response) => {
    setLoginError("");
    setIsLoading(true);

    try {
      // Send Google's credential to FastAPI
      const backendResponse = await fetch(
        "http://127.0.0.1:8002/api/auth/google",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential: response.credential,
          }),
        }
      );

      const data = await backendResponse.json();

      // Google login failed
      if (!backendResponse.ok) {
        setLoginError(
          data.detail || "Google login failed. Please try again."
        );

        setIsLoading(false);
        return;
      }

      // Google login successful
      const user = data.user;

      saveUserAndNavigate(user, "google");
    } catch (error) {
      console.error("Google login error:", error);

      setLoginError(
        "Cannot connect to the backend. Please make sure FastAPI is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ====================================================
  // LOAD GOOGLE IDENTITY SERVICES
  // ====================================================

  useEffect(() => {
    const initializeGoogle = () => {
      if (
        !window.google ||
        !window.google.accounts ||
        !googleButtonRef.current
      ) {
        return;
      }

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

      if (!clientId) {
        console.error(
          "VITE_GOOGLE_CLIENT_ID is missing from frontend .env"
        );

        setLoginError(
          "Google login is not configured. Please check the frontend .env file."
        );

        return;
      }

      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleLogin,
      });

      // Clear old Google button
      googleButtonRef.current.innerHTML = "";

      // Render official Google button
      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          theme: "outline",
          size: "large",
          width: 320,
          text: "continue_with",
        }
      );
    };

    const loadGoogleScript = () => {
      // If Google script is already loaded
      if (window.google && window.google.accounts) {
        initializeGoogle();
        return;
      }

      // Check whether script already exists
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );

      if (existingScript) {
        existingScript.addEventListener("load", initializeGoogle);
        return;
      }

      // Create Google script
      const script = document.createElement("script");

      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;

      script.onload = initializeGoogle;

      document.head.appendChild(script);
    };

    loadGoogleScript();

    // Cleanup
    return () => {
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );

      if (existingScript) {
        existingScript.removeEventListener("load", initializeGoogle);
      }
    };
  }, []);

  // ====================================================
  // NORMAL LOGIN HANDLER
  // ====================================================

  const handleLogin = async (event) => {
    event.preventDefault();

    setLoginError("");

    const email = event.target.email.value.trim();
    const password = event.target.password.value;

    // Check empty fields
    if (!email || !password) {
      setLoginError("Please enter your email and password.");
      return;
    }

    setIsLoading(true);

    try {
      // ==================================================
      // CONNECT TO FASTAPI
      // ==================================================

      const response = await fetch(
        "http://127.0.0.1:8002/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      // ==================================================
      // LOGIN FAILED
      // ==================================================

      if (!response.ok) {
        setLoginError(
          data.detail || "Invalid email or password."
        );

        setIsLoading(false);

        return;
      }

      // ==================================================
      // LOGIN SUCCESSFUL
      // ==================================================

      const user = data.user;

      // Save user information
      // IMPORTANT: Password is NOT saved.
      saveUserAndNavigate(user, "password");
    } catch (error) {
      console.error("Login error:", error);

      setLoginError(
        "Cannot connect to the backend. Please make sure FastAPI is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ======================================================
  // LOGIN PAGE UI
  // ======================================================

  return (
    <div className="login-page">

      {/* ==========================================
          LEFT SIDE
      ========================================== */}

      <div className="login-left">

        <div className="login-left-content">

          {/* BRAND */}

          <div className="login-brand">

            <div className="login-brand-icon">
              🎓
            </div>

            <div className="login-brand-text">
              <strong>NexEvo</strong>
              <span> </span>
            </div>

          </div>

          {/* HERO TEXT */}

          <div className="login-hero">

            <h1>
              Your Skills.
              <br />
              A Brighter <span>Future.</span>
            </h1>

            <p>
              Discover your skill gaps, get personalized
              learning recommendations, and build
              the career you've always wanted.
            </p>

          </div>

          {/* FEATURE CARDS */}

          <div className="login-features">

            <div className="login-feature">

              <div className="login-feature-icon">
                📊
              </div>

              <div>
                <strong>Assess</strong>
                <span>Your Skills</span>
              </div>

            </div>

            <div className="login-feature">

              <div className="login-feature-icon">
                🎯
              </div>

              <div>
                <strong>Find</strong>
                <span>Your Gaps</span>
              </div>

            </div>

            <div className="login-feature">

              <div className="login-feature-icon">
                💡
              </div>

              <div>
                <strong>Get</strong>
                <span>Personalized Roadmap</span>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ==========================================
          RIGHT SIDE
      ========================================== */}

      <div className="login-right">

        <div className="login-card">

          {/* LOGO */}

          <div className="login-logo">

            <div className="login-logo-icon">
              🎓
            </div>

            <div>
              <strong>NexEvo</strong>
              <span> </span>
            </div>

          </div>

          {/* HEADING */}

          <div className="login-heading">

            <h1>
              Welcome Back!
            </h1>

            <p>
              Log in to your NexEvo account
            </p>

          </div>

          {/* LOGIN FORM */}

          <form onSubmit={handleLogin}>

            {/* EMAIL */}

            <div className="login-field">

              <label htmlFor="login-email">
                Email address
              </label>

              <div className="login-input-box">

                <span className="login-input-icon">
                  ✉
                </span>

                <input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="login-field">

              <label htmlFor="login-password">
                Password
              </label>

              <div className="login-input-box">

                <span className="login-input-icon">
                  🔒
                </span>

                <input
                  id="login-password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  required
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>

            {/* REMEMBER + FORGOT */}

            <div className="login-options">

              <label className="remember">

                <input
                  type="checkbox"
                  defaultChecked
                />

                <span>
                  Remember me
                </span>

              </label>

              <button
                type="button"
                className="forgot"
                onClick={() =>
                  alert(
                    "Password reset functionality will be connected later."
                  )
                }
              >
                Forgot password?
              </button>

            </div>

            {/* ERROR */}

            {loginError && (
              <p className="login-error">
                {loginError}
              </p>
            )}

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >

              <span>
                {isLoading
                  ? "Logging in..."
                  : "Log In"}
              </span>

              {!isLoading && (
                <span className="arrow">
                  →
                </span>
              )}

            </button>

            {/* DIVIDER */}

            <div className="divider">

              <span></span>

              <p>or</p>

              <span></span>

            </div>

            {/* GOOGLE LOGIN */}

            <div
              ref={googleButtonRef}
              className="google-button-container"
            ></div>

            {/* REGISTER */}

            <p className="signup">

              Don't have an account?{" "}

              <Link to="/register">
                Sign up
              </Link>

            </p>

            {/* SECURITY */}

            <div className="login-security">

              🔒

              <span>
                Your information is kept private and secure.
              </span>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

// ======================================================
// APP
// ======================================================

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* LOGIN */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        {/* REGISTER */}

        <Route
          path="/register"
          element={<Register />}
        />

        {/* HOME */}

        <Route
          path="/home"
          element={<Home />}
        />

        {/* SKILL ASSESSMENT */}

        <Route
          path="/skill-assessment"
          element={<SkillAssessment />}
        />

        {/* SKILL GAP ANALYSIS */}

        <Route
          path="/skill-gap-analysis"
          element={<SkillGapAnalysis />}
        />

        {/* LEARNING ROADMAP */}

        <Route
          path="/learning-roadmap"
          element={<LearningRoadmap />}
        />

        {/* COURSES */}

        <Route
          path="/courses"
          element={<Courses />}
        />

        {/* JOBS */}

        <Route
          path="/jobs"
          element={<Jobs />}
        />

        {/* CAREER GUIDANCE */}

        <Route
          path="/career-guidance"
          element={<CareerGuidance />}
        />

        {/* RESUME CENTER */}

        <Route
          path="/resume"
          element={<ResumeCenter />}
        />

        {/* SKILLGAP AI */}

        <Route
          path="/ai"
          element={<SkillGapAI />}
        />

        {/* PROGRESS TRACKER */}

        <Route
          path="/progress"
          element={<ProgressTracker />}
        />

        {/* PROFILE */}

        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* SOFT SKILL ASSESSMENT */}

        <Route
          path="/soft-skill-assessment"
          element={<SoftSkillAssessment />}
        />

        {/* SETTINGS */}

        <Route
          path="/settings"
          element={<Settings />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;