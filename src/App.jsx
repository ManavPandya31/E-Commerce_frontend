import Router from "./Routers/Router";
import { useState , useEffect} from "react";
import Footer from "./Components/Footer";
import Loader from "./Components/Loader";
import store from "./app/store.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";

function App() {

  const location = useLocation();

  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(() => {
    return Number(localStorage.getItem("cartCount")) || 0;
  });

  useEffect(() => {
    localStorage.setItem("cartCount", cartCount);
  }, [cartCount]);
  
  const hideFooterRoutes = ["/login", "/register"];
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);

    console.log("Redux store:", store); 

  return (
    <>
    <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />

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

