import React from 'react';
import { useState } from 'react';
import AddAddress from './AddAddress';
import GetAddress from './GetAddress';

export default function ProductDetailsPage() {
   const [showAddForm, setShowAddForm] = useState(false);

  const handleSuccess = () => {
    setShowAddForm(false);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Select Delivery Address</h2>

        {!showAddForm ? (
          <>
            <GetAddress
              showRadio={true}
              onSelect={(id) => onAddressSelect(id)}
              onSuccess={handleSuccess}
            />
            <button
              className="btn-add-address"
              onClick={() => setShowAddForm(true)}
            >
              Add New Address
            </button>
          </>
        ) : (
          <AddAddress
            onClose={() => setShowAddForm(false)}
            onSuccess={handleSuccess}
          />
        )}

        <button className="btn-close" onClick={onClose}>
          CLOSE
        </button>
      </div>
    </div>
  );
}