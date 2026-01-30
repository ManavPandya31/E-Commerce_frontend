import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "../Slices/loaderSlice";
import NavBar from "../Components/NavBar";
import Swal from "sweetalert2";
import GetAddress from "../Components/GetAddress";
import AddAddress from "../Components/AddAddress";
import "../css/cartpage.css";

export default function CartPage({cartItems,setCartItems,cartCount,setCartCount,}) {

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const token = localStorage.getItem("token");

  const fetchCartItems = async () => {

    try {

      dispatch(showLoader());

      const response = await axios.get("http://localhost:3131/api/cart/readAllItems",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Response From Get Cart Api :-",response);
      
      const items = response.data.data.items || [];
      setCartItems(items);

      const validItems = items.filter((item) => item.product);
      setCartCount(validItems.reduce((sum, item) => sum + item.quantity, 0));

    } catch (error) {
      console.log("Fetch Cart Error :-", error);

    } finally {
      dispatch(hideLoader());
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const increaseQty = async (item) => {
      
  try {
    dispatch(showLoader());
    const response = await axios.put("http://localhost:3131/api/cart/updateCartItems",
      {
        productId: item.product._id,
        quantity: item.quantity + 1,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("Increase Qty Response :-", response);

    fetchCartItems();

  } catch (error) {
    console.log("Increase Qty Error :-", error);

  } finally {
    dispatch(hideLoader());
  }
};

 const decreaseQty = async (item) => {
  if (item.quantity === 1) {
    await deleteItem(item.product._id);
    return;
  }
  try {
    dispatch(showLoader());
    await axios.put("http://localhost:3131/api/cart/updateCartItems",
      {
        productId: item.product._id,
        quantity: item.quantity - 1,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchCartItems();

  } catch (error) {
    console.log("Decrease Qty Error :-", error);

  } finally {
    dispatch(hideLoader());
  }
};

 const deleteItem = async (productId) => {
  try {
    dispatch(showLoader());
    const response = await axios.delete("http://localhost:3131/api/cart/deleteCartItems",
      {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId },
      }
    );
    console.log("Delete Cart Item Response :-", response);
    fetchCartItems();

  } catch (error) {
    console.log("Delete Cart Item Error :-", error);

  } finally {
    dispatch(hideLoader());
  }
};

 const validItems = cartItems.filter((item) => item.product);

 const grandTotal = validItems.reduce(
    (sum, item) => sum + (item.finalPrice || 0) * item.quantity,
    0
  );

  const handlePlaceOrderClick = async () => {

    if (!selectedAddressId) {
      setShowAddressModal(true);
      return;
    }
    
    // const result = await Swal.fire({
    //   title: "Are you sure?",
    //   text: "Do you want to place this order?",
    //   icon: "question",
    //   showCancelButton: true,
    //   confirmButtonText: "Yes, place order",
    //   cancelButtonText: "Cancel",
    // });

    // if (!result.isConfirmed) return;

    navigate("/checkout", { state: { addressId: selectedAddressId } });
  };

return (
  <div>
    <NavBar cartCount={cartCount} />

    {validItems.length === 0 ? (
      <div className="empty-cart-container">
        <div className="empty-cart-content">
          <h2>Your Cart is Empty</h2>
          {/* <p>Add items to your cart to get started.</p> */}
          <button
            className="btn-empty-cart"
            onClick={() => navigate("/")} 
          >
            Shop Now
          </button>
        </div>
      </div>
    ) : (
      <div className="container py-5 cart-container">
        <div className="cart-items">
          {validItems.map((item) => (
            <div key={item._id} className="cart-card">
              <img
                src={item.product.productImage}
                alt={item.product.name}
                className="cart-img"
              />
              <div className="cart-info">
                <h5>{item.product.name}</h5>
                <p className="text-muted">Price: Rs.{item.finalPrice || 0}</p>
                <div className="qty-section">
                  <button
                    className="qty-btn"
                    onClick={() => decreaseQty(item)}
                  >
                    -
                  </button>
                  <span className="qty-number">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => increaseQty(item)}
                  >
                    +
                  </button>
                </div>
                <p className="fw-bold mt-2 text-end">
                  Total: Rs.{(item.finalPrice || 0) * item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Price Details</h3>
          {validItems.map((item) => (
            <p key={item._id}>
              {item.product.name} x {item.quantity}: Rs.{" "}
              {(item.finalPrice || 0) * item.quantity}
            </p>
          ))}
          <hr />
          <p className="grand-total">Total Amount: Rs.{grandTotal}</p>

          <button
            className="btn-place-order"
            onClick={handlePlaceOrderClick}
          >
            PLACE ORDER
          </button>
        </div>
      </div>
    )}

    {showAddressModal && (
      <div className="modal-backdrop">
        <div className="modal-content">
          <h2>Select Delivery Address</h2>

          <GetAddress
            showRadio={true}
            selectedAddressId={selectedAddressId}
            onSelect={(id) => setSelectedAddressId(id)}
          />

          {showAddAddress ? (
            <AddAddress
              onClose={() => setShowAddAddress(false)}
              onSuccess={() => window.location.reload()}
            />
          ) : (
            <button
              className="btn-add-address"
              onClick={() => setShowAddAddress(true)}
            >
              + Add New Address
            </button>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
            <button
              className="btn-add-address"
              onClick={() => {
                if (!selectedAddressId) {
                  Swal.fire({
                    icon: "warning",
                    title: "Select Address",
                    text: "Please select a delivery address",
                  });
                  return;
                }
                setShowAddressModal(false);
                handlePlaceOrderClick();
              }}
            >
              CONFIRM
            </button>

            <button
              className="btn-close"
              onClick={() => setShowAddressModal(false)}
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
