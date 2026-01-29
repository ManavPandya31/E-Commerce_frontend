import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "../Slices/loaderSlice";
import NavBar from "../Components/NavBar";
import AddAddress from "../Components/AddAddress";
import "../css/checkoutpage.css";
import GetAddress from "../Components/GetAddress";

export default function CheckOutPage() {

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddAddress, setShowAddAddress] = useState(false);

  //   const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setAddresses(response.data.data.addresses || []);

    } catch (error) {
      console.log("Error fetching addresses:", error);

    } finally {
      dispatch(hideLoader());
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  return (
  <div>
    <NavBar />

    <div className="checkout-container">
      <h2>Select Delivery Address</h2>

      <GetAddress
        showRadio={true}
        selectedAddressId={selectedAddressId}
        onSelect={(id) => setSelectedAddressId(id)}
      />

      <div style={{ marginTop: "20px" }}>
        <div
          className="add-btn-container"
          onClick={() => setShowAddAddress(true)}
        >
          <span className="plus">+</span> ADD A NEW ADDRESS
        </div>

        {showAddAddress && (
            <AddAddress
                onClose={() => setShowAddAddress(false)}
                onSuccess={() => {
                window.location.reload();  
            }}
           />
        )}
      </div>
    </div>
  </div>
);

}
