import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { CompareProvider } from './context/CompareContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <CompareProvider>
          <CartProvider>
            <Toaster position="top-right" />
            <App />
          </CartProvider>
        </CompareProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);