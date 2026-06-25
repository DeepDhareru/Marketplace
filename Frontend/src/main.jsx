import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { CompareProvider } from './context/CompareContext';
import { SocketProvider } from './context/SocketContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ✅ ThemeProvider only here, removed from App.jsx */}
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <CompareProvider>
            <CartProvider>
              <Toaster position="top-right" />
              <App />
            </CartProvider>
          </CompareProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);