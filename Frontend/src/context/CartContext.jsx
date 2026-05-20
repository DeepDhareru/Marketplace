import { createContext, useContext, useState } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    try {
      const { data } = await API.get('/cart');
      setCartCount(data.items?.length || 0);
    } catch {
      setCartCount(0);
    }
  };

  const addToCart = async (productId) => {
    try {
      await API.post('/cart', { productId, quantity: 1 });
      toast.success('Added to cart!');
      fetchCartCount();
    } catch {
      toast.error('Login to add to cart');
    }
  };

  return (
    <CartContext.Provider value={{ cartCount, fetchCartCount, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);