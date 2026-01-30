import React from "react";
import { useEffect, useState } from "react";
import { useParams , useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "../Slices/loaderSlice";
import NavBar from "../Components/NavBar";
import "../css/productdetails.css";

export default function ProductDetails({ cartItems, setCartItems, setCartCount , cartCount }) {

  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  //const [loading, setLoading] = useState(true);

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
        //setLoading(false);
        dispatch(hideLoader());
      }
    };
    fetchProduct();
  }, [id]);

  const btnAddToCart = async () => {

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
    
  }finally{
    dispatch(hideLoader());
  }
}

  const BuyButton = () => {
    
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first to continue");
    navigate("/login");
    return;
  }

  navigate(`/checkout/${id}`);
};


  //if (loading) return <p className="product-loading">Loading product...</p>
  if (!product) return <p className="product-not-found">Product not found</p>

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
              <button className="add-to-cart-btn" onClick={btnAddToCart}>Add to Cart</button>
              <button className="buy-now-btn" onClick={BuyButton}>Buy Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
