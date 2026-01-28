import React from 'react'
import RegisterPage from '../pages/RegisterPage';
import LoginPage from '../pages/LoginPage';
import Layout from "../pages/Layout";
import HomePage from "../pages/HomePage";
import ProductDetails from "../pages/ProductDetails";
import CartPage from '../pages/CartPage';
import ProfileAndOtherPage from '../pages/ProfileAndOtherPage';
import ProfileInfo from '../pages/ProfileInfo';
import ManageAddresses from '../pages/ManageAddress';
import { BrowserRouter as Router , Routes , Route } from "react-router-dom";

const AppRouter = ({ cartItems, setCartItems, cartCount, setCartCount }) => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage cartCount={cartCount} setCartCount={setCartCount} />} />
          <Route element={<Layout/>}>
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/register" element={<RegisterPage/>} />
           <Route path="/product/:id"element={<ProductDetails 
                cartItems={cartItems} 
                setCartItems={setCartItems}
                cartCount={cartCount} setCartCount={setCartCount}  
              />
            } 
          />
           <Route path="/cart"  element={<CartPage 
                cartItems={cartItems} 
                setCartItems={setCartItems} 
                cartCount={cartCount} 
                setCartCount={setCartCount} 
              />
            } 
          />
        </Route>
        <Route path="/profile" element={<ProfileAndOtherPage/>}>
          <Route index element={<ProfileInfo />} />
          <Route path="info" element={<ProfileInfo />} />
          <Route path="addresses" element={<ManageAddresses />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;