import React from 'react';
import { useState, useEffect } from 'react';
import axiosInstance from "../Utils/axiosInstance";
import { NavLink, Outlet , useNavigate} from 'react-router-dom';
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "../Slices/loaderSlice";
import NavBar from '../Components/NavBar';
import "../css/profileandotherpage.css";

export default function ProfileAndOtherPage({cartCount}) {

  const [userDetails, setUserDetails] = useState({fullName: "",email: "",phoneNumber: "",address: "",});
 
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {

        dispatch(showLoader());
        const res = await axiosInstance.get("/api/auth/userDetails", {headers: { Authorization: `Bearer ${token}` },});

        if (res.data && res.data.data) {
          setUserDetails(res.data.data);
        }

      } catch (error) {
        console.log("Error fetching user details:", error);

      }finally{
         dispatch(hideLoader());
      }
    };

    fetchUserDetails();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth"); 
  };

  const firstName = userDetails.fullName.split(" ")[0] || "";
  const lastName = userDetails.fullName.split(" ").slice(1).join(" ") || "";

  const avatarLetter = userDetails.fullName.charAt(0) || "M"

  return (
    <div>
      <NavBar cartCount={cartCount} />
      <div className="account-layout">
        <div className="sidebar">
          
          <div className="user-brief">
            <div className="avatar-circle">
              {avatarLetter}
            </div>
            <div>
              <span className="hello">Hello,</span>
              <div className="user-name">{userDetails.fullName}</div>
            </div>
          </div>
   
          <div className="sidebar-menu">
            
            <NavLink to="orders" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              <span className="menu-item-icon">📦</span> ORDERS
            </NavLink>

            <NavLink to="wishlist" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              <span className="menu-item-icon">❤️</span> WISHLIST
            </NavLink>

            <NavLink to="addresses" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
              <span className="menu-item-icon">📍</span> ADDRESSES
            </NavLink>  

            <div onClick={handleLogout} className="menu-item logout-item" style={{cursor: 'pointer'}}>
              <span className="menu-item-icon">🚪</span> LOGOUT
            </div>

          </div>
        </div>

        <div className="content-area">
          <Outlet context={{ userDetails, firstName, lastName }} />
        </div>
      </div>
    </div>
  );
}