import React from "react";
import { useEffect, useState } from "react";
import NavBar from "../Components/NavBar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import "../css/home.css";

export default function HomePage() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const navigate = useNavigate();

  const fetchProducts = async (categoryId = "") => {
    try {
      setLoading(true);

      const response = await axios.get("http://localhost:3131/api/products/showAllProducts",
        {
          params: categoryId ? { categoryId } : {},
        }
      );

      setProducts(response.data.data.products);
      setLoading(false);

    } catch (err) {
      console.log("Error While Fetching Products", err);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:3131/api/products/getCategory");
      setCategories(response.data.data);

    } catch (err) {
      console.log("Error while fetching categories", err);
    }
  };
    useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    fetchProducts(categoryId);
  };

  const handleReset = () => {
    setSelectedCategory(null);
    fetchProducts();
  };

  const handleProductClick = (productId) => {

    navigate(`/product/${productId}`);
  };

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 10000,
    slidesToShow: 7,
    slidesToScroll: 3,
    autoplay: true,
    autoplaySpeed: 1000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 5, slidesToScroll: 5 } },
      { breakpoint: 768, settings: { slidesToShow: 3, slidesToScroll: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2, slidesToScroll: 2 } },
    ],
  };

return (
  <>
    <NavBar />
    <section className="hero">
      {categories.length === 0 ? (
        <p>Loading categories...</p>
      ) : (
        <div className="slider-container">
          <Slider {...sliderSettings}>
            {categories.map((cat) => (
              <div key={cat._id}>
                <div
                  className={`category-pill ${
                    selectedCategory === cat._id ? "active" : ""
                  }`}
                  onClick={() => handleCategoryClick(cat._id)}
                  style={{ cursor: "pointer" }}
                >
                  {cat.name}
                </div>
              </div>
            ))}
          </Slider>

          <button className="reset-button" onClick={handleReset}>View All Category</button>
        </div>
      )}
    </section>

    <section className="products-section">
      {loading && <p className="status-text">Loading products...</p>}
      {error && <p className="status-text error">{error}</p>}

      {!loading && products.length === 0 ? (
        <p className="status-text">
          This Category Products Are Available Soon ! 
        </p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div
              className="product-card"
              key={product._id}
              onClick={() => handleProductClick(product._id)}
            >
              <div className="product-image">
                <img src={product.productImage} alt={product.name} />
              </div>

              <div className="product-info">
                <h3>{product.name}</h3>
                <span className="price">Rs. {product.price}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  </>
);
}
