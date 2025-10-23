import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(""); // Clear previous errors

    try {
      const response = await axios.post(
        "https://aichat-buddy.onrender.com/api/auth/login",
        {
          email: form.email,
          password: form.password,
        },
        {
          withCredentials: true,
        }
      );

      console.log(response);
      navigate("/");
    } catch (err) {
      console.error(err);
      const errorMessage =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card" role="main" aria-labelledby="login-heading">
          <div className="auth-brand">
            <h2>AiChat-Buddy</h2>
            <p>Powered by AI</p>
          </div>

          <header className="auth-header">
            <h1 id="login-heading">Welcome back</h1>
            <p className="auth-sub">Sign in to continue your conversations</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && <div className="error-message">{error}</div>}

            <div className="field-group">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting && <span className="loading-spinner"></span>}
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="auth-alt">
            Don't have an account? <Link to="/register">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
