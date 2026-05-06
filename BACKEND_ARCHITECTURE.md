# E-Commerce Backend Architecture Documentation

## 📋 Table of Contents
1. [API Routes](#api-routes)
2. [Data Models](#data-models)
3. [Authentication Method](#authentication-method)
4. [Base URL Structure](#base-url-structure)

---

## 🛣️ API Routes

### Base URL
```
http://localhost:3000/api/v1
```

### Route Files Structure
```
server/sec/features/
├── auth/          → auth.router.js
├── users/         → user.router.js
├── products/      → products.router.js
├── Cart/          → cart.router.js
└── orders/        → order.router.js
```

---

### 1. **Authentication Routes** (`/api/v1/AuthRoutes`)
**File:** `auth/auth.router.js`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/register` | ❌ | Register new user |
| POST | `/login` | ❌ | Login regular user (rate limited: 10 requests/min) |
| GET | `/verify-email/:rawToken` | ❌ | Verify email with token |
| POST | `/password-forgot` | ❌ | Send password reset email |
| POST | `/password-reset/:token` | ❌ | Reset password with token |
| POST | `/admin/login` | ❌ | Login as admin |
| POST | `/admin/verify-2fa` | ❌ | Verify 2FA code for admin |
| POST | `/logout` | ✅ | Logout user |
| PUT | `/logout` | ✅ | Delete token on logout |
| GET | `/me` | ✅ | Get current user profile |

---

### 2. **User Routes** (`/api/v1/users`)
**File:** `users/user.router.js`

#### Public/Authenticated User Endpoints
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/profile` | ✅ | Get user profile |
| PUT | `/profile` | ✅ | Update user profile (with avatar upload) |
| PUT | `/change-password` | ✅ | Change user password |
| POST | `/addresses` | ✅ | Add shipping address |
| PUT | `/addresses/:addrId` | ✅ | Update shipping address |
| DELETE | `/addresses/:addrId` | ✅ | Delete shipping address |

#### Admin Only Endpoints
| Method | Endpoint | Auth Required | Role Required | Description |
|--------|----------|---------------|---------------|-------------|
| GET | `/` | ✅ | Admin | Get all users |
| PUT | `/role/:id` | ✅ | Admin | Update user role |
| DELETE | `/:id` | ✅ | Admin | Delete user |

---

### 3. **Product Routes** (`/api/v1/products`)
**File:** `products/products.router.js`

| Method | Endpoint | Auth Required | Role Required | Description |
|--------|----------|---------------|---------------|-------------|
| POST | `/` | ✅ | Admin | Create product (with image upload, max 4 images) |
| GET | `/` | ❌ | - | Get all products |
| GET | `/category/:cat` | ❌ | - | Get products by category |
| GET | `/:id` | ❌ | - | Get single product by ID |
| POST | `/:id/rating` | ✅ | - | Add product rating/review |
| PUT | `/:id` | ✅ | Admin | Update product |
| DELETE | `/:id` | ✅ | Admin | Delete product |

---

### 4. **Cart Routes** (`/api/v1/cart`)
**File:** `Cart/cart.router.js`

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/` | ✅ | Get user cart |
| POST | `/` | ✅ | Add items to cart |
| PUT | `/:productId` | ✅ | Update quantity of item in cart |
| DELETE | `/:productId` | ✅ | Remove single item from cart |
| DELETE | `/` | ✅ | Clear entire cart |
| POST | `/sync` | ✅ | Sync cart (for offline sync) |

---

### 5. **Order Routes** (`/api/v1/orders`)
**File:** `orders/order.router.js`

| Method | Endpoint | Auth Required | Role Required | Description |
|--------|----------|---------------|---------------|-------------|
| POST | `/` | ✅ | - | Create new order |
| GET | `/my-orders` | ✅ | - | Get user's orders |
| GET | `/:id` | ✅ | - | Get single order by ID |
| GET | `/` | ✅ | Admin | Get all orders (admin only) |
| PUT | `/:id/status` | ✅ | Admin | Update order status |
| PUT | `/:id/cancel` | ✅ | Admin | Cancel order |

---

## 📊 Data Models

### 1. **User Model**
**File:** `users/user.model.js`

```javascript
{
  // Basic Info
  name: String (required, min 2 chars),
  email: String (required, unique, lowercase),
  password: String (required, min 8 chars, not selected by default),
  image: String (profile image URL),
  
  // Authorization
  role: String (enum: ['customer', 'admin'], default: 'customer'),
  
  // Email Verification
  isVerified: Boolean (default: false),
  verificationToken: String,
  verificationTokenExpiry: Date,
  
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpiry: Date,
  
  // 2FA (Two-Factor Authentication)
  twoFactorCode: String,
  twoFactorExpiry: Date,
  
  // Embedded Cart
  cart: [
    {
      product: ObjectId (ref: 'Product'),
      quantity: Number (min: 1)
    }
  ],
  
  // Embedded Addresses
  addresses: [
    {
      city: String (required),
      street: String (required),
      houseNumber: Number (required),
      zip: String (required)
    }
  ],
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

---

### 2. **Product Model**
**File:** `products/products.model.js`

```javascript
{
  // Basic Info
  name: String (required),
  description: String (required),
  price: Number (required, min: 0),
  
  // Category & Inventory
  category: String (enum: ['electronics', 'clothing', 'food', 'home', 'beauty']),
  stock: Number (required, min: 0, default: 0),
  sold: Number (default: 0),
  
  // Media
  images: [String] (array of image URLs, default: []),
  
  // Status
  isActive: Boolean (default: true),
  
  // Ratings & Reviews
  ratings: [
    {
      user: ObjectId (ref: 'User'),
      rating: Number (1-5, required),
      comment: String,
      createdAt: Date (default: now)
    }
  ],
  averageRating: Number (min: 0, max: 5, default: 0),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  
  // Indexes
  - createdAt (for default sort)
  - price (for price sort)
  - category (for category filter)
}
```

---

### 3. **Order Model**
**File:** `orders/order.model.js`

```javascript
{
  // User Reference
  user: ObjectId (ref: 'User', required),
  
  // Order Items
  items: [
    {
      product: ObjectId (ref: 'Product'),
      name: String (product name snapshot),
      price: Number (product price snapshot),
      image: String (product image snapshot),
      quantity: Number (min: 1)
    }
  ],
  
  // Shipping Address
  shippingAddress: {
    city: String (required),
    street: String (required),
    houseNumber: Number (required),
    zip: String (required)
  },
  
  // Pricing
  totalprice: Number (required),
  shipingCost: Number (default: 0),
  
  // Payment
  paymentMethod: String (enum: ['credit', 'paypal', 'simulated']),
  paymentStatus: String (enum: ['paid', 'pending', 'failed'], default: 'pending'),
  
  // Order Status
  orderStatus: String (enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending'),
  
  // Tracking
  trackingNumber: String,
  notes: String,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

---

### 4. **Cart** (Embedded in User Model)
**File:** Embedded in `users/user.model.js`

```javascript
cart: [
  {
    product: ObjectId (ref: 'Product'),
    quantity: Number (min: 1)
  }
]
```

**Note:** Cart is stored as an embedded array within the User document. There's also a dedicated Cart router for cart operations.

---

## 🔐 Authentication Method

### **JWT (JSON Web Token) Authentication**
**File:** `auth/auth.middleware.js`

#### Authentication Flow:
1. **Login/Register** → User receives JWT token
2. **Token Format** → `Authorization: Bearer <JWT_TOKEN>`
3. **Token Storage** → Client stores token (typically in localStorage or httpOnly cookie)
4. **Token Verification** → Each protected request includes token in Authorization header

#### Middleware Details:
```javascript
// Auth Middleware validates:
- Checks if Authorization header exists
- Verifies header starts with "Bearer"
- Extracts token from header
- Verifies token signature using JWT_SECRET
- Decodes token and extracts user info (userId, email, etc.)
- Attaches decoded user to req.user object
```

#### Token Claims:
```javascript
{
  userId: String,
  email: String,
  // ... other user data
}
```

#### Protected Routes:
- All authenticated endpoints require `authMiddleware`
- Authorization header must be present and valid
- Returns 401 if token is missing or invalid

#### Admin Routes:
- Require both `authMiddleware` AND `checkRole` middleware
- `checkRole` verifies user.role === 'admin'
- Returns 403 if user is not admin

#### Rate Limiting:
- Login endpoint: 10 requests per 60 seconds (configurable)
- Global limiter: 100 requests per 60 seconds

---

## 🌐 Base URL Structure

### **Development Server**
```
Base URL: http://localhost:3000/api/v1
Port: 3000 (or from .env PORT variable)
```

### **API Endpoint Pattern**
```
http://localhost:3000/api/v1/{feature}/{endpoint}

Examples:
- http://localhost:3000/api/v1/users/profile
- http://localhost:3000/api/v1/products
- http://localhost:3000/api/v1/orders/my-orders
- http://localhost:3000/api/v1/cart
```

### **Feature Prefixes**
| Feature | Prefix | Full Path |
|---------|--------|-----------|
| Authentication | `/AuthRoutes` | `/api/v1/AuthRoutes` |
| Users | `/users` | `/api/v1/users` |
| Products | `/products` | `/api/v1/products` |
| Cart | `/cart` | `/api/v1/cart` |
| Orders | `/orders` | `/api/v1/orders` |

### **Request Headers Required for Protected Routes**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### **CORS Configuration**
- CORS is enabled via `cors.config.js`
- Helmet security headers are applied
- CSP (Content Security Policy) configured for Cloudinary images

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Image Upload:** Cloudinary
- **Security:** Helmet, CORS, Rate Limiting
- **Environment:** dotenv

---

## 📝 Notes for Frontend Development

1. **All protected endpoints** need JWT token in Authorization header
2. **User cart** can be updated via dedicated cart endpoints or through user profile
3. **Product images** are hosted on Cloudinary
4. **Addresses** are stored as embedded documents in User model
5. **Admin functionality** requires role-based access (role: 'admin')
6. **Error handling** uses global error handler in `shared/utils/errorConrtoller.js`

