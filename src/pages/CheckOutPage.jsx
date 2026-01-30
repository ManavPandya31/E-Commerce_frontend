import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "../Slices/loaderSlice";
import NavBar from "../Components/NavBar";
import AddAddress from "../Components/AddAddress";
import "../css/checkoutpage.css";
import GetAddress from "../Components/GetAddress";

export default function CheckOutPage({cartCount}) {

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddAddress, setShowAddAddress] = useState(false);  
  const [cartTotal, setCartTotal] = useState(0);

  const { id } = useParams();
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

 const fetchSingleProductPrice = async () => {
  try {
    dispatch(showLoader());

    const res = await axios.get(`http://localhost:3131/api/products/findSingleProduct/${id}`);
    console.log("Response From Single Product API :-" ,res);
    
    const product = res.data.data;
    setCartTotal(product.finalPrice ??  product.price);

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
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setCartTotal(res.data.data.totalAmount);
  } catch (err) {
    console.log("Cart total error", err);
  } finally {
    dispatch(hideLoader());
  }
};

  useEffect(() => {
    fetchAddresses();

    if (id) {
      fetchSingleProductPrice();   
  } else {
      fetchCartTotal();            
  }
  }, []);

const handlePlaceOrder = async () => {

  if (!selectedAddressId) {
    Swal.fire("Select address first");
    return;
  }

  const token = localStorage.getItem("token");
  let products = [];

  if (id) {
    products = [{
      product: id,
      quantity: 1,
      price: cartTotal
    }];
    
  } else {
    const cartRes = await axios.get("http://localhost:3131/api/cart/readAllItems",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    products = cartRes.data.data.items.map(item => ({
      product: item.product,
      quantity: item.quantity,
      price: item.finalPrice
    }));
  }

  await axios.post("http://localhost:3131/api/orders/createOrder",
    {
      addressId: selectedAddressId,
      products
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  Swal.fire("Order placed successfully!");
};

return (
  <div>
    <NavBar cartCount={cartCount} />

    <div className="checkout-wrapper">
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
              onSuccess={() => window.location.reload()}
            />
          )}
        </div>
      </div>

      <div className="price-summary">
        <h3>Price Details</h3>
        <div className="price-row">
          <span>Total Amount</span>
          <span>₹ {cartTotal}</span>
        </div>
          <button className="place-order-btn" onClick={handlePlaceOrder}>PLACE ORDER</button>
      </div>
    </div>
  </div>
);
}
