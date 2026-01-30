import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { showLoader, hideLoader } from '../Slices/loaderSlice';
import Swal from "sweetalert2";
import "../css/profileandotherpage.css";

export default function Orders() {
  
  const [orders, setOrders] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        dispatch(showLoader());
        const res = await axios.get("http://localhost:3131/api/orders/getOrder", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Response From GetOrder Api :-", res);

        if (res.data && res.data.data) {
          setOrders(res.data.data);
        }
      } catch (error) {
        console.log("Error fetching orders:", error);
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: "Could not fetch your orders.",
          confirmButtonColor: "#d33",
        });
      } finally {
        dispatch(hideLoader());
      }
    };

    fetchOrders();
  }, []);

  if (orders.length === 0) {
    return <div>No orders found.</div>;
  }

 return (
    <div className="orders-list">
      <h2>My Orders</h2>
      {orders.map((order) => (
        <div key={order._id} className="order-card">
          {/* <div className="order-header">
            <span>Status: {order.status || "Pending"}</span>
          </div> */}

          <div className="order-items">
            {order.products.map((item, idx) => {
              const product = item.product;
              return (
                <div key={idx} className="order-item">
                  {product?.productImage && (
                    <img
                      src={product.productImage}
                      alt={product.name || "Product"}
                      className="order-product-image"
                    />
                  )}
                  <span>{product?.name || "Product not found"}</span>
                  <span>Quantity: {item.quantity}</span>
                  <span>Price: ₹{item.price || 0}</span>
                </div>
              );
            })}
          </div>

          <div className="order-total">
            <strong>
              Total: ₹{order.products.reduce((sum, i) => sum + (i.price || 0), 0)}
            </strong>
          </div>
        </div>
      ))}
    </div>
  );
}
