import React from "react";
import { Routes, Route } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import Layout from "../pages/Layout";
import HomePage from "../pages/HomePage";
import ProductDetails from "../pages/ProductDetails";
import CartPage from "../pages/CartPage";
import ProfileAndOtherPage from "../pages/ProfileAndOtherPage";
import ProfileInfo from "../pages/ProfileInfo";
import ManageAddresses from "../pages/ManageAddress";
import ResetPassword from "../pages/ResetPassword";
// import CheckOutPage from "../pages/CheckOutPage";
import VerifyEmail from "../pages/VerifyEmail";
import Orders from "../Components/Orders";  

const AppRouter = ({ cartItems, setCartItems, cartCount, setCartCount }) => {
  return (
  <>
    <Routes>
       <Route path="/reset-password/:token" element={<ResetPassword />} />
       <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route
        path="/"
        element={<HomePage cartCount={cartCount} setCartCount={setCartCount} />}
      />

      <Route element={<Layout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

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

      {/* <Route path="/checkout/:id" element={<CheckOutPage />} />
      <Route path="/checkout" element={
            <CheckOutPage
              cartItems={cartItems}
              setCartItems={setCartItems}
              cartCount={cartCount}
              setCartCount={setCartCount}
            />
          }
        /> */}
          <Route path="/profile" element={
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
    </>
  );
};

export default AppRouter;
