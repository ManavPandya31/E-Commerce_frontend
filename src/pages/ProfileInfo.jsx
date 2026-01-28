import React from 'react';
import { useOutletContext } from 'react-router-dom';

export default function ProfileInfo() {
    
  const { userDetails = {}, firstName = "", lastName = "" } = useOutletContext();

  return (
    <div className="profile-card">
      <div className="section-header">
        <h3>Personal Information</h3>
      </div>

      <div className="input-group-row">
        <input
          type="text"
          value={firstName || ""}
          readOnly
          className="styled-input"
          placeholder="First Name"
        />
        <input
          type="text"
          value={lastName || ""}
          readOnly
          className="styled-input"
          placeholder="Last Name"
        />
      </div>

      <div className="section-header">
        <h3>Email Address</h3>
      </div>
      <input
        type="text"
        value={userDetails?.email || ""}
        readOnly
        className="styled-input mid-width"
      />

      <div className="section-header">
        <h3>Mobile Number</h3>
      </div>
      <input
        type="text"
        value={userDetails?.phoneNumber || ""}
        readOnly
        className="styled-input mid-width"
      />

      <div className="section-header">
        <h3>Created At</h3>
      </div>
      <input
        type="text"
        value={userDetails?.createdAt || ""}
        readOnly
        className="styled-input mid-width"
      />
    </div>
  );
}
