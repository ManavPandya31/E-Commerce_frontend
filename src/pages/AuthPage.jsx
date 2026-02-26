import React from "react";
import { useState, useEffect } from "react";
import axiosInstance from "../Utils/axiosInstance";
import { showLoader, hideLoader } from "../Slices/loaderSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "../css/auth.module.css";
import NavBar from "../Components/NavBar";
import { useSelector } from "react-redux";

export default function AuthPage() {

  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [data, setData] = useState({fullName: "",email: "",password: "",phoneNumber: "",gender: "",});
  //const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotStep, setForgotStep] = useState(1);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const { isLoading } = useSelector((state) => state.loader);

  const dispatch = useDispatch();

  const fieldChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const formSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      dispatch(showLoader());
      const res = await axiosInstance.post("/api/auth/login",{email: data.email,password: data.password,});
      console.log("Response From Login Api :-",res);

      const token = res.data.data.accessToken;
      localStorage.setItem("token", token);
      navigate("/", { replace: true });

    } catch (err) {
      setError("Invalid Email Or Password");

    } finally {
      dispatch(hideLoader());
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    //setLoading(true);
    setError("");
    setSuccess("");

    try {
      const role = "customer";
      dispatch(showLoader());
      const res = await axiosInstance.post(`/api/auth/register?role=${role}`,data,);
      console.log("Response From Register Api :-",res);
      
      // toast.success("Please verify your email first, then login");
      setSuccess("Registration successful");
      setIsLogin(true);

    } catch (err) {
      setError("Registration Failed");

    } finally {
      dispatch(hideLoader());
    }
  };

  const sendOtpHandler = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg("");
    setForgotError("");

    try {
      dispatch(showLoader());
      const res = await axiosInstance.post("/api/auth/forgotPassword",{ email: forgotEmail },);
      console.log("Response From Forgot Password Api :-",res);
      
      setForgotMsg(res.data.message);
      setForgotStep(2);
      setResendTimer(30);

    } catch (err) {
      setForgotError("Something went wrong");

    } finally {
      dispatch(hideLoader());
    }
  };

  const verifyOtpHandler = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError("");

    try {
      const otpString = otp.join("");
      dispatch(showLoader());
      const res = await axiosInstance.post("/api/auth/verifyOTP", {email: forgotEmail,otp: otpString,});
      console.log("Response From VerifOTP Api :-",res);
      
      setForgotMsg(res.data.message);
      setForgotStep(3);

    } catch (err) {
      setForgotError("Invalid OTP");

    } finally {
      dispatch(hideLoader());
    }
  };

  const resendOtpHandler = async () => {
    setResendLoading(true);
    setForgotError("");

    try {
      dispatch(showLoader());
      const res = await axiosInstance.post("/api/auth/forgotPassword", {email: forgotEmail,});
      console.log("Again Response From Forgot Password Api:-",res);
      
      setForgotMsg("OTP resent successfully");
      setResendTimer(30);

    } catch {
      setForgotError("Failed to resend OTP");

    } finally {
      dispatch(hideLoader());
    }
  };

  useEffect(() => {
    if (resendTimer === 0) return;
    const interval = setInterval(() => {
      setResendTimer((p) => p - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const resetPasswordWithOtp = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError("");

    try {
      const otpString = otp.join("");
      dispatch(showLoader());
      const res = await axiosInstance.post("/api/auth/resetPassword",{email: forgotEmail,otp: otpString,password: newPassword,},);
      console.log("Response Form Reset Password Api:-",res);
      
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

    } catch {
      setForgotError("Invalid or expired OTP");

    } finally {
      dispatch(hideLoader());
    }
  };

  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (!/^[0-9]?$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    if (val && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  return (
    <div>
      <NavBar />

      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.toggleWrapper}>
            <button
              className={isLogin ? styles.activeTab : ""}
              onClick={() => setIsLogin(true)}
              type="button"
            >
              Sign In
            </button>
            <button
              className={!isLogin ? styles.activeTab : ""}
              onClick={() => setIsLogin(false)}
              type="button"
            >
              Sign Up
            </button>
          </div>

          <h2 className={styles.authTitle}>
            {isLogin ? "Welcome Back" : "Create your account"}
          </h2>
          <p className={styles.authSubtitle}>
            {isLogin ? "Login to your account" : ""}
          </p>

          <div className={styles.formSlider}>
            <div
              className={`${styles.formWrapper} ${
                isLogin ? styles.showLogin : styles.showRegister
              }`}
            >
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
                <p
                  className={styles.otpModal}
                  onClick={() => setShowForgotModal(true)}
                >
                  Forgot / Reset password
                </p>
                {error && <p className={styles.authError}>{error}</p>}
              <button
                type="submit"
                className={styles.authBtn}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Sign In"}
              </button>
              </form>

              <form className={styles.authForm} onSubmit={submitForm}>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  onChange={fieldChange}
                  required
                />
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  onChange={fieldChange}
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
                {error && <p className={styles.authError}>{error}</p>}
               <button
                  type="submit"
                  className={styles.authBtn}
                  disabled={isLoading}
                >
                  {isLoading ? "Please wait..." : "Sign Up"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {showForgotModal && (
          <div className={styles.forgotOverlay}>
            <div className={styles.forgotModal}>
              <button
                className={styles.forgotClose}
                onClick={() => setShowForgotModal(false)}
              >
                ✕
              </button>

              {forgotStep === 1 && (
                <form onSubmit={sendOtpHandler}>
                  <h3 className={styles.forgotTitle}>Forgot Password</h3>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                  {forgotMsg && (
                    <p className={styles.forgotMsgSuccess}>{forgotMsg}</p>
                  )}
                  {forgotError && (
                    <p className={styles.forgotMsgError}>{forgotError}</p>
                  )}
                  <button
                    type="submit"
                    className={styles.forgotBtn}
                    disabled={forgotLoading}
                  >
                    Send OTP
                  </button>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={verifyOtpHandler}>
                  <div className={styles.otpContainer}>
                    {otp.map((v, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        value={v}
                        onChange={(e) => handleOtpChange(e, i)}
                        maxLength={1}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    className={styles.forgotBtn}
                    disabled={forgotLoading}
                  >
                    Verify OTP
                  </button>

                  {resendTimer > 0 ? (
                    <p className={styles.resendOtp}>
                      Resend OTP in {resendTimer}s
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={resendOtpHandler}
                      className={styles.resendBtn}
                    >
                      Resend OTP
                    </button>
                  )}
                </form>
              )}

              {forgotStep === 3 && (
                <form onSubmit={resetPasswordWithOtp}>
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button type="submit" className={styles.forgotBtn}>
                    Confirm
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
