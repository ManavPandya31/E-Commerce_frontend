import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styles from "../css/auth.module.css";
import bgImage from "../assets/loginbg.jpg";

export default function LoginPage() {

  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const formSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3131/api/auth/login",data);
      console.log("Response Is:-", res);

      const token = res.data.data.accessToken;

      if (!token) {
        throw new Error("Token not received from server");
      }

      localStorage.setItem("token", token);

      navigate("/", { replace: true });

    } catch (err) {
        console.log("Error",err);      
    } finally {
      setLoading(false);
    }
  };

  const fieldChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  return (
   <div className={styles.authContainer} style={{
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
        <h2 className={styles.authTitle}>Welcome Back</h2>
        <p className={styles.authSubtitle}>Login to your account</p>

        <form className={styles.authForm} onSubmit={formSubmit}>
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

          {error && (
            <p className={styles.authError} style={{ color: "red" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className={styles.authBtn}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className={styles.authFooter}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
