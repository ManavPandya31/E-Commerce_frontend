import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "../Slices/loaderSlice";
import AddAddress from "../Components/AddAddress";
import GetAddress from "../Components/GetAddress";
import "../css/profileandotherpage.css";

export default function ManageAddresses() {
  const dispatch = useDispatch();

  const [showForm, setShowForm] = useState(false);
  const [addresses, setAddresses] = useState([]);
  
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchAddresses = async () => {
    try {
      dispatch(showLoader());

      if (!token) return;

      const res = await axios.get("http://localhost:3131/api/auth/getAllAddress",config,);
      console.log("Response From getAllAddress :-", res);

      setAddresses(res.data.data.addresses || []);

    } catch (error) {
      console.log("Fetch Addresses Error:", error);

    } finally {
      dispatch(hideLoader());
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);


  return (
  <div className="address-wrapper">
    <h3 className="section-main-title">Manage Addresses</h3>

    <div
      className="add-btn-container"
      onClick={() => setShowForm((prev) => !prev)}
    >
      <span className="plus">+</span> ADD A NEW ADDRESS
    </div>

    {showForm && (
      <AddAddress
        onClose={() => setShowForm(false)}
        onSuccess={() => {
        window.location.reload(); 
      }}
    />
    )} 
    <GetAddress />
  </div>
);

}
