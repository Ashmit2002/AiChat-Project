import axios from "axios";
import { useState} from "react";
import { Link, useNavigate } from 'react-router-dom';
import styles from "./RegisterPage.module.css";

const RegisterPage = () => {
  const [form, setForm] = useState({
    email: "",
    firstname: "",
    lastname: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    console.log(form);
    axios.post(
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
      }).then((res) => {
        console.log(res);
        navigate("/");
      })
      .catch((err) => {
        console.error(err);
        alert('Registration failed (placeholder)')
      })
      .finally(() => {
        setSubmitting(false);
      });

    try {
      //PlaceHolder : Integrate real registration login / API calls

    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div className={styles.formContainer}>
      <h1 className={styles.title}>Create a new account</h1>
      <p className={styles.subtitle}>It's quick and easy.</p>
      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.nameGroup}>
          <input
            type="text"
            name="firstname"
            placeholder="First name"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastname"
            placeholder="Last name"
            onChange={handleChange}
            required
          />
        </div>
        <input
          type="email"
          name="email"
          placeholder="Email address"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="New password"
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={submitting} className={styles.registerButton}>
           {submitting ? 'Creating...' : 'Create Account'}
        </button>
      </form>
      <a href="/login" className={styles.loginLink}>
        Already have an account?
      </a>
    </div>
  );
};

export default RegisterPage;
