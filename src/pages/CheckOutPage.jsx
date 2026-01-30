import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
// import Swal from "sweetalert2";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "../Slices/loaderSlice";
import NavBar from "../Components/NavBar";
// import AddAddress from "../Components/AddAddress";   
import "../css/checkoutpage.css";
// import GetAddress from "../Components/GetAddress";  

export default function CheckOutPage({ cartCount }) {

  // const [addresses, setAddresses] = useState([]);   
  // const [selectedAddressId, setSelectedAddressId] = useState(null); 
  // const [showAddAddress, setShowAddAddress] = useState(false);      

  const [cartTotal, setCartTotal] = useState(0);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const { id } = useParams();
  const location = useLocation();
  const addressId = location.state?.addressId;
  // const navigate = useNavigate();
  const dispatch = useDispatch();

  /*
  const fetchAddresses = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    try {
      dispatch(showLoader());

      const response = await axios.get( "http://localhost:3131/api/auth/getAllAddress",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAddresses(response.data.data.addresses || []);

    } catch (error) {
      console.log("Error fetching addresses:", error);

    } finally {
      dispatch(hideLoader());
    }
  };
  */

  const fetchSelectedAddress = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:3131/api/auth/getAllAddress",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Get All Address API Response :-",res);
      
      const address = res.data.data.addresses.find(
        (addr) => addr._id === addressId
      );

      setSelectedAddress(address);

    } catch (error) {
      console.log("Error fetching selected address", error);
    }
  };

  const fetchSingleProductPrice = async () => {

    try {

      dispatch(showLoader());
      const res = await axios.get(`http://localhost:3131/api/products/findSingleProduct/${id}`);
      console.log("Response From Fetch Single Product Api :-",res);
      
      const product = res.data.data;
      setCartTotal(product.finalPrice ?? product.price);
      setCartQuantity(1);
      setCartItems([
        {
          product,
          quantity: 1,
          finalPrice: product.finalPrice ?? product.price,
        },
      ]);

    } catch (error) {
      console.log("Error fetching product price", error);

    } finally {
      dispatch(hideLoader());
    }
  };

  const fetchCartTotal = async () => {

    try {

      dispatch(showLoader());
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:3131/api/cart/readAllItems",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Response From Get Cart Items API :-",res);
      
      const items = res.data.data.items || [];

      const totalAmount = items.reduce(
        (sum, item) =>
          sum + (item.finalPrice || item.price) * item.quantity,
        0
      );

      const totalQuantity = items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      setCartTotal(totalAmount);
      setCartQuantity(totalQuantity);
      setCartItems(items);

    } catch (err) {
      console.log("Cart total error", err);

    } finally {
      dispatch(hideLoader());
    }
  };

  useEffect(() => {
    // fetchAddresses(); 

    if (addressId) {
      fetchSelectedAddress();
    }

    if (id) {
      fetchSingleProductPrice();
    } else {
      fetchCartTotal();
    }
  }, []);

return (
  <div>
    <NavBar cartCount={cartCount} />

    <div className="checkout-wrapper">

      <div className="checkout-container">

        {selectedAddress && (
          <>
            <h2>Delivery Address</h2>

            <div className="address-list">
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
            </div>
          </>
        )}

        <h2 style={{ marginTop: "24px" }}>Order Details</h2>

        <div className="address-list">
          {cartItems.map((item) => (
            <div
              key={item._id || item.product?._id}
              className="address-card"
              style={{ display: "flex", alignItems: "center", gap: "16px" }}
            >
              <div style={{ flexShrink: 0 }}>
                <img
                  src={item.product?.productImage}
                  alt={item.product?.name}
                  style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }}
                />
              </div>
              <div className="address-details">
                <p className="mobile">{item.product?.name}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Price: ₹ {(item.finalPrice || item.price) * item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      <div className="price-summary">
        <h2>Price Details</h2>

        <div className="price-row">
          <span>Total Amount</span>
          <span>₹ {cartTotal}</span>
        </div>

        <button className="place-order-btn">
          PLACE ORDER
        </button>
      </div>

    </div>
  </div>
);
}
