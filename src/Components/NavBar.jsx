import React from "react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HiShoppingCart, HiSearch , HiUser , HiShoppingBag} from "react-icons/hi";
import axiosInstance from "../Utils/axiosInstance";
import "../css/navbar.css";

export default function NavBar({ cartCount }) {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({categories: [],products: [],});
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const searchRef = useRef(null);
  const [userName, setUserName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

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
      const res = await axiosInstance.get("/api/auth/userDetails",{headers: { Authorization: `Bearer ${token}`,},},);
      console.log("response from UserDetails APi :-", res);

      if (res.data && res.data.data) {
        setUserName(res.data.data.fullName);
      }

    } catch (error) {
      console.log("Error fetching user details:", error);
      setUserName("");
    }
  };

  const fetchSearchResults = async (query) => {

    try {
      const res = await axiosInstance.get(`/api/search/searchBar?q=${query}`,);
      console.log("Search API response:", res);

      setSearchResults(res.data.data || { categories: [], products: [] });
      setShowDropdown(true);

    } catch (error) {
      console.log("Search error:", error);
      setSearchResults({ categories: [], products: [] });
      setShowDropdown(false);
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

    debounceRef.current = setTimeout(() => {
      fetchSearchResults(query);
    }, 400);
  };

  const hasResults =
    searchResults.categories.length > 0 || searchResults.products.length > 0;

  return (
    <nav className="navbar">
      <div
        className="nav-logo"
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
       Shopzo
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
                searchRef.current.getBoundingClientRect().left + window.scrollX,
              width: searchRef.current.offsetWidth,
            }}
          >
            {hasResults ? (
              <>
                {searchResults.categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="search-item category-suggestion"
                    onClick={async () => {
                      setSearchQuery(cat.name);
                      try {
                      
                        const res = await axiosInstance.get(`/api/search/searchBar?q=${cat.name}`,);
                        setSearchResults(
                          res.data.data || { categories: [], products: [] },
                        );
                        setShowDropdown(true);
                      } catch (error) {
                        console.log("Error fetching category products:", error);
                      }
                    }}
                  >
                    <HiSearch
                      className="suggestion-icon"
                      style={{ marginRight: "10px", color: "#878787" }}
                    />
                    <div className="search-name">
                      {cat.name}{" "}
                      <span style={{ color: "#2874f0", fontWeight: "500" }}>
                        Category
                      </span>
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
                        style={{
                          width: "32px",
                          height: "32px",
                          marginRight: "12px",
                          objectFit: "contain",
                        }}
                      />
                    )}
                    <div>
                      <div className="search-name">{item.name}</div>
                      <div style={{ fontSize: "12px", color: "#878787" }}>
                        in {item.categoryName}
                      </div>
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

      <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>

      <div className={`nav-buttons ${menuOpen ? "active" : ""}`}>
        {!isLoggedIn ? (
          <>
            <Link to="/auth" className="nav-btn login-btn">
              Login
            </Link>
            {/* <Link to="/register" className="nav-btn register-btn">
              Register
            </Link> */}
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

        <button
          className="nav-btn"
          onClick={() => navigate("/shop")}
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <HiShoppingBag /> Shop
        </button>

        <span
          className="nav-user-icon"
          style={{ marginLeft: "12px", fontWeight: "500", cursor: "pointer" , color : "black"}}
          onClick={() => navigate("/profile")}
        >
         <HiUser style={{ fontSize: "24px", color: "black" }} />
        </span>
      </div>
    </nav>
  );
}
