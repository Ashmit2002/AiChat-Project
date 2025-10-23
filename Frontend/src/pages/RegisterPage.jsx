import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

const RegisterPage = () => {
  const [form, setForm] = useState({
    email: "",
    firstname: "",
    lastname: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(""); // Clear previous errors

    // Basic validation
    if (!form.email || !form.firstname || !form.lastname || !form.password) {
      setError("All fields are required");
      setSubmitting(false);
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        {
          email: form.email,
          fullName: {
            firstName: form.firstname,
            lastName: form.lastname,
          },
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
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div
          className="auth-card"
          role="main"
          aria-labelledby="register-heading"
        >
          <div className="auth-brand">
            <h2>AiChat-Buddy</h2>
            <p>Powered by AI</p>
          </div>

          <header className="auth-header">
            <h1 id="register-heading">Create your account</h1>
            <p className="auth-sub">
              Join us and start exploring AI conversations
            </p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && <div className="error-message">{error}</div>}

            <div className="field-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid-2">
              <div className="field-group">
                <label htmlFor="firstname">First name</label>
                <input
                  id="firstname"
                  name="firstname"
                  type="text"
                  autoComplete="given-name"
                  placeholder="John"
                  value={form.firstname}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field-group">
                <label htmlFor="lastname">Last name</label>
                <input
                  id="lastname"
                  name="lastname"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Doe"
                  value={form.lastname}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a secure password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
              <small
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: "11px",
                  marginTop: "2px",
                }}
              >
                Must be at least 6 characters long
              </small>
            </div>

            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting && <span className="loading-spinner"></span>}
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="auth-alt">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
