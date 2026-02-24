import React from "react";
import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { showLoader, hideLoader } from "../Slices/loaderSlice";
import NavBar from "../Components/NavBar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import "../css/shop.css";

export default function ShopPage({ cartCount }) {

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.loader.isLoading);
  const [wishlistIds, setWishlistIds] = useState([]);

  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/api/products/getCategory",{params: {page: 1,limit: 1000,},},);
      console.log("Response From Get Category Api :-",res);

      setCategories(res.data.data.categories);

    } catch (error) {
      console.log("Error fetching categories:", error);
    }
  };

  const fetchProducts = async (categoryId = "") => {
    
    try {
      dispatch(showLoader());

      const res = await axiosInstance.get("/api/products/showAllProducts",{ params: { categoryId } },);
      console.log("Response From Show All Products Api :-",res);
    
      setProducts(res.data.data.products);

    } catch (error) {
      console.log("Error fetching products:", error);
      setProducts([]);

    } finally {
      dispatch(hideLoader());
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchWishlist();
  }, []);

  const handleCategoryClick = (id) => {
    setSelectedCategory(id);
    fetchProducts(id);
  };

  const handleWishlist = async (e, productId) => {
  e.stopPropagation();

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      return;
    }

    const isAlreadyInWishlist = wishlistIds.includes(productId);

    if (isAlreadyInWishlist) {
    
      const res = await axiosInstance.delete(`/api/wishlists/removeFromWishLists/${productId}`,{ headers: { Authorization: `Bearer ${token}` } });
      console.log("Response From Remove Wishlists Api :-",res);
      
      setWishlistIds((prev) =>
        prev.filter((id) => id !== productId)
      );

      toast.success("Removed from wishlist");

    } else {
    
      const response = await axiosInstance.post(`/api/wishlists/addWishLists/${productId}`,{},{ headers: { Authorization: `Bearer ${token}` } });
      console.log("Response From Added Wishlists Api :-",response);

      setWishlistIds((prev) => [...prev, productId]);

      toast.success("Added to wishlist");
    }

  } catch (error) {
    console.log("Wishlist error:", error);
    toast.error("Something went wrong");
  }
  };  

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axiosInstance.get("/api/wishlists/getUsersWishLists",{ headers: { Authorization: `Bearer ${token}` } });
      console.log("Wishlist API Response:", res);

      const wishlists = res.data?.data || [];

      const ids = wishlists.map((item) => item._id.toString());

      setWishlistIds(ids);

    } catch (error) {
      console.log("Error fetching wishlist:", error);
    }
  };

  return (
    <>
      <NavBar cartCount={cartCount} />

      <section className="shop-container">
        <aside className="shop-sidebar">
          <h3>Categories</h3>

          <div
            className={`shop-category ${
              selectedCategory === null ? "active" : ""
            }`}
            onClick={() => {
              setSelectedCategory(null);
              fetchProducts();
            }}
          >
            All Products
          </div>

          {categories.map((cat) => (
            <div
              key={cat._id}
              className={`shop-category ${
                selectedCategory === cat._id ? "active" : ""
              }`}
              onClick={() => handleCategoryClick(cat._id)}
            >
              {cat.name}
            </div>
          ))}
        </aside>

        <main className="shop-products">
          <h2>Shop Products</h2>

          {isLoading ? (
            <div className="shop-loader">
              {/* <div className="spinner"></div> */}
            </div>
          ) : products.length === 0 ? (
            <div className="no-products-message">
              {selectedCategory
                ? "No products available for this category."
                : "No products available."}
            </div>
          ) : (
            <div className="shop-product-grid">
              {products.map((product) => (
            <div
              key={product._id}
              className="shop-product-card"
              onClick={() => navigate(`/product/${product._id}`)}
            >
             <div className="wishlist-heart"
                onClick={(e) => handleWishlist(e, product._id)}
              >
                {wishlistIds.includes(product._id) ? (
                  <FaHeart className="heart-filled" />
                ) : (
                  <FaRegHeart className="heart-outline" />
                )}
              </div>

              <img src={product.productImage} alt={product.name} />
              <h4>{product.name}</h4>
              <p>Rs. {product.finalPrice || product.price}</p>
            </div>
              ))}
            </div>
          )}
        </main>
      </section>
    </>
  );
}
