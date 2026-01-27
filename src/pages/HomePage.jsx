import React from "react";
import { useEffect, useState } from "react";
import NavBar from "../Components/NavBar";
import axios from "axios";
import { showLoader, hideLoader } from "../Slices/loaderSlice.js";
import { useDispatch } from "react-redux"; 
import { useNavigate } from "react-router-dom";
import "../css/home.css";

export default function HomePage({cartCount}) {

  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryPage, setCategoryPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const productsPerPage = 5; 
  const categoriesPerPage = 7;

  const navigate = useNavigate();
  const dispatch = useDispatch(); 

  const fetchProducts = async (categoryId = "", page = 1) => {
    try {
      dispatch(showLoader()); 

      const response = await axios.get("http://localhost:3131/api/products/showAllProducts",
      { params: {categoryId,page,limit: productsPerPage,}});

      console.log("Response From Show All Products:-", response);

      const newProducts = response.data.data.products;

      setProducts(prevProducts => page === 1 ? newProducts : [...prevProducts, ...newProducts]);
      setProductPage(response.data.data.pageData.currentPage);
      setProductTotalPages(response.data.data.pageData.totalPages);

    } catch (err) {
      console.log("Error While Fetching Products", err);
      setError("Failed to load products.");

    } finally {
      dispatch(hideLoader()); 
    }
  };

  const fetchCategories = async (page = 1) => {
    try {
      const response = await axios.get("http://localhost:3131/api/products/getCategory", {
        params: { page, limit: categoriesPerPage }
      });
      console.log("Response From Get Category API :-", response);

      setCategories(response.data.data.categories);
      setCategoryPage(response.data.data.pageData.currentPage);
      setTotalPages(response.data.data.pageData.totalPages);
      
    } catch (err) {
      console.log("Error while fetching categories", err);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= documentHeight - 100) {
        if (productPage < productTotalPages) {
          fetchProducts(selectedCategory, productPage + 1);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [productPage, productTotalPages, selectedCategory]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId) => {
      setSelectedCategory(categoryId);
      setProducts([]);
      setProductPage(1);
      fetchProducts(categoryId, 1);
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setProducts([]);
    setProductPage(1);
    fetchProducts("", 1);
  };

  const handleMore = () => {
    if (categoryPage < totalPages) {
      fetchCategories(categoryPage + 1);
    }
  };

  const handlePrevious = () => {
    if (categoryPage > 1) {
      fetchCategories(categoryPage - 1);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const redirectAddToCart = (productId)=>{
    navigate(`/product/${productId}`);
  }

  return (
    <>
    <NavBar cartCount={cartCount} />

      <section className="hero">
        {categories.length === 0 ? (
          <p>Loading categories...</p>
        ) : (
          <div className="categories-wrapper-horizontal">
            <button
              className="more-button"
              onClick={handlePrevious}
              disabled={categoryPage === 1}
            >
              Previous
            </button>

            <div className="categories-horizontal">
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className={`category-pill ${selectedCategory === cat._id ? "active" : ""}`}
                  onClick={() => handleCategoryClick(cat._id)}
                >
                  {cat.name}
                </div>
              ))}
            </div>

            <button
              className="more-button"
              onClick={handleMore}
              disabled={categoryPage >= totalPages}
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
