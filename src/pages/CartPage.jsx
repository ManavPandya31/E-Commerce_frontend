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

export default function CartPage({cartItems,setCartItems,cartCount,setCartCount}) {

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [hasAddress, setHasAddress] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [comboMap, setComboMap] = useState({});
  const [selectedCombos, setSelectedCombos] = useState({});

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const token = localStorage.getItem("token");

  const fetchCartItems = async () => {
    try {
      dispatch(showLoader());
      const response = await axios.get("http://localhost:3131/api/cart/readAllItems",
        { headers: { Authorization: `Bearer ${token}` } },);
      console.log("Response From Get Cart Api :-", response);

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

  const fetchAddressesForCart = async () => {
    try {
      const res = await axios.get("http://localhost:3131/api/auth/getAllAddress",
        { headers: { Authorization: `Bearer ${token}` } },);
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

  useEffect(() => {
    cartItems.forEach((item) => {
      if (item.product?._id) {
        fetchComboForProduct(item.product._id);
      }
    });
  }, [cartItems]);

  const increaseQty = async (item) => {
    try {
      dispatch(showLoader());
      const response = await axios.put("http://localhost:3131/api/cart/updateCartItems",
        {
          productId: item.product._id,
          quantity: item.quantity + 1,
        },
        { headers: { Authorization: `Bearer ${token}` } },);

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
        { headers: { Authorization: `Bearer ${token}` } },);
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
        },);
      console.log("Delete Cart Item Response :-", response);

      fetchCartItems();

    } catch (error) {
      console.log("Delete Cart Item Error :-", error);
    } finally {
      dispatch(hideLoader());
    }
  };

  const validItems = cartItems.filter((item) => item.product);

  const grandTotal = validItems.reduce((sum, item) => {

  const combo = comboMap[item.product._id];
  const isComboSelected = selectedCombos[item.product._id];

  if (combo && isComboSelected) {
    return sum + combo.comboPrice * item.quantity;
  }

  return sum + (item.finalPrice || 0) * item.quantity;
  }, 0);

  const finalAmount = appliedCoupon ? appliedCoupon.payableAmount : grandTotal;

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
   products: cartItems
  .filter(item => item.product)
  .map((item) => {
    const productId = item.product?._id;

    const combo = comboMap[productId];
    const isComboSelected = selectedCombos[productId];

    return {
      product: productId,
      quantity: item.quantity,
      comboId: isComboSelected ? combo?._id : null,
    };
  }),

      addressId: selectedAddress._id,
      coupon: appliedCoupon?.code || null,
      discountAmount: appliedCoupon
        ? grandTotal - appliedCoupon.payableAmount
        : 0,
      totalAmount: appliedCoupon?.payableAmount ?? grandTotal,
    };

    const res = await axios.post("http://localhost:3131/api/orders/createOrder",payload,
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
  console.log("Order API FULL ERROR:", error);
  console.log("Backend response:", error.response?.data);

  Swal.fire({
    icon: "error",
    title: "Order Failed",
    text: error.response?.data?.message || "Order failed",
  });

  setShowOrderModal(true);

  } finally {
    dispatch(hideLoader());
  }
  };

 const handleApplyCoupon = async () => {

  if (!couponCode) return;

  try {
    dispatch(showLoader());

    const validItemsForCoupon = cartItems.filter(item => item.product);
    const res = await axios.post("http://localhost:3131/api/orders/applyCoupon",
      {
        code: couponCode,
         products: validItemsForCoupon.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("Apply Coupon Api Response :-",res);

    setAppliedCoupon({
      code: res.data.data.couponCode,
      payableAmount: res.data.data.payableAmount,
      discountAmount: res.data.data.discountAmount,
    });

    Swal.fire({
      icon: "success",
      title: "Coupon Applied!",
      text: "Coupon Applied Sucssfully",
    });

  } catch (error) {
  console.error("Apply Coupon Error:", error);
  const msg = error.response?.data?.message || error.message || "Something went wrong";

  let title = "Coupon Error";

  if (msg.toLowerCase().includes("invalid")) title = "Invalid Coupon";
  else if (msg.toLowerCase().includes("expired")) title = "Coupon Expired";
  else if (msg.toLowerCase().includes("limit")) title = "Coupon Limit Reached";
  else if (msg.toLowerCase().includes("minimum")) title = "Minimum Order Not Met";
  else if (msg.toLowerCase().includes("not applicable")) title = "Coupon Not Applicable";

  Swal.fire({
    icon: "error",
    title: title,
    text: msg,
    confirmButtonText: "OK",
  });

  } finally {
    dispatch(hideLoader());
  }
  };

  const fetchComboForProduct = async (productId) => {
  try {
    const res = await axios.get(`http://localhost:3131/api/products/getComboProduct/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    console.log("Response From Get Combo API :-", res);

    if (res.data?.data?.isActive) {
      setComboMap(prev => ({
        ...prev,
        [productId]: res.data.data,
      }));
    }
  } catch (err) {
    if (err.response?.status !== 404) {
    console.error("Combo API error:", err);
    }
  }
};

return (
  <div>
    <NavBar cartCount={cartCount} />

    {validItems.length === 0 ? (
  <div className="empty-cart-container">
    <div className="empty-cart-icon">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
      </svg>
    </div>
    
    <h2>Your cart is empty</h2>
    <p className="empty-cart-subtitle">Looks like you haven't added anything yet.</p>
    
    <button className="btn-empty-cart" onClick={() => navigate("/")}>
      Start Shopping
    </button>
  </div>
) : (
  <div className="container py-5 cart-container">
        <div className="cart-items">
          <h2 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '10px'}}>Shopping Cart</h2>
          {validItems.map((item) => {
            const combo = comboMap[item.product._id];
            const isComboSelected = selectedCombos[item.product._id];

            return (
              <React.Fragment key={item._id}>
                <div className="cart-card">
                  <img
                    src={item.product.productImage}
                    alt={item.product.name}
                    className="cart-img"
                  />

                  <div className="cart-info">
                    <h5>{item.product.name}</h5>
                    <p className="text-muted">
                      {item.product.category || "Item"}
                    </p>

                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div className="qty-section">
                        <button className="qty-btn" onClick={() => decreaseQty(item)}>
                            -
                        </button>
                        <span className="qty-number">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => increaseQty(item)}>
                            +
                        </button>
                        </div>
                        <p className="fw-bold">
                        Rs. {(isComboSelected && combo
                            ? combo.comboPrice
                            : item.finalPrice || 0) * item.quantity}
                        </p>
                    </div>
                  </div>
                </div>

                {combo && (
                  <div className="combo-separate-card">
                    <h6 className="combo-title">Special Combo Offer</h6>
                    <div className="combo-products" style={{display: 'flex', gap: '10px'}}>
                      {combo.subProducts.map((sub) => (
                        <div key={sub._id} className="combo-small-box">
                          <img src={sub.productImage} alt={sub.name} style={{width: '50px', height: '50px', objectFit: 'contain'}} />
                          <p style={{fontSize: '11px', margin: '4px 0'}}>{sub.name}</p>
                          <span style={{fontWeight: 'bold', fontSize: '12px'}}>Rs. {sub.finalPrice}</span>
                        </div>
                      ))}
                    </div>
                    <div className="combo-footer">
                      <label className="combo-checkbox">
                        <input
                          type="checkbox"
                          checked={!!selectedCombos[item.product._id]}
                          onChange={(e) =>
                            setSelectedCombos((prev) => {
                              const checked = e.target.checked;
                              if (checked) setAppliedCoupon(null);
                              return { ...prev, [item.product._id]: checked };
                            })
                          }
                        />
                        Add Combo
                      </label>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="cart-summary">
          <h3 className="summary-title">Order Summary</h3>

          <div className="price-row">
            <span>Subtotal</span>
            <span>Rs. {grandTotal}</span>
          </div>
          
          <div className="price-row">
            {/* <span>Shipping</span> */}
            {/* <span style={{color: 'green'}}>Free</span> */}
          </div>

          {appliedCoupon && (
            <div className="price-row" style={{color: 'green'}}>
              <span>Discount</span>
              <span>- Rs. {appliedCoupon.discountAmount}</span>
            </div>
          )}

          <div className="price-row total">
            <span>Total</span>
            <span>Rs. {appliedCoupon?.payableAmount ?? grandTotal}</span>
          </div>

          {!Object.values(selectedCombos).some(Boolean) && (
            <div className="coupon-section">
              <input
                type="text"
                placeholder="Promo code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="coupon-input"
              />
              <button className="btn-apply-coupon" onClick={handleApplyCoupon}>
                Apply
              </button>
            </div>
          )}

          {selectedAddress ? (
            <div className="address-box">
              <h4>Delivery Address</h4>
              <p>{selectedAddress.street}, {selectedAddress.city}</p>
              <p>{selectedAddress.state} - {selectedAddress.pincode}</p>
              <button
                className="btn-change-address"
                onClick={() => setShowAddressModal(true)}
              >
               Add/Change Address
              </button>
            </div>
          ) : (
            <button
              className="btn-change-address"
              style={{width: '100%'}}
              onClick={() => setShowAddressModal(true)}
            >
              + Add Delivery Address
            </button>
          )}

          <button
            className="btn-place-order2"
            disabled={!hasAddress || validItems.length === 0}
            onClick={handlePlaceOrderClick}
          >
            Payment
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
            {cartItems
              .filter((item) => item.product)
              .map((item) => {
                const combo = comboMap[item.product?._id];

                return (
                  <div
                    key={item._id || item.product?._id}
                    className="address-card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                      }}
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
                          Price: Rs. {item.finalPrice || item.price * item.quantity}
                        </p>
                      </div>
                    </div>

                    {combo && selectedCombos?.[item.product?._id] && (
                      <div className="combo-wrapper">
                        {combo.subProducts.map((sub) => (
                          <div key={sub._id} className="combo-box small">
                            <img src={sub.productImage} alt={sub.name} />
                            <p>{sub.name}</p>
                            <span>Rs. {sub.finalPrice}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          <div className="price-summary" style={{ marginTop: "16px" }}>
            <h3>Price Details</h3>
            <div className="price-row">
              <span>Total Amount</span>
              <span>Rs. {appliedCoupon?.payableAmount ?? grandTotal}</span>
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
            <button className="btn-place-order" onClick={handleConfirmOrder}>
              Payment
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
