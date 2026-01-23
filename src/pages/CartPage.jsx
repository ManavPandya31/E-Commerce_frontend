import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "../Slices/loaderSlice";
import NavBar from "../Components/NavBar";
import "../css/cartpage.css";

export default function CartPage({cartItems,setCartItems,cartCount,setCartCount,}) {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const btnShopping = () => {
    navigate("/");
  };

  const token = localStorage.getItem("token");

  const fetchCartItems = async () => {
    try {

       dispatch(showLoader());
      const response = await axios.get("http://localhost:3131/api/cart/readAllItems",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const items = response.data.data.items;

      setCartItems(items);

      const total = items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);

    } catch (error) {
      console.log("Fetch Cart Error :-", error);

    }finally{
       dispatch(hideLoader());
    }
  };
  useEffect(() => {
    fetchCartItems();
  }, []);

  if (cartItems.length === 0) {
    return (
      <><NavBar/>
      <button className="cart-text" onClick={btnShopping}>Your Cart is Empty! Go For Shopping</button>
      </>
    );
  }

  const increaseQty = async (item) => {
    try {

       dispatch(showLoader());

      const response = await axios.put("http://localhost:3131/api/cart/updateCartItems",
        {
          productId: item.product._id,
          quantity: item.quantity + 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Increase Qty Response :-", response);
      fetchCartItems();

    } catch (error) {
      console.log("Increase Qty Error :-", error);

    }finally{
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
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchCartItems();

    } catch (error) {
      console.log("Decrease Qty Error :-", error);
    }finally{
       dispatch(hideLoader());
    }
  };

  const deleteItem = async (productId) => {

    try {

       dispatch(showLoader());

      const response = await axios.delete("http://localhost:3131/api/cart/deleteCartItems",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: { productId },
        },
      );

      console.log("Delete Cart Item Response :-", response);
      fetchCartItems();

    } catch (error) {
      console.log("Delete Cart Item Error :-", error);

    }finally{
        dispatch(hideLoader());
    }
  };
  const validItems = cartItems.filter((item) => item.product);

  const grandTotal = validItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div>
      <NavBar cartCount={cartCount} />
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
                <p className="text-muted">Price: Rs.{item.price}</p>

                <div className="qty-section">
                  <button className="qty-btn" onClick={() => decreaseQty(item)}>
                    {" "}
                    -{" "}
                  </button>
                  <span className="qty-number">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => increaseQty(item)}>
                    {" "}
                    +{" "}
                  </button>
                </div>

                <p className="fw-bold mt-2 text-end">Total: Rs.{item.price * item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Price Details</h3>
          {validItems.map((item) => (
            <p key={item._id}>
              {item.product.name} x {item.quantity}: Rs.{" "}
              {item.price * item.quantity}
            </p>
          ))}
          <hr />
          <p className="grand-total">Total Amount: Rs.{grandTotal}</p>
        </div>
      </div>
    </div>
  );
}
