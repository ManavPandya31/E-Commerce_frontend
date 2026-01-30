import React from "react";
import { useEffect, useState } from "react";
import { useParams , useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "../Slices/loaderSlice";
import NavBar from "../Components/NavBar";
import GetAddress from "../Components/GetAddress";
import AddAddress from "../Components/AddAddress";
import "../css/productdetails.css";

export default function ProductDetails({ cartItems, setCartItems, setCartCount , cartCount }) {

  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {

    const fetchProduct = async () => {

      try {

        dispatch(showLoader());
        const response = await axios.get(`http://localhost:3131/api/products/findSingleProduct/${id}`);
        console.log("Response From Single Product Fetch API :-",response);

        setProduct(response.data.data);

      } catch (error) {
        console.log("Error fetching product:", error);

      } finally {
        dispatch(hideLoader());
      }
    };
    fetchProduct();
  }, [id]);

  const isOutOfStock = product?.stock === 0;

  const btnAddToCart = async () => {

    if (isOutOfStock) {
      alert("Product is out of stock");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first to continue");
      navigate("/login");
      return;
    }

    if (!product || !product._id) {
      alert("Product information is missing.");
      console.error("Missing product:", product);
      return;
    }

    try {
      dispatch(showLoader());
      const response = await axios.post("http://localhost:3131/api/cart/addCartItems",
        {
          productId: product._id,
          quantity: 1
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("Add To Cart API Response:", response.data);

      setCartCount(prev => prev + 1);
      setCartItems(prev => [...prev, { ...product, quantity: 1 }]);
      navigate("/cart");

    } catch (error) {
      console.log("Error:-",error);
      
    } finally {
      dispatch(hideLoader());
    }
  };

  const BuyButton = () => {

    if (isOutOfStock) {
      alert("Product is out of stock");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first to continue");
      navigate("/login");
      return;
    }

    setShowAddressModal(true);
  };

  const handleAddressSelect = (id) => {
    
    setSelectedAddressId(id);
    setShowAddressModal(false);
    navigate(`/checkout/${product._id}`, { state: { addressId: id } });
  };

  if (!product) return <p className="product-not-found">Product not found</p>;

  return (
    <div>
      <NavBar cartCount={cartCount} />
      <div className="product-page-container">
        <div className="product-page-card">
          <div className="product-left">
            <div className="product-image-main">
              <img src={product.productImage} alt={product.name} />
            </div>
          </div>

          <div className="product-right">
            <h2 className="product-title">{product.name}</h2>

            {product.discount && product.discount.value > 0 ? (
              <div className="price-section2">
                <span className="original-price2">Rs. {product.price}</span>
                <span className="final-price2">Rs. {product.finalPrice}</span>
              </div>
            ) : (
              <span className="price2">Rs. {product.price}</span>
            )}

            <p className="product-description">{product.description}</p>
            <p className="product-stock">Stock Available :- {product.stock}</p>

            <div className="product-actions">
              <button
                className="add-to-cart-btn"
                onClick={btnAddToCart}
                disabled={isOutOfStock}
                style={{ opacity: isOutOfStock ? 0.5 : 1, cursor: isOutOfStock ? "not-allowed" : "pointer" }}
              >
                Add to Cart
              </button>

              <button
                className="buy-now-btn"
                onClick={BuyButton}
                disabled={isOutOfStock}
                style={{ opacity: isOutOfStock ? 0.5 : 1, cursor: isOutOfStock ? "not-allowed" : "pointer" }}
              >
                Buy Now
              </button>
            </div>

            {isOutOfStock && (
              <p style={{ color: "red", marginTop: "10px", fontWeight: "600" }}>
                Out of Stock
              </p>
            )}
          </div>
        </div>
      </div>

      {showAddressModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>Select Delivery Address</h2>

            {!selectedAddressId ? (
              <>
                <GetAddress
                  showRadio={true}
                  onSelect={handleAddressSelect}
                  onSuccess={() => {}}
                />
                <button
                  className="btn-add-address"
                  onClick={() => setSelectedAddressId("add_new")}
                >
                  Add New Address
                </button>
              </>
            ) : selectedAddressId === "add_new" ? (
              <AddAddress
                onClose={() => setSelectedAddressId(null)}
                onSuccess={() => setSelectedAddressId(null)}
              />
            ) : null}

            <button
              className="btn-close"
              onClick={() => setShowAddressModal(false)}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
