import React from "react";
import NavBar from "../Components/NavBar";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import "../css/home.css";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3131/api/products/showAllProducts",
      );
      console.log("Response From Fetch Products API :-", response);

      setProducts(response.data.data.products);
      setLoading(false);
    } catch (error) {
      console.log("Error While Fetch The Products..", error);
    }
  };

  // useEffect(() => {
  //   fetchProducts();
  // }, []);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:3131/api/products/getCategory");
      console.log("Category API Response:", response);

      setCategories(response.data.data);
      
    } catch (error) {
      console.log("Error while fetching categories", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

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
          <div className="slider-container" key={categories.length}>
            <Slider {...sliderSettings}>
              {categories.map((cat) => (
                <div key={cat._id}>
                  <div className="category-pill">{cat.name}</div>
                </div>
              ))}
            </Slider>
          </div>
        )}
      </section>

      <section className="products-section">
        {loading && <p className="status-text">Loading products...</p>}
        {error && <p className="status-text error">{error}</p>}

        <div className="product-grid">
          {products.map((product) => (
            <div
              className="product-card"
              key={product._id}
              onClick={() => handleProductClick(product._id)}
              style={{ cursor: "pointer" }}
            >
              <div className="product-image">
                <img src={product.productImage} alt={product.name} />
              </div>

              <div className="product-info">
                <h3>{product.name}</h3>
                {/* <p className="description">{product.description}</p> */}

                <div className="card-footer">
                  <span className="price">Rs. {product.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
