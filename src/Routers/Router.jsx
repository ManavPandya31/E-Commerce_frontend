import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthPage from "../pages/AuthPage";
import Layout from "../pages/Layout";
import HomePage from "../pages/HomePage";
import ProductDetails from "../pages/ProductDetails";
import CartPage from "../pages/CartPage";
import ProfileAndOtherPage from "../pages/ProfileAndOtherPage";
import ProfileInfo from "../pages/ProfileInfo";
import ManageAddresses from "../pages/ManageAddress";
import ResetPassword from "../pages/ResetPassword";
import ShopPage from "../pages/ShopPage";
import VerifyEmail from "../pages/VerifyEmail";
import Orders from "../Components/Orders";
import AboutPage from "../pages/AboutPage";
import ContactPage from "../pages/ContactPage";

const AppRouter = ({ cartItems, setCartItems, cartCount, setCartCount }) => {
  return (
    <Routes>
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/shop" element={<ShopPage cartCount={cartCount} />} />
      <Route path="/about" element={<AboutPage cartCount={cartCount} />} />
      <Route path="/contact" element={<ContactPage cartCount={cartCount} />} />

      <Route
        path="/"
        element={
          <HomePage
            cartCount={cartCount}
            setCartCount={setCartCount}
          />
        }
      />

      <Route element={<Layout />}>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />

        <Route
          path="/product/:id"
          element={
            <ProductDetails
              cartItems={cartItems}
              setCartItems={setCartItems}
              cartCount={cartCount}
              setCartCount={setCartCount}
            />
          }
        />

        <Route
          path="/cart"
          element={
            <CartPage
              cartItems={cartItems}
              setCartItems={setCartItems}
              cartCount={cartCount}
              setCartCount={setCartCount}
            />
          }
        />
      </Route>

      <Route
        path="/profile"
        element={
          <ProfileAndOtherPage
            cartCount={cartCount}
            setCartCount={setCartCount}
          />
        }
      >
        <Route index element={<ProfileInfo />} />
        <Route path="info" element={<ProfileInfo />} />
        <Route path="addresses" element={<ManageAddresses />} />
        <Route path="orders" element={<Orders />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
