import React from "react";
import { useEffect, useState , useRef} from "react";
import NavBar from "../Components/NavBar";
import axios from "axios";
// import { showLoader, hideLoader } from "../Slices/loaderSlice.js";
// import { useDispatch } from "react-redux"; 
import { useNavigate } from "react-router-dom";
import "../css/home.css";
import heroImage from "../assets/homepage.png";

export default function HomePage({cartCount}) {

  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryPage, setCategoryPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const productsPerPage = 4; 
  const categoriesPerPage = 9;

  const categorySectionRef = useRef(null);
  const initialFetchDone = useRef(false);
  const navigate = useNavigate();
  // const dispatch = useDispatch();

  const scrollToCategories = () => {
    categorySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchProducts = async (categoryId = "", page = 1) => {
 
   if (isFetching) return;

  try {
    
    setIsFetching(true);

    const response = await axios.get("http://localhost:3131/api/products/showAllProducts",
      {
        params: {categoryId, page, limit: productsPerPage,},
      }
    );

    console.log("Show All Products Api Response :-",response)

    const newProducts = response.data.data.products;

    setProducts(prev =>
      page === 1 ? newProducts : [...prev, ...newProducts]
    );

    setProductPage(response.data.data.pageData.currentPage);
    setProductTotalPages(response.data.data.pageData.totalPages);

  } catch (err) {
    console.log("Error While Fetching Products", err);
    setError("Failed to load products.");

  } finally {
    setIsFetching(false);
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

  if (initialFetchDone.current) return;
  initialFetchDone.current = true;

    fetchProducts();
    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId) => {
    navigate(`/shop?category=${categoryId}`);
  };

  const handleReset = () => {
    navigate("/shop");
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

    <section className="lux-hero">
      <div className="lux-hero-content">
        <span className="lux-badge">New Collection 2026</span>
        <h1>
          Elevate Your <span>Everyday</span> Style
        </h1>
        <p>
          Discover curated pieces that blend timeless design with modern comfort.
          Premium quality, thoughtfully priced.
        </p>
        <div className="lux-hero-buttons">
          <button className="lux-primary-btn" onClick={scrollToCategories}>Shop Now</button>
        </div>
      </div>

      <div className="lux-hero-image">
        <img
          src={heroImage}
          alt="Hero"
        />
        <div className="lux-sale-card">
          <h3>50%</h3>
          <span>Up to off on select styles</span>
        </div>
      </div>
    </section>

    <section className="lux-top-features">
  <div className="lux-feature-item">
    <div className="lux-feature-icon">🚚</div>
    <div>
      <h4>Free Shipping</h4>
      <p>On orders over $50</p>
    </div>
  </div>

  <div className="lux-feature-item">
    <div className="lux-feature-icon">🛡️</div>
    <div>
      <h4>Secure Payment</h4>
      <p>100% protected</p>
    </div>
  </div>

  <div className="lux-feature-item">
    <div className="lux-feature-icon">↩️</div>
    <div>
      <h4>Easy Returns</h4>
      <p>30-day return policy</p>
    </div>
  </div>
</section>

    <section className="lux-category-section" ref={categorySectionRef}>
      <div className="lux-section-header">
        <div>
          <h2>Shop by Category</h2>
          <p>Browse our curated collections</p>
        </div>

        <div className="lux-category-pagination">
          <button
            onClick={handlePrevious}
            disabled={categoryPage === 1}
          >
            Previous
          </button>

          <button
            onClick={handleMore}
            disabled={categoryPage >= totalPages}
          >
            More
          </button>
        </div>
      </div>

      <div className="lux-category-grid">
  <div
    className={`lux-category-card ${
      selectedCategory === null ? "active" : ""
    }`}
    onClick={handleReset}
  >
    <h4>View All</h4>
  </div>

  {categories.map((cat) => (
    <div
      key={cat._id}
      className={`lux-category-card ${
        selectedCategory === cat._id ? "active" : ""
      }`}
      onClick={() => handleCategoryClick(cat._id)}
    >
      <h4>{cat.name}</h4>
    </div>
  ))}
      </div>
        
      {selectedCategory && (
        <button
          className="lux-view-all-btn"
          onClick={handleReset}
        >
          {/* View all */}
        </button>
      )}
    </section>

    <section className="lux-products-section">
      <div className="lux-section-header">
        <div>
          <h2>Featured Products</h2>
          <p>Handpicked for you</p>
        </div>

     <div>
  <button
    className="lux-view-all-arrow"
    onClick={() => navigate("/shop")}
  >
    View All →
  </button>
    </div>

      </div>

      <div className="product-grid">
        {products.slice(0, 4).map((product) => (
          <div className="product-card" key={product._id}>
            <div
              className="product-image"
              onClick={() => handleProductClick(product._id)}
            >
              <img src={product.productImage} alt={product.name} />

              {product.discount && product.discount.value > 0 && (
                <div className="discount-badge">
                  {product.discount.type === "Percentage"
                    ? `${product.discount.value}% OFF`
                    : `Rs. ${product.discount.value} OFF`}
                </div>
              )}
            </div>

            <div className="product-info">
              <h3>{product.name}</h3>

              {product.discount && product.discount.value > 0 ? (
                <div className="price-section">
                  <span className="final-price">Rs. {product.finalPrice}</span>
                  <span className="original-price">Rs. {product.price}</span>
                </div>
              ) : (
                <span className="price">Rs. {product.price}</span>
              )}
            </div>
          </div>
        ))}
        {/* {isFetching && products.length > 0 && (
          <div className="loader-span-row">
            <div className="spinner"></div>
          </div>
        )} */}
      </div>
    </section>

    <section className="lux-promo-banner">
  <div className="lux-promo-overlay">
    <h2>Summer Sale</h2>
    <p>Up to 50% off on trending styles</p>
    <button className="lux-promo-btn">
      Shop the Sale →
    </button>
  </div>
</section>
  </>
  );
}
