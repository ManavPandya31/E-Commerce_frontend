import React from 'react';
import { useState } from 'react';
import axiosInstance from "../Utils/axiosInstance";
import { useDispatch } from 'react-redux';
import { showLoader , hideLoader } from '../Slices/loaderSlice';
import "../css/addaddress.css"

export default function AddAddress({ onClose, onSuccess, editData = null }) {

  const [editId, setEditId] = useState(editData?._id || null);
  const [formData, setFormData] = useState({
    mobile: editData?.mobile || "",
    alternatePhone: editData?.alternatePhone || "",
    country: "India",
    state: editData?.state || "",
    addressType: editData?.addressType || "HOME",
    street: editData?.street || "",
    city: editData?.city || "",
    pincode: editData?.pincode || "",
    isDefault: editData?.isDefault || false,
  });

  const dispatch = useDispatch();

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const indianStates = [
    "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
    "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand",
    "Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
    "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan",
    "Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
    "Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh",
  ];

  const btnSave = async () => {

    if (!formData.mobile || !formData.street || !formData.city || !formData.pincode || !formData.state) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      dispatch(showLoader());

      if (editId) {
        const res = await axiosInstance.put(`/api/auth/updateAddress/${editId}`,formData,config);
        console.log("Response From Update Address :- ", res);

      } else {
        const response = await axiosInstance.post("/api/auth/addAddress",formData,config);
        console.log("Response From Add Address :- ", response);
      }

        onSuccess();
        onClose();

    } catch (error) {
      console.log("Save Address Error:", error);
      
    } finally {
      dispatch(hideLoader());
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="address-form-box">
          <div className="input-group-row">
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
              {["HOME", "WORK", "SCHOOL", "COLLEGE", "UNIVERSITY"].map((type) => (
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
              ))}
            </div>
          </div>

          <div className="form-btn-row">
            <button className="btn-save" onClick={btnSave}>
              SAVE
            </button>
            <button className="btn-cancel" onClick={onClose}>
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
