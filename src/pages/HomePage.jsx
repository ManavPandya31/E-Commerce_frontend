import React from "react";
import NavBar from "../Components/NavBar";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/home.css";

export default function HomePage() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:3131/api/products/showAllProducts");
      console.log("Response From Fetch Products API :-", response);

      setProducts(response.data.data.products);
      setLoading(false);
      
    } catch (error) {
        console.log("Error While Fetch The Products..", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const ClickAddToCart = (productId) => {
    navigate(`/product/${productId}`);
};

  return (
    <>
      <NavBar />
      <section className="hero">
        <h1>All Products</h1>
        <p>Do Shoping</p>
      </section>

      <section className="products-section">
        {loading && <p className="status-text">Loading products...</p>}
        {error && <p className="status-text error">{error}</p>}

        <div className="product-grid">
          {products.map((product) => (
            <div className="product-card" key={product._id}>
              <div className="product-image">
                <img src={product.productImage} alt={product.name} />
              </div>

              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="description">
                  {product.description}
                </p>
                <div className="card-footer">
                  <span className="price">Rs.{product.price}</span>
                  <button className="btn" onClick={() => ClickAddToCart(product._id)}>
                      Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
