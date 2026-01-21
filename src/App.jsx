import Router from "./Routers/Router";
import { useState } from "react";

function App() {

  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  return (
      <Router
      cartItems={cartItems}
      setCartItems={setCartItems}
      cartCount={cartCount}
      setCartCount={setCartCount}
    />
  )
}

export default App
