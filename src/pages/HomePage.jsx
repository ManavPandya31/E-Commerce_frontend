import React, { useEffect, useState } from "react";
import NavBar from "../Components/NavBar";
import axios from "axios";
import { showLoader, hideLoader } from "../Slices/loaderSlice.js";
import { useDispatch } from "react-redux"; 
import { useNavigate } from "react-router-dom";
import "../css/home.css";

export default function HomePage() {

  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryPage, setCategoryPage] = useState(0);
  const categoriesPerPage = 10;

  const navigate = useNavigate();
  const dispatch = useDispatch(); 

  const fetchProducts = async (categoryId = "") => {
    try {
      dispatch(showLoader()); 

      const response = await axios.get("http://localhost:3131/api/products/showAllProducts",
        { params: categoryId ? { categoryId } : {} }
      );

      console.log("Response From Show All Products:-", response);
      setProducts(response.data.data.products);

    } catch (err) {
      console.log("Error While Fetching Products", err);
      setError("Failed to load products.");

    } finally {
      dispatch(hideLoader()); 
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:3131/api/products/getCategory");
      console.log("Response From Get Category API :-", response);

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
    setCategoryPage(0);
  };

  const handleMore = () => {
    if ((categoryPage + 1) * categoriesPerPage < categories.length) {
      setCategoryPage(categoryPage + 1);
    }
  };

  const handlePrevious = () => {
    if (categoryPage > 0) {
      setCategoryPage(categoryPage - 1);
    }
  };

  const displayedCategories = categories.slice(
    categoryPage * categoriesPerPage,
    (categoryPage + 1) * categoriesPerPage
  );

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const redirectAddToCart = (productId)=>{
   navigate(`/product/${productId}`);
  }

   return (
    <>
      <NavBar />

      <section className="hero">
        {categories.length === 0 ? (
          <p>Loading categories...</p>
        ) : (
          <div className="categories-wrapper-horizontal">
            <button
              className="more-button"
              onClick={handlePrevious}
              disabled={categoryPage === 0}
            >
              Previous
            </button>

            <div className="categories-horizontal">
              {displayedCategories.map((cat) => (
                <div
                  key={cat._id}
                  className={`category-pill ${
                    selectedCategory === cat._id ? "active" : ""
                  }`}
                  onClick={() => handleCategoryClick(cat._id)}
                >
                  {cat.name}
                </div>
              ))}
            </div>

            <button
              className="more-button"
              onClick={handleMore}
              disabled={
                (categoryPage + 1) * categoriesPerPage >= categories.length
              }
            >
              More
            </button>

            <button className="reset-button" onClick={handleReset}>
              View All Category Products
            </button>
          </div>
        )}
      </section>

      <section className="products-section">
        {error && <p className="status-text error">{error}</p>}

        {products.length === 0 && !error ? (
          <p className="status-text">
            This Category Products Are Available Soon!
          </p>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <div className="product-card" key={product._id}>
                {/* <span className="badge">New Arrival</span>
                <span className="wishlist">♡</span> */}

                <div
                  className="product-image"
                  onClick={() => handleProductClick(product._id)}
                >
                  <img src={product.productImage} alt={product.name} />
                </div>

                <div className="product-info">
                  <h3>{product.name}</h3>
                  <span className="price">Rs. {product.price}</span>
                </div>

                <div className="card-footer">
                  <button
                    className="product-addToCart"
                     onClick={() => redirectAddToCart(product._id)}
                  >
                    Add To Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
