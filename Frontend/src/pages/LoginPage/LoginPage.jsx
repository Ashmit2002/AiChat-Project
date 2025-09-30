import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    const {name, value } = e.target;
    setForm({...form, [name]: value});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    console.log(form)
    axios
      .post(
        "http://localhost:3000/api/auth/login",
        {
          email: form.email,
          password: form.password,
        },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        console.log(res);
        navigate("/");
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setSubmitting(false);
      });
  }
  return (
    <div className={styles.formContainer}>
      <h1 className={styles.title}>Log in</h1>
      <p className={styles.subtitle}>Welcome back!</p>
      <form onSubmit={handleSubmit} noValidate>
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email address"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className={styles.loginButton}
          disabled={submitting}
        >
          {submitting ? "Signing in... " : "Sign in"}
        </button>
      </form>
      <a href="#" className={styles.forgotLink}>
        Forgotten password?
      </a>
      <div className={styles.divider}></div>
      <a href="/register" className={styles.createAccountButton}>
        Create new account
      </a>
    </div>
  );
};

export default LoginPage;
