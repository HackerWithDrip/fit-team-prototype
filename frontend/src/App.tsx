import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import About from './pages/About';
import OrderSuccess from './pages/OrderSuccess';
import './App.css';

// Component to ensure hash routing works correctly on initial load
function HashRouterFix() {
  const location = useLocation();
  const [hasInitialized, setHasInitialized] = React.useState(false);
  
  useEffect(() => {
    // Only redirect on initial load if there's no hash
    if (!hasInitialized && (!location.hash || location.hash === '' || location.hash === '#')) {
      window.location.replace(window.location.pathname + '#/');
      setHasInitialized(true);
    } else if (!hasInitialized) {
      setHasInitialized(true);
    }
  }, [location, hasInitialized]);
  
  return null;
}

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <Router>
          <HashRouterFix />
          <div className="app">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/about" element={<About />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
