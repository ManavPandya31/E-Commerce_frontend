import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HiShoppingCart } from "react-icons/hi";
import "../css/navbar.css";

export default function NavBar({cartCount}) {

  const navigate = useNavigate();
  const location = useLocation();   
  const [isLoggedIn, setIsLoggedIn] = useState(false);

 useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);

  const btnLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="nav-logo" style={{ cursor: "pointer" }}onClick={() => navigate("/")}>
        My Flipcart
      </div>

      <div className="nav-buttons">
        {!isLoggedIn ? (
          <>
            <Link to="/login" className="nav-btn login-btn">Login</Link>
            <Link to="/register" className="nav-btn register-btn">Register</Link>
          </>
        ) : (
          <button onClick={btnLogout} className="nav-btn logout-btn">Logout</button>
        )}
        <button className="nav-btn cart-btn" onClick={() => navigate("/cart")}>
          <HiShoppingCart style={{ marginRight: "8px" }} />Cart ({cartCount})
        </button>
      </div>
    </nav>
  );
}
