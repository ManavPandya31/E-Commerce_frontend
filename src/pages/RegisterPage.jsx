import React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../css/auth.module.css";
import bgImage from "../assets/loginbg.jpg";
import { toast } from "react-toastify";

export default function RegisterPage() {

  const [data, setData] = useState({ fullName: "", email: "", password: "", phoneNumber: "", gender: ""});
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fieldChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const role = "customer";
      const response = await axios.post(`http://localhost:3131/api/auth/register?role=${role}`,data);
      console.log("Response :- ", response);

      setSuccess("Registration Successful!");

      toast.success("Please verify your email first, then login");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (err) {
        console.log("Something Went Wrong While Registration",err);    
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
  className={styles.authContainer}
  style={{
    backgroundImage: `
      linear-gradient(
        rgba(0, 0, 0, 0.55),
        rgba(0, 0, 0, 0.55)
      ),
      url(${bgImage})
    `,
  }}
>
      <div className={styles.authCard}>
        <h2 className={styles.authTitle}>Create Account</h2>
        <p className={styles.authSubtitle}>Register</p>

        <form className={styles.authForm} onSubmit={submitForm}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            onChange={fieldChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email address"
            onChange={fieldChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={fieldChange}
            required
          />
          <input
            type="tel"
            name="phoneNumber"
            placeholder="Phone Number"
            onChange={fieldChange}
            pattern="[0-9]{10}"
            required
          />

          <select
            name="gender"
            onChange={fieldChange}
            required
            className={styles.authSelect}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <button
            type="submit"
            className={styles.authBtn}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          {error && <p className={styles.authError}>{error}</p>}
          {success && <p className={styles.authSuccess}>{success}</p>}
        </form>

        <p className={styles.authFooter}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
