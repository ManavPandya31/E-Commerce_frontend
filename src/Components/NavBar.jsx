import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HiShoppingCart, HiSearch } from "react-icons/hi";
import axios from "axios";
import "../css/navbar.css";

export default function NavBar({ cartCount }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);

  const btnLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:3131/api/search/searchBar?q=${query}`,
      );
      console.log("Response From Searchbar Api:-", res);

      setSearchResults(res.data.data);
      setShowDropdown(true);
    } catch (error) {
      console.log("Search error:", error);
    }
  };

  const getItemType = (item) => {
    if (item.name) return "product";
    if (item.category) return "category";
    if (item.price) return "price";

    return "unknown";
  };

  return (
    <nav className="navbar">
      <div
        className="nav-logo"
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        My Flipcart
      </div>

      <div className="nav-search">
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearch}
          onFocus={() => searchResults.length && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        />
        <HiSearch className="search-icon" />
        {showDropdown && searchResults.length > 0 && (
          <div className="search-dropdown">
            {searchResults.map((item) => {
              const type = getItemType(item);
              return (
                <div
                  key={item._id} 
                  className="search-item"
                  onClick={() => {
                    if (type === "product") navigate(`/product/${item._id}`);
                    else if (type === "category")
                      navigate(`/category/${item._id}`);
                    else if (type === "price") {
                    }
                    setSearchQuery("");
                    setShowDropdown(false);
                  }}
                >
                  {type === "product" && item.name}
                  {type === "category" && `Category: ${item.category}`}
                  {type === "price" &&
                    `Price: ${item.price.min} - ${item.price.max}`}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="nav-buttons">
        {!isLoggedIn ? (
          <>
            <Link to="/login" className="nav-btn login-btn">
              Login
            </Link>
            <Link to="/register" className="nav-btn register-btn">
              Register
            </Link>
          </>
        ) : (
          <button onClick={btnLogout} className="nav-btn logout-btn">
            Logout
          </button>
        )}
        <button className="nav-btn cart-btn" onClick={() => navigate("/cart")}>
          <HiShoppingCart style={{ marginRight: "8px" }} />
          Cart ({cartCount})
        </button>
      </div>
    </nav>
  );
}
