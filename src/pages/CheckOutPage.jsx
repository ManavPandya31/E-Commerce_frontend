import React from 'react';
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "../Slices/loaderSlice";
import NavBar from "../Components/NavBar";
import "../css/checkoutpage.css";

export default function CheckOutPage() {
    
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);

//   const { id } = useParams(); 
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAddresses = async () => {

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      try {
        dispatch(showLoader());

        const response = await axios.get("http://localhost:3131/api/auth/getAllAddress",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        console.log("Address API Response:", response.data);
        setAddresses(response.data.data.addresses);

      } catch (error) {
        console.log("Error fetching addresses:", error);
      } finally {
        dispatch(hideLoader());
      }
    };

    fetchAddresses();
  }, []);

  return (
  <div>
    <NavBar />

    <div className="checkout-container">
      <h2>Select Delivery Address</h2>

      {addresses.length === 0 ? (
        <p>No address found</p>
      ) : (
        <div className="address-list">
          {addresses.map((addr) => (
            <label
              key={addr._id}
              className={`address-card ${
                selectedAddressId === addr._id ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="deliveryAddress"
                value={addr._id}
                checked={selectedAddressId === addr._id}
                onChange={() => setSelectedAddressId(addr._id)}
              />

              <div className="address-details">
                <p className="mobile">{addr.mobile}</p>
                <p>{addr.street}</p>
                <p>{addr.city}</p>
                <p>{addr.state}</p>
                <p>Pincode: {addr.pincode}</p>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  </div>
);

}
