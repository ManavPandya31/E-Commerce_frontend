import React from "react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HiShoppingCart, HiSearch } from "react-icons/hi";
import axios from "axios";
import "../css/navbar.css";

export default function NavBar({ cartCount }) {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ categories: [], products: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const searchRef = useRef(null);
  const [userName, setUserName] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
     if (token) {
    fetchUserDetails(token); 
  } else {
    setUserName(""); 
  }
  }, [location]);

  const btnLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

    const fetchUserDetails = async (token) => {
    try {
      const res = await axios.get("http://localhost:3131/api/auth/userDetails", {
        headers: {
          Authorization: `Bearer ${token}`,
        },});
        console.log("response from UserDetails APi :-",res);
        

      if (res.data && res.data.data) {
        setUserName(res.data.data.fullName); 
      }
    } catch (error) {
      console.log("Error fetching user details:", error);
      setUserName("");
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setSearchResults({ categories: [], products: [] });
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`http://localhost:3131/api/search/searchBar?q=${query}`);
        console.log("Response From Searchbar :- ", res);

        setSearchResults(res.data.data || { categories: [], products: [] });
        setShowDropdown(true);

      } catch (error) {
        console.log("Search error:", error);
        setSearchResults({ categories: [], products: [] });
        setShowDropdown(false);
      }
    }, 400);
  };

  const hasResults = searchResults.categories.length > 0 || searchResults.products.length > 0;

  return (
    <nav className="navbar">
      <div
        className="nav-logo"
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        My Flipcart
      </div>

      <div className="nav-search" ref={searchRef}>
        <input
          type="text"
          placeholder="Search for products"
          value={searchQuery}
          onChange={handleSearch}
          onFocus={() => hasResults && setShowDropdown(true)}
        />
        <HiSearch className="search-icon" />

        {showDropdown && searchRef.current && (
          <div
            className="search-dropdown"
            style={{
              top:
                searchRef.current.getBoundingClientRect().bottom +
                window.scrollY +
                6,
              left:
                searchRef.current.getBoundingClientRect().left +
                window.scrollX,
              width: searchRef.current.offsetWidth,
            }}
          >
            {hasResults ? (
              <>
                {searchResults.categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="search-item category-suggestion"
                    onClick={() => {
                    setSearchQuery(cat.name);
                    setShowDropdown(false);
                }}
                  >
                    <HiSearch className="suggestion-icon" style={{ marginRight: "10px", color: "#878787" }} />
                    <div className="search-name">
                      {searchQuery} <span style={{ color: "#2874f0", fontWeight: "500" }}>in {cat.name}</span>
                    </div>
                  </div>
                ))}

                {searchResults.products.map((item) => (
                  <div
                    key={item._id}
                    className="search-item product-suggestion"
                    style={{ display: "flex", alignItems: "center" }}
                    onClick={() => {
                      navigate(`/product/${item._id}`);
                      setSearchQuery("");
                      setSearchResults({ categories: [], products: [] });
                      setShowDropdown(false);
                    }}
                  >
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt="" 
                        style={{ width: "32px", height: "32px", marginRight: "12px", objectFit: "contain" }} 
                      />
                    )}
                    <div>
                      <div className="search-name">{item.name}</div>
                      <div style={{ fontSize: "12px", color: "#878787" }}>in {item.categoryName}</div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="search-item no-result">No products found</div>
            )}
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

        <span className="nav-user-name"
          style={{ marginLeft: "12px", fontWeight: "500", cursor: "pointer" }}
          onClick={() => navigate("/profile")}
        >
          {userName || "Account"}
        </span>

      </div>
    </nav>  
  );
}