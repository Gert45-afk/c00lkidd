# GameMarket - Digital Goods Marketplace

A full-stack marketplace platform inspired by Playerok.com and FunPay.com for buying and selling digital goods (game accounts, items, currency, services).

## Features

- 🔐 User authentication (register/login with JWT)
- 📦 Create and manage listings
- 🔍 Search and filter listings by category
- 💳 Order system with secure transactions
- ⭐ Seller ratings and reviews
- 💰 Balance management with commission system
- 🎨 Modern dark UI design

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt for password hashing

### Frontend
- Vanilla JavaScript
- CSS3 with modern features
- Responsive design

## Project Structure

```
marketplace-demo/
├── backend/
│   ├── config/
│   │   └── db.js          # Database connection
│   ├── middleware/
│   │   └── auth.js        # JWT authentication middleware
│   ├── models/
│   │   ├── User.js        # User schema
│   │   ├── Listing.js     # Listing schema
│   │   └── Order.js       # Order schema
│   ├── routes/
│   │   ├── auth.js        # Auth routes
│   │   ├── listings.js    # Listing routes
│   │   └── orders.js      # Order routes
│   ├── server.js          # Express server
│   └── .env               # Environment variables
├── frontend/
│   ├── public/
│   │   ├── css/
│   │   │   └── style.css  # Styles
│   │   ├── js/
│   │   │   └── app.js     # Frontend logic
│   │   └── index.html     # Main HTML
│   └── server.js          # Static file server
└── package.json
```

## Installation

1. **Install dependencies:**
```bash
cd /workspace/marketplace-demo
npm install
```

2. **Set up environment variables:**
Edit `backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/marketplace
JWT_SECRET=your-secret-key-change-in-production
```

3. **Start MongoDB** (if running locally):
```bash
mongod
```

4. **Run the application:**

Backend API (port 5000):
```bash
npm run dev
```

Frontend (port 3000):
```bash
npm run frontend
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Listings
- `GET /api/listings` - Get all listings (with filters)
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create listing (protected)
- `PUT /api/listings/:id` - Update listing (protected)
- `DELETE /api/listings/:id` - Delete listing (protected)

### Orders
- `POST /api/orders` - Create order/buy item (protected)
- `GET /api/orders/my-orders` - Get user's orders (protected)
- `PUT /api/orders/:id/complete` - Complete order (seller)
- `PUT /api/orders/:id/confirm` - Confirm receipt (buyer)

## Usage

1. Open http://localhost:3000 in your browser
2. Register a new account or login
3. Browse listings by category or search
4. Create your own listings to sell items
5. Purchase items from other sellers
6. Manage your orders and balance

## Features Implemented

✅ User registration and authentication
✅ JWT-based session management
✅ Create, read, update, delete listings
✅ Category filtering and sorting
✅ Order creation and management
✅ Seller balance with 5% commission
✅ Responsive dark theme UI
✅ Modal-based interactions
✅ XSS protection (HTML escaping)

## Future Enhancements

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Real-time chat between buyers and sellers
- [ ] Image upload for listings
- [ ] Advanced search with Elasticsearch
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Dispute resolution system
- [ ] Two-factor authentication
- [ ] API rate limiting

## Security Notes

⚠️ **For production use:**
- Change JWT_SECRET to a strong random string
- Use HTTPS
- Implement proper CORS policies
- Add input validation and sanitization
- Set up proper error logging
- Use environment-specific configurations
- Implement rate limiting
- Add CSRF protection

## License

ISC
