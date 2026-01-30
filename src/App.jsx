import Router from "./Routers/Router";
import { useState } from "react";
import Footer from "./Components/Footer";
import Loader from "./Components/Loader";
import store from "./app/store.js";
import { useLocation } from "react-router-dom";

function App() {

  const location = useLocation();

  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const hideFooterRoutes = ["/login", "/register"];
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);

    console.log("Redux store:", store); 

  return (
    <>
      <Loader />   
      
      <Router
        cartItems={cartItems}
        setCartItems={setCartItems}
        cartCount={cartCount}
        setCartCount={setCartCount}
      />
       {!shouldHideFooter && <Footer />}
    </>
  );
}

export default App;
