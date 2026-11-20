import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();

    // =========================================
    // GET FORM VALUES
    // =========================================

    const name = event.target.name.value.trim();
    const email = event.target.email.value.trim();
    const course = event.target.course.value;
    const year = event.target.year.value;
    const password = event.target.password.value;
    const confirmPassword = event.target.confirmPassword.value;

    // =========================================
    // BASIC VALIDATION
    // =========================================

    if (!name || !email || !course || !year || !password) {
      alert("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Password and Confirm Password do not match.");
      return;
    }

    // =========================================
    // START LOADING
    // =========================================

    setIsLoading(true);

    try {
      // =========================================
      // SEND DATA TO FASTAPI
      // =========================================

      const response = await fetch(
        "http://127.0.0.1:8002/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name,
            email: email,
            course: course,
            year: year,
            password: password,
          }),
        }
      );

      // =========================================
      // READ RESPONSE SAFELY
      // =========================================

      let data = {};

      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Could not read backend response:", jsonError);

        alert(
          "The backend returned an invalid response. Please check FastAPI."
        );

        return;
      }

      console.log("Registration response:", data);

      // =========================================
      // BACKEND ERROR
      // =========================================

      if (!response.ok) {
        let errorMessage = "Registration failed.";

        // FastAPI validation error
        if (Array.isArray(data.detail)) {
          errorMessage = data.detail
            .map((error) => {
              if (typeof error === "string") {
                return error;
              }

              if (error?.msg) {
                const field =
                  Array.isArray(error.loc) && error.loc.length > 1
                    ? error.loc[error.loc.length - 1]
                    : "";

                if (field) {
                  return `${field}: ${error.msg}`;
                }

                return error.msg;
              }

              return JSON.stringify(error);
            })
            .join("\n");
        }

        // Normal FastAPI error
        else if (typeof data.detail === "string") {
          errorMessage = data.detail;
        }

        // Object error
        else if (data.detail && typeof data.detail === "object") {
          errorMessage =
            data.detail.msg ||
            data.detail.message ||
            JSON.stringify(data.detail);
        }

        // Other backend error
        else if (data.message) {
          errorMessage = data.message;
        }

        alert(errorMessage);
        return;
      }

      // =========================================
      // REGISTRATION SUCCESSFUL
      // =========================================

      alert(
        data.message ||
          "Account created successfully! Please login."
      );

      // Go to Login page
      navigate("/login");

    } catch (error) {
      // =========================================
      // CONNECTION ERROR
      // =========================================

      console.error("Registration error:", error);

      alert(
        "Cannot connect to the backend. Please make sure FastAPI is running on http://127.0.0.1:8000."
      );

    } finally {
      // =========================================
      // STOP LOADING
      // =========================================

      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">

      {/* =====================================
          LEFT SIDE
      ===================================== */}

      <div className="register-left">

        <div className="register-left-content">

          {/* BRAND */}

          <div className="register-brand">

            <div className="register-brand-icon">
              🎓
            </div>

            <div className="register-brand-text">
              <strong>NexEvo</strong>
              <span> </span>
            </div>

          </div>


          {/* HERO */}

          <div className="register-hero">

            <h1>
              Start Your Journey.
              <br />
              Build Your <span>Future.</span>
            </h1>

            <p>
              Create your account, analyze your skills,
              identify your skill gaps, and get personalized
              recommendations for your career.
            </p>

          </div>


          {/* FEATURES */}

          <div className="register-features">

            <div className="register-feature">

              <div className="register-feature-icon">
                ✓
              </div>

              <div>

                <strong>
                  Assess Your Skills
                </strong>

                <span>
                  Understand your current abilities
                </span>

              </div>

            </div>


            <div className="register-feature">

              <div className="register-feature-icon">
                ↗
              </div>

              <div>

                <strong>
                  Find Skill Gaps
                </strong>

                <span>
                  Discover skills you need to improve
                </span>

              </div>

            </div>


            <div className="register-feature">

              <div className="register-feature-icon">
                ★
              </div>

              <div>

                <strong>
                  Reach Your Goals
                </strong>

                <span>
                  Get personalized career guidance
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================
          RIGHT SIDE
      ===================================== */}

      <div className="register-right">

        <div className="register-card">


          {/* LOGO */}

          <div className="register-logo">

            <div className="register-logo-icon">
              🎓
            </div>

            <div>

              <strong>
                NexEvo
              </strong>

              <span>
                
              </span>

            </div>

          </div>


          {/* HEADING */}

          <div className="register-heading">

            <h2>
              Create Account
            </h2>

            <p>
              Create your account and start your
              skill journey.
            </p>

          </div>


          {/* FORM */}

          <form onSubmit={handleRegister}>


            {/* FULL NAME */}

            <div className="register-form-group">

              <label htmlFor="name">
                Full Name
              </label>

              <div className="register-input-box">

                <span className="register-input-icon">
                  👤
                </span>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  required
                />

              </div>

            </div>


            {/* EMAIL */}

            <div className="register-form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="register-input-box">

                <span className="register-input-icon">
                  ✉
                </span>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  required
                />

              </div>

            </div>


            {/* COURSE */}

            <div className="register-form-group">

              <label htmlFor="course">
                Course
              </label>

              <div className="register-input-box">

                <span className="register-input-icon">
                  🎓
                </span>

                <select
                  id="course"
                  name="course"
                  required
                  defaultValue=""
                >

                  <option value="" disabled>
                    Select your course
                  </option>

                  <option value="Computer Science Engineering">
                    Computer Science Engineering
                  </option>

                  <option value="Information Technology">
                    Information Technology
                  </option>

                  <option value="Electronics Engineering">
                    Electronics Engineering
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

            </div>


            {/* YEAR */}

            <div className="register-form-group">

              <label htmlFor="year">
                Year of Study
              </label>

              <div className="register-input-box">

                <span className="register-input-icon">
                  📚
                </span>

                <select
                  id="year"
                  name="year"
                  required
                  defaultValue=""
                >

                  <option value="" disabled>
                    Select your year
                  </option>

                  <option value="First Year">
                    First Year
                  </option>

                  <option value="Second Year">
                    Second Year
                  </option>

                  <option value="Third Year">
                    Third Year
                  </option>

                  <option value="Final Year">
                    Final Year
                  </option>

                </select>

              </div>

            </div>


            {/* PASSWORD */}

            <div className="register-form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="register-input-box">

                <span className="register-input-icon">
                  🔒
                </span>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  required
                />

                <button
                  type="button"
                  className="register-show-password"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="register-form-group">

              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div className="register-input-box">

                <span className="register-input-icon">
                  🔒
                </span>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm your password"
                  required
                />

                <button
                  type="button"
                  className="register-show-password"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>


            {/* CREATE ACCOUNT */}

            <button
              type="submit"
              className="register-button"
              disabled={isLoading}
            >

              <span>
                {isLoading
                  ? "Creating Account..."
                  : "Create Account"}
              </span>

              <span className="register-arrow">
                {isLoading ? "..." : "→"}
              </span>

            </button>


            {/* LOGIN */}

            <p className="register-signup">

              Already have an account?

              <Link to="/login">
                Login
              </Link>

            </p>


            {/* SECURITY */}

            <div className="register-security">

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

export default Register;