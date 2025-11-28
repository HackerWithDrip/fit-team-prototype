import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { CartItem } from '../types';
import { API_URL } from '../config';

interface CartContextType {
  cart: CartItem[];
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  cartCount: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('sessionId');
    if (!id) {
      id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('sessionId', id);
    }
    return id;
  });

  const refreshCart = async () => {
    try {
      const response = await axios.get(`${API_URL}/cart/${sessionId}`);
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [sessionId]);

  const addToCart = async (productId: number, quantity: number = 1) => {
    try {
      await axios.post(`${API_URL}/cart`, {
        sessionId,
        productId,
        quantity,
      });
      await refreshCart();
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      await axios.put(`${API_URL}/cart/${itemId}`, { quantity });
      await refreshCart();
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      await axios.delete(`${API_URL}/cart/${itemId}`);
      await refreshCart();
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${API_URL}/cart/session/${sessionId}`);
      setCart([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const getSessionId = () => {
  let id = localStorage.getItem('sessionId');
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('sessionId', id);
  }
  return id;
};

