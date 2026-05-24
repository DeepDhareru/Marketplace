import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import NotFound from './pages/NotFound';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import Checkout from './pages/buyer/Checkout';
import MyOrders from './pages/buyer/MyOrders';
import Profile from './pages/buyer/Profile';

import SellerDashboard from './pages/seller/SellerDashboard';
import MyProducts from './pages/seller/MyProducts';
import AddProduct from './pages/seller/AddProduct';
import EditProduct from './pages/seller/EditProduct';
import SellerOrders from './pages/seller/SellerOrders';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';

import Wishlist from './pages/buyer/Wishlist';
import MyCoupons from './pages/seller/MyCoupons';

import FlashSales from './pages/FlashSales';
import ManageFlashSales from './pages/seller/ManageFlashSales';

import ComparePage from './pages/ComparePage';

import ReferralPage from './pages/ReferralPage';

import ChatPage from './pages/ChatPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Buyer */}
          <Route path="/cart" element={<ProtectedRoute role="buyer"><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute role="buyer"><Checkout /></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute role="buyer"><MyOrders /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute role="buyer"><Wishlist /></ProtectedRoute>} />

          {/* Seller */}
          <Route path="/seller/dashboard" element={<ProtectedRoute role="seller"><SellerDashboard /></ProtectedRoute>} />
          <Route path="/seller/products" element={<ProtectedRoute role="seller"><MyProducts /></ProtectedRoute>} />
          <Route path="/seller/products/add" element={<ProtectedRoute role="seller"><AddProduct /></ProtectedRoute>} />
          <Route path="/seller/products/edit/:id" element={<ProtectedRoute role="seller"><EditProduct /></ProtectedRoute>} />
          <Route path="/seller/orders" element={<ProtectedRoute role="seller"><SellerOrders /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute role="admin"><AdminProducts /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute role="admin"><AdminOrders /></ProtectedRoute>} />

          {/* Wishlist */}
          <Route path="/wishlist" element={<ProtectedRoute role="buyer"><Wishlist /></ProtectedRoute>} />

          {/* Coupons */}
          <Route path="/seller/coupons" element={<ProtectedRoute role="seller"><MyCoupons /></ProtectedRoute>} />

          {/* Flash Sales */}
          <Route path="/flash-sales" element={<FlashSales />} />
          <Route path="/seller/flash-sales" element={<ProtectedRoute role="seller"><ManageFlashSales /></ProtectedRoute>} />

          {/* Compare */}
          <Route path="/compare" element={<ComparePage />} />

          {/* Referral */}
          <Route path="/referral" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />

          {/* Chat */}
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/chat/:userId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;