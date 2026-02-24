import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "../Slices/loaderSlice";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import NavBar from "../Components/NavBar";
import GetAddress from "../Components/GetAddress";
import AddAddress from "../Components/AddAddress";
import Swal from "sweetalert2";
import "../css/productdetails.css";

export default function ProductDetails({setCartItems,cartCount,setCartCount,}) {

  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [hasAddress, setHasAddress] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [reviewsData, setReviewsData] = useState(null);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  const token = localStorage.getItem("token");
  const config = {headers: { Authorization: `Bearer ${token}` },}

  useEffect(() => {
    const fetchProduct = async () => {

      try {
        dispatch(showLoader());
        const response = await axiosInstance.get(`/api/products/findSingleProduct/${id}`,);
        console.log("Response From FetchProduct API :-", response);

        setProduct(response.data.data);
        fetchRelatedProducts(response.data.data._id);
        fetchReviews();

      } catch (error) {
        console.log("Error fetching product:", error);

      } finally {
        dispatch(hideLoader());
      }
    };
    fetchProduct();
  }, [id]);

  const isOutOfStock = product?.stock === 0;

  const fetchAddresses = async () => {
    try {
      const res = await axiosInstance.get("/api/auth/getAllAddress",config);
      console.log("Response From Fetch Address API :-", res);

      const addresses = res.data.data.addresses || [];

      if (addresses.length > 0) {
        setHasAddress(true);
        const lastAddress = addresses[addresses.length - 1];
        setSelectedAddressId(lastAddress._id);
        setSelectedAddress(lastAddress);

      } else {
        setHasAddress(false);
      }

    } catch (error) {
      console.log("Fetch Address Error:", error);
      setHasAddress(false);
    }
  };

  const handleAddToCart = async () => {

    if (isOutOfStock) return alert("Product is out of stock");

    if (!token) return navigate("/auth");

    try {
      dispatch(showLoader());

      const payload = {
        productId: product._id,
        quantity: 1,
      };

      const res = await axiosInstance.post("/api/cart/addCartItems", payload,config);
      console.log("Add to Cart Response:", res);

      if (res.data?.cart?.items) {
        setCartItems(res.data.cart.items);
        setCartCount(res.data.cart.items.length);
      }

      navigate("/cart");

    } catch (error) {
      console.log("Add to Cart Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add product to cart",
        customClass: { container: "my-swal-highest" },
      });

    } finally {
      dispatch(hideLoader());
    }
  };

  const BuyButton = async () => {
    if (isOutOfStock) return alert("Product is out of stock");

    if (!token) return navigate("/auth");

    await fetchAddresses();
    setShowAddressModal(true);
  };

  const handlePlaceOrderClick = () => {

    if (!selectedAddressId) {
      setShowAddressModal(true);
      return;
    }
    setShowOrderModal(true);
  };

  const handleConfirmOrder = async () => {

    if (!selectedAddress) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to place this order?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, place order",
      cancelButtonText: "Cancel",
      customClass: {
        container: "my-swal-highest",
      },
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      dispatch(showLoader());
      const payload = {
        products: [
          {
            product: product._id,
            quantity: 1,
            price: product.finalPrice ?? product.price,
          },
        ],
        addressId: selectedAddress._id,
      };

      const res = await axiosInstance.post("/api/orders/createOrder", payload,config);
      console.log("Response From Create Order API :-", res);

      setShowOrderModal(false);

      Swal.fire({
        icon: "success",
        title: "Order Placed!",
        text: res.data.message || "Your order has been placed successfully!",
        customClass: {
          container: "my-swal-highest",
        },
      }).then(() => {
        navigate("/profile/orders");
      });

    } catch (error) {
      console.log("Order Error :-", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while placing the order",
        customClass: {
          container: "my-swal-highest",
        },
      });

    } finally {
      dispatch(hideLoader());
    }
  };

  const fetchRelatedProducts = async (productId) => {
    try {
      const res = await axiosInstance.get(`/api/products/related-products/related/${productId}`,);
      console.log("Response From Related Products Api :-", res);

      setRelatedProducts(res.data.data || []);

    } catch (error) {
      console.log("Error fetching related products:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      dispatch(showLoader());
      const res = await axiosInstance.get(`/api/products/getReview/${id}`);
      console.log("Review API Response:", res);

      setReviewsData({
        reviews: res.data.reviews || [],
        averageRating: res.data.averageRating,
        totalReviews: res.data.reviews?.length || 0,
      });

    } catch (error) {
      console.log("Error fetching reviews:", error);

    } finally {
      dispatch(hideLoader());
    }
  };

  const handleSubmitReview = async () => {

    if (!token) return navigate("/auth");

    if (!newRating || !newComment) {
      return alert("Please give rating and comment");
    }

    try {
      dispatch(showLoader());

      const res = await axiosInstance.post(`/api/products/reviewProduct/${id}`,
        {
          rating: newRating,
          comment: newComment,
        },config);
      console.log("Response From Reviews And Ratings Api :-", res);

      setNewRating(0);
      setNewComment("");
      fetchReviews();

    } catch (error) {
      console.log("Review submit error:", error);
      
    } finally {
      dispatch(hideLoader());
    }
  };

  if (!product) return <p className="product-not-found">Product not found</p>;

  const renderStars = (rating) => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<FaStar key={i} />);
      } else if (rating >= i - 0.5) {
        stars.push(<FaStarHalfAlt key={i} />);
      } else {
        stars.push(<FaRegStar key={i} />);
      }
    }

    return stars;
  };

  return (
    <div className="product-page-wrapper">
      <NavBar cartCount={cartCount} />

      <div className="product-page-container">
        <div className="product-page-card">
          <div className="product-left">
            <div className="product-image-main">
              <img src={product.productImage} alt={product.name} />
              {product.discount?.value > 0 && (
                <div className="discount-badge updated-badge">
                  {product.discount.type === "Percentage"
                    ? `${product.discount.value}% OFF`
                    : `Rs . ${product.discount.value} OFF`}
                </div>
              )}
            </div>
          </div>

          <div className="product-right">
            <h2 className="product-title">{product.name}</h2>

            {reviewsData && (
              <div className="product-rating">
                ⭐ {reviewsData.averageRating?.toFixed(1)} / 5
                <span className="rating-count">
                  ({reviewsData.totalReviews} Reviews)
                </span>
              </div>
            )}

            {product.discount?.value > 0 ? (
              <div className="price-section2">
                <span className="final-price2">Rs . {product.finalPrice}</span>
                <span className="original-price2">Rs . {product.price}</span>
                <span className="discount-tag">
                  {product.discount.type === "Percentage"
                    ? `-${product.discount.value}%`
                    : `-Rs. ${product.discount.value}`}
                </span>
              </div>
            ) : (
              <span className="final-price2">Rs . {product.price}</span>
            )}

            <div className="product-actions">
              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                Add to Cart
              </button>

              <button
                className="buy-now-btn"
                onClick={BuyButton}
                disabled={isOutOfStock}
              >
                Buy Now
              </button>
            </div>

            <div className="product-description-section">
              <h4 className="description-title">Description</h4>
              <p className="product-description">{product.description}</p>
            </div>

            <button
              className="see-review-btn"
              onClick={() => {
                setShowReviewModal(true);
                fetchReviews();
              }}
            >
              ⭐ See Reviews
            </button>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="related-products-section">
          <h3 className="related-title">You May Also Like</h3>

          <div className="related-products-grid">
            {relatedProducts.map((item) => (
              <div
                key={item._id}
                className="related-product-card"
                onClick={() => navigate(`/product/${item._id}`)}
              >
                <img
                  src={item.productImage}
                  alt={item.name}
                  className="related-product-img"
                />
                <div className="related-product-info">
                  <p className="related-product-category">Electronics</p>
                  <p className="related-product-name">{item.name}</p>
                  <p className="related-product-price">
                    Rs. {item.finalPrice ?? item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="review-modal" onClick={() => setShowReviewModal(false)}>
          <div
            className="review-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Customer Reviews</h2>

            {reviewsData?.reviews ? (
              <>
                <div className="average-rating">
                  <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="stars">
                      {renderStars(reviewsData.averageRating || 0)}
                    </span>
                    {reviewsData.averageRating?.toFixed(1)} / 5
                  </h3>
                  <p>{reviewsData.totalReviews} Reviews</p>
                </div>

                {reviewsData.reviews?.length > 0 ? (
                  <div className="reviews-list">
                    {reviewsData.reviews.map((review) => (
                      <div key={review._id} className="single-review">
                        <div className="review-header">
                          <strong>{review.name}</strong>
                          <span className="stars">
                            {renderStars(review.rating || 0)}
                          </span>
                        </div>

                        <p className="review-comment">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No reviews and ratings yet</p>
                )}
              </>
            ) : (
              <p>No reviews and ratings yet</p>
            )}

            <div className="review-modal-buttons">
              <button
                className="submit-review-btn"
                onClick={() => setShowAddReviewModal(true)}
              >
                ➕ Add Review
              </button>

              <button
                className="close-review-btn"
                onClick={() => setShowReviewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddReviewModal && (
        <div
          className="review-modal"
          onClick={() => setShowAddReviewModal(false)}
        >
          <div
            className="review-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Add Your Review</h2>
            <div className="rating-input">
              `
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  className="star-wrapper"
                  onClick={(e) => {
                    const { left, width } = e.target.getBoundingClientRect();
                    const clickX = e.clientX - left;

                    if (clickX < width / 2) {
                      setNewRating(star - 0.5);
                    } else {
                      setNewRating(star);
                    }
                  }}
                >
                  {newRating >= star ? (
                    <FaStar />
                  ) : newRating >= star - 0.5 ? (
                    <FaStarHalfAlt />
                  ) : (
                    <FaRegStar />
                  )}
                </div>
              ))}
            </div>
            `
            <textarea
              placeholder="Write your review..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button
              className="submit-review-btn"
              onClick={async () => {
                await handleSubmitReview();

                // Close add review modal
                setShowAddReviewModal(false);

                // Refresh reviews
                fetchReviews();
              }}
            >
              Submit Review
            </button>
            <button
              className="close-review-btn"
              onClick={() => setShowAddReviewModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showAddressModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>Select Delivery Address</h2>

            {hasAddress ? (
              <GetAddress
                showRadio={true}
                selectedAddressId={selectedAddressId}
                onSelect={(id, addr) => {
                  setSelectedAddressId(id);
                  setSelectedAddress(addr);
                }}
                onSuccess={fetchAddresses}
                refetchAddresses={fetchAddresses}
              />
            ) : null}

            {showAddAddress ? (
              <AddAddress
                onClose={() => setShowAddAddress(false)}
                onSuccess={() => {
                  setShowAddAddress(false);
                  fetchAddresses();
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
                marginTop: 16,
              }}
            >
              <button
                className="btn-close"
                onClick={() => setShowAddressModal(false)}
              >
                CANCEL
              </button>
              <button
                className="btn-place-order"
                disabled={!selectedAddressId}
                onClick={handlePlaceOrderClick}
                style={{
                  opacity: !selectedAddressId ? 0.6 : 1,
                  cursor: !selectedAddressId ? "not-allowed" : "pointer",
                }}
              >
                CONTINUE
              </button>
            </div>
          </div>
        </div>
      )}

      {showOrderModal && selectedAddress && (
        <div className="order-modal">
          <div className="order-modal-content">
            <h2>Confirm Your Order</h2>

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

            <h3 style={{ marginTop: 16 }}>Order Details</h3>
            <div className="address-list">
              <div
                className="address-card"
                style={{ display: "flex", alignItems: "center", gap: 16 }}
              >
                <img
                  src={product.productImage}
                  alt={product.name}
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
                <div className="address-details">
                  <p className="mobile">{product.name}</p>
                  <p>Quantity: 1</p>
                  <p>Price: Rs . {product.finalPrice ?? product.price}</p>
                </div>
              </div>
            </div>

            <div className="price-summary" style={{ marginTop: 16 }}>
              <h3>Price Details</h3>
              <div className="price-row">
                <span>Total Amount</span>
                <span>Rs . {product.finalPrice ?? product.price}</span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 24,
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
