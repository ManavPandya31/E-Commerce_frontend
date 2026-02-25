import React from "react";
import { useState } from "react";
import axiosInstance from "../Utils/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { showLoader, hideLoader } from "../Slices/loaderSlice.js";
import NavBar from "../Components/NavBar";
import "../css/contactpage.css";

export default function ContactPage({ cartCount }) {

  const { isLoading } = useSelector((state) => state.loader);
  const [formData, setFormData] = useState({name: "",email: "",message: "",});
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(showLoader());   
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await axiosInstance.post("/api/auth/contact",formData,{headers: {"Content-Type": "application/json",},});
      console.log("Response From Contact Api :-", res);

      if (res.data?.sucess) {
        setSuccessMsg(res.data.message);
        setFormData({name: "",email: "",message: "",});
      }
      
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Something went wrong");
      
    } finally {
      dispatch(hideLoader());   
    }
  };

  return (
    <>
      <NavBar cartCount={cartCount} />

      <section className="contact-container">
        <div className="contact-wrapper">
          <div className="contact-left">
            <h1>Contact Us</h1>
            <p>
              Have questions or want to work together? Fill out the form and
              we’ll get back to you as soon as possible.
            </p>

            <div className="contact-info">
              <div className="info-item">
                <h4>Email</h4>
                <span>manavpandya42@gmail.com</span>
              </div>
              <div className="info-item">
                <h4>Phone</h4>
                <span>+91 81538 25982</span>
              </div>
              <div className="info-item">
                <h4>Location</h4>
                <span>Ahmedabad - India</span>
              </div>
            </div>
          </div>

          <div className="contact-right">
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <textarea
                  rows="5"
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              {successMsg && (
                <p className="success-text">{successMsg}</p>
              )}
              {errorMsg && (
                <p className="error-text">{errorMsg}</p>
              )}

              <button
                type="submit"
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
