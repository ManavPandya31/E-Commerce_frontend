import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "../Slices/loaderSlice";
import NavBar from "../Components/NavBar";
import GetAddress from "../Components/GetAddress";
import AddAddress from "../Components/AddAddress";
import "../css/cartpage.css";
import Swal from "sweetalert2";

export default function CartPage({cartItems,setCartItems,cartCount,setCartCount,}) {

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [hasAddress, setHasAddress] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const token = localStorage.getItem("token");

  const fetchCartItems = async () => {
    try {
      dispatch(showLoader());
      const response = await axios.get("http://localhost:3131/api/cart/readAllItems",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Response From Get Cart Api :-", response);
      const items = response.data.data.items || [];
      setCartItems(items);
      const validItems = items.filter((item) => item.product);
      setCartCount(
        validItems.reduce((sum, item) => sum + item.quantity, 0)
      );
    } catch (error) {
      console.log("Fetch Cart Error :-", error);
    } finally {
      dispatch(hideLoader());
    }
  };

  const fetchAddressesForCart = async () => {
    try {
      const res = await axios.get("http://localhost:3131/api/auth/getAllAddress",
        { headers: { Authorization: `Bearer ${token}` } });
      console.log("Response From Get Address Api (Cart) :-", res);
      const addresses = res.data.data.addresses || [];
      if (addresses.length > 0) {
        setHasAddress(true);
        const lastAddress = addresses[addresses.length - 1];
        setSelectedAddressId(lastAddress._id);
        setSelectedAddress(lastAddress);
      } else {
        setHasAddress(false);
        setSelectedAddressId(null);
        setSelectedAddress(null);
      }
    } catch (error) {
      console.log("Fetch Address Cart Error :-", error);
      setHasAddress(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
    fetchAddressesForCart();
  }, []);

  const increaseQty = async (item) => {
    try {
      dispatch(showLoader());
      const response = await axios.put("http://localhost:3131/api/cart/updateCartItems",
        {
          productId: item.product._id,
          quantity: item.quantity + 1,
        },
        { headers: { Authorization: `Bearer ${token}` } });
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
      const response = await axios.put("http://localhost:3131/api/cart/updateCartItems",
        {
          productId: item.product._id,
          quantity: item.quantity - 1,
        },
        { headers: { Authorization: `Bearer ${token}` } });
      console.log("Decrease Qty Response :-", response);
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
        });
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

  const handlePlaceOrderClick = () => {
    if (!selectedAddressId) {
      setShowAddressModal(true);
      return;
    }
    setShowOrderModal(true);
  };

  const handleConfirmOrder = async () => {
  if (!selectedAddress) return;

  setShowOrderModal(false);

  const result = await Swal.fire({
    title: "Are you sure?",
    text: "Do you want to place this order?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, place order",
    cancelButtonText: "Cancel",
  });

  if (!result.isConfirmed) {
    setShowOrderModal(true);
    return;
  }

  try {
    dispatch(showLoader());

    const payload = {
      products: cartItems.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.finalPrice ?? item.price
      })),
      addressId: selectedAddress._id
    };

    const res = await axios.post(
      "http://localhost:3131/api/orders/createOrder",
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    Swal.fire({
      icon: "success",
      title: "Order Placed!",
      text: res.data.message || "Your order has been placed successfully!",
    }).then(() => {
      navigate("/profile/orders");
    });

  } catch (error) {
    setShowOrderModal(true);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Something went wrong while placing the order",
    });
  } finally {
    dispatch(hideLoader());
  }
};


  return (
  <div>
    <NavBar cartCount={cartCount} />

    {validItems.length === 0 ? (
      <div className="empty-cart-container">
        <div className="empty-cart-content">
          <h2>Your Cart is Empty</h2>
          <button className="btn-empty-cart" onClick={() => navigate("/")}>
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
                <p className="text-muted">
                  Price: Rs.{item.finalPrice || 0}
                </p>

                <div className="qty-section">
                  <button className="qty-btn" onClick={() => decreaseQty(item)}>
                    -
                  </button>
                  <span className="qty-number">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => increaseQty(item)}>
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

          {selectedAddress ? (
            <div className="selected-address-box">
              <h4>Delivery Address</h4>
              <p>
                {selectedAddress.street}, {selectedAddress.city},{" "}
                {selectedAddress.state} - {selectedAddress.pincode}
              </p>
              <p>Mobile: {selectedAddress.mobile}</p>

              <button
                className="btn-add-address"
                style={{ marginTop: "10px" }}
                onClick={() => setShowAddressModal(true)}
              >
                Add / Change Address
              </button>
            </div>
          ) : (
            <button
              className="btn-add-address"
              onClick={() => setShowAddressModal(true)}
            >
              Add Address
            </button>
          )}

          <button
            className="btn-place-order"
            disabled={!hasAddress}
            onClick={handlePlaceOrderClick}
            style={{
              opacity: !hasAddress ? 0.6 : 1,
              cursor: !hasAddress ? "not-allowed" : "pointer",
            }}
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
            onSuccess={() => fetchAddressesForCart()}
            onDelete={() => {
              setShowAddressModal(false);
              navigate("/cart");
            }}
            refetchAddresses={() => fetchAddressesForCart()}
          />

          {showAddAddress ? (
            <AddAddress
              onClose={() => setShowAddAddress(false)}
              onSuccess={() => {
                setShowAddAddress(false);
                setShowAddressModal(false);
                fetchAddressesForCart();
              }}
            />
          ) : (
            <button
              className="btn-add-address"
              onClick={() => setShowAddAddress(true)}
            >
              + Add New Address
            </button>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "16px",
            }}
          >
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

    {showOrderModal && (
      <div className="order-modal">
        <div className="order-modal-content">
          <h2>Confirm Your Order</h2>

          {selectedAddress && (
            <>
              <h3>Delivery Address</h3>
              <div className="address-card selected">
                <input type="radio" checked readOnly />
                <div className="address-details">
                  <p className="mobile">{selectedAddress.mobile}</p>
                  <p>{selectedAddress.fullName}</p>
                  <p>
                    {selectedAddress.street}, {selectedAddress.city}
                  </p>
                  <p>
                    {selectedAddress.state} - {selectedAddress.pincode}
                  </p>
                </div>
              </div>
            </>
          )}

          <h3 style={{ marginTop: "16px" }}>Order Details</h3>

          <div className="address-list">
            {cartItems.map((item) => (
              <div
                key={item._id || item.product?._id}
                className="address-card"
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <img
                  src={item.product?.productImage}
                  alt={item.product?.name}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />

                <div className="address-details">
                  <p className="mobile">{item.product?.name}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>
                    Price: ₹{" "}
                    {(item.finalPrice || item.price) * item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="price-summary" style={{ marginTop: "16px" }}>
            <h3>Price Details</h3>
            <div className="price-row">
              <span>Total Amount</span>
              <span>₹ {grandTotal}</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "24px",
            }}
          >
            <button
              className="btn-close"
              onClick={() => setShowOrderModal(false)}
            >
              CANCEL
            </button>
            <button
              className="btn-place-order"
              onClick={handleConfirmOrder}
            >
              PAY & PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

}
