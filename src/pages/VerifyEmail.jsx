import React from 'react';
import { useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";
import "../css/verifyemail.css"

export default function VerifyEmail() {

  const { token } = useParams(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);

    try {
      const res = await axiosInstance.get(`/api/auth/verifyEmail/${token}`);
      console.log("Response From Verify Email APi :-",res);
      
      toast.success("Email verified successfully!");
      navigate("/auth"); 

    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Invalid or expired link");
      navigate("/auth"); 

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <h2>Verify Your Email</h2>
      <p>Click the button below to verify your email address.</p>
      <button 
        className="verify-button"
        onClick={handleVerify} 
        disabled={loading}
      >
        {loading ? "Verifying..." : "Verify Email"}
      </button>
    </div>
  );
}
