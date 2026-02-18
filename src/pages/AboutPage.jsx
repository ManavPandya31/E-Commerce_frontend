import React from "react";
import NavBar from "../Components/NavBar";
import "../css/aboutpage.css";

export default function AboutPage({cartCount}) {

  return (
    <>
    <NavBar cartCount={cartCount}/>
    
    <section className="about-container">
      <div className="about-card">
        <h1 className="about-title">About Us</h1>
        <p className="about-subtitle">
          Building digital experiences that matter.
        </p>

        <div className="about-content">
          <p>
            We specialize in creating modern, scalable, and user-friendly web
            applications. Our focus is on clean design, performance, and
            delivering real value to users.
          </p>

          <p>
            From frontend interfaces to backend architecture, we build complete
            solutions using the latest technologies.
          </p>
        </div>

        <div className="about-stats">
          <div className="stat-box">
            <h2>50+</h2>
            <span>Projects</span>
          </div>
          <div className="stat-box">
            <h2>5+</h2>
            <span>Years Experience</span>
          </div>
          <div className="stat-box">
            <h2>100%</h2>
            <span>Client Satisfaction</span>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
