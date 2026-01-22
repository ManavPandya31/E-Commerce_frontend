import Router from "./Routers/Router";
import { useState } from "react";
import { Provider } from "react-redux";
import store from "./app/store.js";

function App() {

  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  console.log("Redux store:", store); 

  return (
    
      <Router
        cartItems={cartItems}
        setCartItems={setCartItems}
        cartCount={cartCount}
        setCartCount={setCartCount}
      />
   
  );
}

export default App;
