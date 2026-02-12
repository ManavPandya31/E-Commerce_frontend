import React from "react";
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styles from "../css/auth.module.css";
import bgImage from "../assets/loginbg.jpg";

export default function LoginPage() {

  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotStep, setForgotStep] = useState(1); 
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); 
  const [newPassword, setNewPassword] = useState(""); 
  const [forgotError, setForgotError] = useState(""); 

  const navigate = useNavigate();

  const formSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3131/api/auth/login", data);
      console.log("Login response:", res);

      const token = res.data.data.accessToken;
    
      if (!token) throw new Error("Token not received from server");
      localStorage.setItem("token", token);
      navigate("/", { replace: true });

    } catch (err) {
      console.log("Error", err);    

    } finally {
      setLoading(false);
    }
  };

  const fieldChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const sendOtpHandler = async (e) => {
    
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg("");
    setForgotError("");

    try {
      const res = await axios.post("http://localhost:3131/api/auth/forgotPassword", { email: forgotEmail });
      console.log("Forgot password response:", res);

      setForgotMsg(res.data.message);
      setForgotStep(2); 

    } catch (err) {
      setForgotError(err.response?.data?.message || "Something went wrong");

    } finally {
      setForgotLoading(false);
    }
  };

  const verifyOtpHandler = (e) => {
    e.preventDefault();
    setForgotStep(3);
  };

  const resetPasswordWithOtp = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg("");
    setForgotError("");

    try {
      const otpString = otp.join(""); 
      const res = await axios.post("http://localhost:3131/api/auth/resetPassword", {
        email: forgotEmail,
        otp: otpString,
        password: newPassword,
      });
      console.log("Reset password response:", res);
      
      setForgotMsg(res.data.message);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep(1);
        setOtp(["", "", "", "", "", ""]);
        setNewPassword("");
        setForgotEmail("");
        setForgotMsg("");
        setForgotError("");
      }, 2000);

    } catch (err) {
      setForgotError(err.response?.data?.message || "Invalid or expired OTP");

    } finally {
      setForgotLoading(false);
    }
  };

  const handleOtpChange = (e, index) => {

    const val = e.target.value;

    if (!/^[0-9]?$/.test(val)) return; 

    const newOtp = [...otp];
    newOtp[index] = val;

    setOtp(newOtp);

    if (val && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next.focus();
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
        <h2 className={styles.authTitle}>Welcome Back</h2>
        <p className={styles.authSubtitle}>Login to your account</p>

        <form className={styles.authForm} onSubmit={formSubmit}>
          <input type="email" name="email" placeholder="Email address" onChange={fieldChange} required />
          <input type="password" name="password" placeholder="Password" onChange={fieldChange} required />
          <p className="otpModal" onClick={() => setShowForgotModal(true)}>
            Forgot/Reset password
          </p>
          {error && <p className={styles.authError}>{error}</p>}
          <button type="submit" className={styles.authBtn} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className={styles.authFooter}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>

      {showForgotModal && (
        <div className={styles.forgotOverlay}>
          <div className={styles.forgotModal}>
            <button
              className={styles.forgotClose}
              onClick={() => {
                setShowForgotModal(false);
                setForgotStep(1);
                setForgotEmail("");
                setOtp(["", "", "", "", "", ""]);
                setNewPassword("");
                setForgotError("");
                setForgotMsg("");
              }}
            >
              ✕
            </button>

            {forgotStep === 1 && (
              <form onSubmit={sendOtpHandler}>
                <h3 className={styles.forgotTitle}>Forgot Password</h3>
                <p className={styles.forgotSubtitle}>Enter your registered email</p>
                <input type="email" placeholder="Email address" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
                {forgotMsg && <p className={styles.forgotMsgSuccess}>{forgotMsg}</p>}
                {forgotError && <p className={styles.forgotMsgError}>{forgotError}</p>}
                <button type="submit" className={styles.forgotBtn} disabled={forgotLoading}>
                  {forgotLoading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={verifyOtpHandler}>
                <h3 className={styles.forgotTitle}>Enter OTP</h3>
                <p className={styles.forgotSubtitle}>Enter the 6-digit code sent to your email</p>
                <div className={styles.otpContainer}>
                  {otp.map((val, idx) => (
                    <input key={idx} id={`otp-${idx}`} type="text" value={val} onChange={(e) => handleOtpChange(e, idx)} maxLength={1} required />
                  ))}
                </div>
                {forgotError && <p className={styles.forgotMsgError}>{forgotError}</p>}
                <button type="submit" className={styles.forgotBtn} disabled={forgotLoading}>
                  {forgotLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={resetPasswordWithOtp}>
                <h3 className={styles.forgotTitle}>Reset Password</h3>
                <p className={styles.forgotSubtitle}>Enter your new password</p>
                <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                {forgotError && <p className={styles.forgotMsgError}>{forgotError}</p>}
                {forgotMsg && <p className={styles.forgotMsgSuccess}>{forgotMsg}</p>}
                <button type="submit" className={styles.forgotBtn} disabled={forgotLoading}>
                  {forgotLoading ? "Resetting..." : "Confirm"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
