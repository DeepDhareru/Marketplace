# 🛒 Marketplace — Full Stack MERN E-Commerce App

A full-featured multi-vendor marketplace built with the MERN stack. Buyers can browse, purchase and track orders. Sellers can manage products, view analytics and handle orders. Admins can manage the entire platform.

> 🔗 Live Demo: [marketplace-delta-bice.vercel.app](https://marketplace-delta-bice.vercel.app)
> 📦 Backend API: [marketplace-backend.onrender.com](https://marketplace-backend.onrender.com)

---

## ✨ Features

### 🛍️ Buyer
- Browse & search products with advanced filters (price range, category, sort, stock)
- Add to cart & wishlist with heart toggle
- Razorpay payment integration (UPI, Cards, Netbanking)
- Apply coupon codes at checkout with live discount
- Order tracking with visual step-by-step timeline
- Download invoice PDF after successful payment
- Write star ratings & reviews on delivered products
- Reorder previous orders in one click
- Share product links via Web Share API

### 🏪 Seller
- Add / edit / delete products with multi-image upload
- AI-powered product description generator
- Sales analytics dashboard with line & bar charts
- Manage & update order status in real time
- Export all orders to CSV file
- Create & manage discount coupon codes
- Low stock alerts with quick edit links
- Email notification on every new order

### 🔐 Admin
- View platform-wide stats (users, products, orders, revenue)
- Manage all users — ban or activate accounts
- Moderate all product listings — delete any product
- View all orders across the platform

### ⚙️ System
- JWT authentication with 3 role-based access levels
- Dark / light mode with localStorage persistence
- Email notifications via Nodemailer + Gmail SMTP
- Cloudinary CDN for image storage and delivery
- Rate limiting & security headers with Helmet
- CI/CD pipeline with GitHub Actions
- Fully responsive design for mobile and desktop

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| State Management | React Context API |
| Charts | Recharts |
| PDF Generation | jsPDF + jsPDF-AutoTable |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Authentication | JWT + bcrypt |
| Payments | Razorpay |
| File Storage | Cloudinary + Multer |
| Email | Nodemailer + Gmail SMTP |
| Security | Helmet, Express Rate Limit |
| Deployment (FE) | Vercel |
| Deployment (BE) | Render |
| CI/CD | GitHub Actions |

---

## 📁 Project Structure

```
marketplace/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── cartController.js
│   │   ├── reviewController.js
│   │   ├── adminController.js
│   │   ├── wishlistController.js
│   │   ├── couponController.js
│   │   └── aiController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Cart.js
│   │   ├── Review.js
│   │   ├── Wishlist.js
│   │   └── Coupon.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── wishlistRoutes.js
│   │   ├── couponRoutes.js
│   │   └── aiRoutes.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── razorpay.js
│   │   ├── sendEmail.js
│   │   └── emailTemplates.js
│   ├── .env
│   └── server.js
│
└── frontend/
    └── src/
        ├── api/
        │   └── axios.js
        ├── context/
        │   ├── AuthContext.jsx
        │   ├── CartContext.jsx
        │   └── ThemeContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── ProductCard.jsx
        │   ├── Loader.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── StarRating.jsx
        │   ├── OrderTimeline.jsx
        │   └── ProductRecommendations.jsx
        ├── pages/
        │   ├── Home.jsx
        │   ├── ProductDetail.jsx
        │   ├── Cart.jsx
        │   ├── NotFound.jsx
        │   ├── auth/
        │   │   ├── Login.jsx
        │   │   └── Register.jsx
        │   ├── buyer/
        │   │   ├── Checkout.jsx
        │   │   ├── MyOrders.jsx
        │   │   ├── Profile.jsx
        │   │   └── Wishlist.jsx
        │   ├── seller/
        │   │   ├── SellerDashboard.jsx
        │   │   ├── MyProducts.jsx
        │   │   ├── AddProduct.jsx
        │   │   ├── EditProduct.jsx
        │   │   ├── SellerOrders.jsx
        │   │   └── MyCoupons.jsx
        │   └── admin/
        │       ├── AdminDashboard.jsx
        │       ├── AdminUsers.jsx
        │       ├── AdminProducts.jsx
        │       └── AdminOrders.jsx
        └── utils/
            └── generateInvoice.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free)
- Cloudinary account (free)
- Razorpay account (free test mode)
- Gmail account for email notifications

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/marketplace.git
cd marketplace
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

```bash
npm run dev
```

Backend runs on: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
```

```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🔑 Test Accounts

After registering, manually set role in MongoDB Atlas for admin access.

| Role | How to access |
|---|---|
| Buyer | Register with role = Buyer |
| Seller | Register with role = Seller |
| Admin | Register then change role to "admin" in MongoDB Atlas |

### Razorpay Test Payment
```
UPI ID : success@razorpay
Card   : 4111 1111 1111 1111
Expiry : Any future date
CVV    : Any 3 digits
OTP    : 1234
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/profile | Get user profile |
| PUT | /api/auth/profile | Update user profile |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/products | Get all products |
| GET | /api/products/:id | Get product by ID |
| POST | /api/products | Create product (seller) |
| PUT | /api/products/:id | Update product (seller) |
| DELETE | /api/products/:id | Delete product (seller) |
| GET | /api/products/seller/my | Get seller's products |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/orders | Create order (buyer) |
| POST | /api/orders/verify-payment | Verify Razorpay payment |
| GET | /api/orders/my | Get buyer's orders |
| GET | /api/orders/seller | Get seller's orders |
| PUT | /api/orders/:id/status | Update order status |

### Cart
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/cart | Get cart |
| POST | /api/cart | Add to cart |
| DELETE | /api/cart/:productId | Remove from cart |
| DELETE | /api/cart/clear | Clear cart |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/admin/stats | Get platform stats |
| GET | /api/admin/users | Get all users |
| PUT | /api/admin/users/:id/toggle | Ban/activate user |
| GET | /api/admin/products | Get all products |
| DELETE | /api/admin/products/:id | Delete product |
| GET | /api/admin/orders | Get all orders |

### Other
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/reviews/:productId | Get product reviews |
| POST | /api/reviews/:productId | Add review |
| GET | /api/wishlist | Get wishlist |
| POST | /api/wishlist/toggle | Toggle wishlist |
| POST | /api/coupons/validate | Validate coupon |
| POST | /api/ai/generate-description | Generate AI description |

---

## ✅ Features Checklist

| Feature | Status |
|---|---|
| JWT Auth with 3 Roles | ✅ Done |
| Product CRUD + Cloudinary Images | ✅ Done |
| Cart & Checkout Flow | ✅ Done |
| Razorpay Payment Integration | ✅ Done |
| Email Notifications (Nodemailer) | ✅ Done |
| Wishlist | ✅ Done |
| Coupon / Discount Codes | ✅ Done |
| Order Status Timeline | ✅ Done |
| Invoice PDF Download | ✅ Done |
| Reorder Previous Orders | ✅ Done |
| Dark / Light Mode | ✅ Done |
| Sales Analytics Charts | ✅ Done |
| Export Orders to CSV | ✅ Done |
| AI Description Generator | ✅ Done |
| Product Recommendations | ✅ Done |
| Advanced Search & Filters | ✅ Done |
| Share Product Link | ✅ Done |
| Rate Limiting & Security | ✅ Done |
| CI/CD GitHub Actions | ✅ Done |
| Full Production Deployment | ✅ Done |

## 👨‍💻 Author

**Your Name**
- 💼 LinkedIn: https://linkedin.com/in/deep-dhareru-562436370
- 🐙 GitHub: https://github.com/DeepDhareru
- 📧 Email: Deepakmon268@gmail.com



> Built as a portfolio project to demonstrate full-stack development skills.
