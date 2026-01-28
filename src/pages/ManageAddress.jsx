import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "../Slices/loaderSlice";
import "../css/profileandotherpage.css";

export default function ManageAddresses() {

  const dispatch = useDispatch();

  const [showForm, setShowForm] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    //   fullName: "",
    mobile: "",
    country: "India",
    alternatePhone: "" || "",
    state: "",
    addressType: "HOME",
    // house: "",
    street: "",
    city: "",
    pincode: "",
    isDefault: false,
  });

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchAddresses = async () => {
    try {
      dispatch(showLoader());

      if (!token) return;
      
      const res = await axios.get("http://localhost:3131/api/auth/getAllAddress",config,);
      console.log("Response From getAllAddress :-", res);

      setAddresses(res.data.data?.addresses || []);

    } catch (error) {
      console.log("Fetch Addresses Error:", error);
    } finally {
      dispatch(hideLoader());
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const btnSave = async () => {
    if ( !formData.mobile || !formData.street || !formData.city || !formData.pincode || !formData.state) {
      alert("Please fill all required fields.");
      return;
    }
    try {
      dispatch(showLoader());

      if (editId) {
        const response = await axios.put(`http://localhost:3131/api/auth/updateAddress/${editId}`,formData,config);
        console.log("Response From Update Address Api", response);

      } else {
        const res = await axios.post("http://localhost:3131/api/auth/addAddress",formData,config);
        console.log("Response From Add Address Api", res);
      }

      setFormData({
        // fullName: "",
        mobile: "",
        alternatePhone: "",
        state: "",
        country: "India",
        addressType: "HOME",
        details: "",
        isDefault: false,
      });

      setEditId(null);
      setShowForm(false);
      fetchAddresses();

    } catch (error) {
      console.log("Save Address Error:", error);

    } finally {
      dispatch(hideLoader());
    }
  };

  const handleEdit = (addr) => {
    setFormData({
      //   fullName: addr.fullName,
      mobile: addr.mobile,
      details: addr.details,
      state: addr.state,
      alternatePhone: addr.alternatePhone || "",
      addressType: addr.addressType,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setEditId(addr._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      dispatch(showLoader());
      const res = await axios.delete(`http://localhost:3131/api/auth/deleteAddress/${id}`,config,);
      console.log("Response From Delete Address Api", res);

      fetchAddresses();

    } catch (error) {
      console.log("Delete Address Error:", error);

    } finally {
      dispatch(hideLoader());
    }
  };
  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
  ];

  return (
    <div className="address-wrapper">
      <h3 className="section-main-title">Manage Addresses</h3>

      <div
        className="add-btn-container"
        onClick={() => {
          setShowForm(!showForm);
          setEditId(null);
          setFormData({
            // fullName: "",
            mobile: "",
            alternatePhone: "",
            country: "India",
            state: "",
            addressType: "HOME",
            street: "",
            city: "",
            pincode: "",
            isDefault: false,
          });
        }}
      >
        <span className="plus">+</span> ADD A NEW ADDRESS
      </div>

      {showForm && (
        <div className="address-form-box">
          <div className="input-group-row">
            {/* <input
              type="text"
              className="styled-input"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            /> */}
            <input
              type="text"
              className="styled-input"
              placeholder="10-digit mobile number"
              value={formData.mobile}
              onChange={(e) =>
                setFormData({ ...formData, mobile: e.target.value })
              }
            />
            <input
              type="text"
              className="styled-input"
              placeholder="Alternate Mobile (Optional)"
              value={formData.alternatePhone}
              onChange={(e) =>
                setFormData({ ...formData, alternatePhone: e.target.value })
              }
            />
          </div>

          <div className="input-group-column">
            <input
              type="text"
              className="styled-input mid-width"
              placeholder="Street / Locality"
              value={formData.street}
              onChange={(e) =>
                setFormData({ ...formData, street: e.target.value })
              }
            />

            <select
              className="styled-input mid-width"
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
            >
              <option value="">Select State</option>
              {indianStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>

            <input
              type="text"
              className="styled-input mid-width"
              placeholder="City"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
            />

            <input
              type="text"
              className="styled-input mid-width"
              placeholder="Pincode"
              value={formData.pincode}
              onChange={(e) =>
                setFormData({ ...formData, pincode: e.target.value })
              }
            />
          </div>

          <div className="address-type-section">
            <p className="type-label">Address Type</p>
            <div className="radio-group">
              {["HOME", "WORK", "SCHOOL", "COLLEGE", "UNIVERSITY"].map(
                (type) => (
                  <label key={type} className="radio-label">
                    <input
                      type="radio"
                      name="addressType"
                      value={type}
                      checked={formData.addressType === type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          addressType: e.target.value,
                        })
                      }
                    />
                    {type}
                  </label>
                ),
              )}
            </div>
          </div>

          <div className="form-btn-row">
            <button className="btn-save" onClick={btnSave}>
              SAVE
            </button>
            <button
              className="btn-cancel"
              onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      <div className="address-list">
        {addresses.length === 0 ? (
          <p style={{ color: "#878787", marginTop: "20px" }}>
            No addresses added yet.
          </p>
        ) : (
          addresses.map((addr) => (
            <div key={addr._id} className="address-card">
              <div className="addr-top">
                <span className="tag">{addr.addressType}</span>
                <div className="addr-user-info">
                  {/* <strong>{addr.fullName}</strong> */}
                </div>
              </div>

              <div className="addr-body">
                <div className="addr-row">
                     <span className="addr-label">Mobile:</span>
                     <span className="addr-value">{addr.mobile}</span>
                </div>

            {addr.alternatePhone && (
                <div className="addr-row">
                <span className="addr-label">Alternate:</span>
                <span className="addr-value">{addr.alternatePhone}</span>
            </div>
        )}

  <div className="addr-row">
    <span className="addr-label">Address :</span>
    <span className="addr-value">{addr.street}</span>
  </div>

  <div className="addr-row">
    <span className="addr-label">City:</span>
    <span className="addr-value">{addr.city}</span>
  </div>

  <div className="addr-row">
    <span className="addr-label">State:</span>
    <span className="addr-value">{addr.state}</span>
  </div>

  <div className="addr-row">
    <span className="addr-label">Pincode:</span>
    <span className="addr-value">{addr.pincode}</span>
  </div>
</div>


              {addr.isDefault && (
                <div
                  style={{
                    color: "#388e3c",
                    fontSize: "13px",
                    marginTop: "5px",
                  }}
                >
                  Default Address
                </div>
              )}

              <div className="form-btn-row">
                <button className="btn-cancel" onClick={() => handleEdit(addr)}>
                  EDIT
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => handleDelete(addr._id)}
                >
                  DELETE
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
