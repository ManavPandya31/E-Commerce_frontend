import React from "react";
import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "../Slices/loaderSlice";
import { toast } from "react-toastify";
import "../css/wishlist.css"

export default function Wishlist() {

  const [wishlist, setWishlist] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      dispatch(showLoader());

      const token = localStorage.getItem("token");

      const res = await axiosInstance.get("/api/wishlists/getUsersWishLists", {headers: { Authorization: `Bearer ${token}` },});
      console.log("Response From User WishLists Api :-", res);

      setWishlist(res.data.data);

    } catch (error) {
      console.log("Error fetching wishlist:", error);
      
    } finally {
      dispatch(hideLoader());
    }
  };

  const handleRemove = async (productId) => {
  try {
    dispatch(showLoader());
    const token = localStorage.getItem("token");

    const res = await axiosInstance.delete(`/api/wishlists/removeFromWishLists/${productId}`,{headers: { Authorization: `Bearer ${token}` },});
    console.log("Response From Remove Wishlists Api :-",res);
    
    setWishlist((prev) =>
      prev.filter((item) => item._id !== productId)
    );

    toast.success("Removed from wishlist");

  } catch (error) {
    console.log("Remove error:", error);
    toast.error("Failed to remove");
    
  } finally{
    dispatch(hideLoader())
  }
  };

  return (
    <div className="wishlist-container">
      <h2 className="wishlist-title">My Wishlist ❤️</h2>

      {wishlist.length === 0 ? (
        <div className="wishlist-empty">
          <p>No products in wishlist.</p>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((item) => (
        <div key={item._id} className="wishlist-card">

          <div className="wishlist-remove"
            onClick={() => handleRemove(item._id)}
          >
            ❌
          </div>

          <img
            src={item.productImage}
            alt={item.name}
            className="wishlist-image"
          />

          <div className="wishlist-info">
            <h4>{item.name}</h4>
            <p className="wishlist-price">
              Rs. {item.finalPrice || item.price}
            </p>
          </div>

        </div>
          ))}
        </div>
      )}
    </div>
  );
}
