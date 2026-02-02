import React from 'react';
import { useState  , useEffect} from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { showLoader , hideLoader } from '../Slices/loaderSlice';
import AddAddress from './AddAddress';

export default function GetAddress({showRadio = false,selectedAddressId,onSelect,onSuccess,onDelete}) {

    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);

    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const dispatch = useDispatch();

    const fetchAddresses = async () => {
    try {
      dispatch(showLoader());

      if (!token) return;

      const res = await axios.get("http://localhost:3131/api/auth/getAllAddress",config);
      console.log("Response From Get Address Api :- ",res);
      
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

  const handleEdit = (addr) => {
    setEditId(addr._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    
    try {
      dispatch(showLoader());

      const res = await axios.delete(`http://localhost:3131/api/auth/deleteAddress/${id}`,config);
      console.log("Delete Address Response:", res);

      fetchAddresses();
      if (onSuccess) onSuccess();
        if (onDelete) onDelete();
      
    } catch (error) {
      console.log("Delete Address Error:", error);
    } finally {
      dispatch(hideLoader());
    }
  };

  return (
    <div className="address-list">
      {addresses.length === 0 ? (
        <p style={{ color: "#878787", marginTop: "20px" }}>
          No addresses added yet.
        </p>
      ) : (
        addresses.map((addr) => (
          <div
            key={addr._id}
            className={`address-card ${showRadio && selectedAddressId === addr._id ? "selected" : ""}`}
          >
            {showRadio && (
              <input
                type="radio"
                name="deliveryAddress"
                value={addr._id}
                checked={selectedAddressId === addr._id}
                onChange={() => onSelect && onSelect(addr._id)}
                style={{ marginRight: "10px" }}
              />
            )}

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
                <span className="addr-label">Address:</span>
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
              <div style={{ color: "#388e3c", fontSize: "13px", marginTop: "5px" }}>
                Default Address
              </div>
            )}

            <div className="form-btn-row">
              <button className="btn-cancel" onClick={() => handleEdit(addr)}>
                EDIT
              </button>
              <button className="btn-cancel" onClick={() => handleDelete(addr._id)}>
                DELETE
              </button>
            </div>
          </div>
        ))
      )}

      {showForm && (
         <AddAddress
            editData={editId ? addresses.find((a) => a._id === editId) : null}
            onClose={() => {
            setShowForm(false);
            setEditId(null);
        }}
            onSuccess={() => {
            fetchAddresses();      
        if (onSuccess) onSuccess();  
        }}
             />
        )}

    </div>
  );
}