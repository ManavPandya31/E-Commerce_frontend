import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
        const res = await axios.get("http://localhost:3131/api/auth/userDetails", {
          headers: { Authorization: `Bearer ${token}` },
        });
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

  // return (
  //   <div><NavBar cartCount={cartCount} />
  //   <div className="account-layout">
  //     <div className="sidebar">
  //       <div className="user-brief">
  //         {/* <div className="avatar-circle">
  //           <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/profile-pic-male_4811a3.svg" alt="" style={{width: '100%'}} />
  //         </div> */}
  //         <div>
  //           <span className="hello">Hello,</span>
  //           <div className="user-name">{userDetails.fullName}</div>
  //         </div>
  //       </div>

  //       <div className="sidebar-menu">
  //         <div className="menu-section">
  //           <NavLink to="orders" className={({ isActive }) => isActive ? "menu-header active-text" : "menu-header"
  //         }>
  //         <span className="icon-blue"></span> MY ORDERS
  //         </NavLink>
  //         </div>

  //         <div className="menu-section">
  //           <div className="menu-header active-text">
  //             <span className="icon-blue"></span> ACCOUNT SETTINGS
  //           </div>
  //           <ul className="sub-menu">
  //             <li>
  //               <NavLink to="info" className={({ isActive }) => isActive ? "active-link" : ""}>
  //                 Profile Information
  //               </NavLink>
  //             </li>
  //             <li>
  //               <NavLink to="addresses" className={({ isActive }) => isActive ? "active-link" : ""}>
  //                 Manage Addresses
  //               </NavLink>
  //             </li>
  //             <li>
  //              <NavLink 
  //                 onClick={handleLogout} 
  //                 className="logout-link" 
  //                 style={{cursor: 'pointer'}}
  //               >
  //                 Logout 
  //               </NavLink>
  //             </li>
  //             {/* <li>PAN Card Information</li> */}
  //           </ul>
  //         </div>

  //         {/* <div className="menu-section">
  //           <div className="menu-header">
  //             <span className="icon-blue"></span> PAYMENTS
  //           </div>
  //           <ul className="sub-menu">
  //             <li>Gift Cards <span className="gift-val">₹0</span></li>
  //             <li>Saved UPI</li>
  //             <li>Saved Cards</li>
  //           </ul>
  //         </div> */}
  //       </div>
  //     </div>

  //     <div className="content-area">
  //       <Outlet context={{ userDetails, firstName, lastName }} />
  //     </div>
  //   </div>
  //   </div>
  // );

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