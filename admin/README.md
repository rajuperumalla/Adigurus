# Adiguru's Admin Dashboard

A complete, production-ready admin dashboard for the Adiguru's eCommerce platform.

## 🚀 Features

### 🔐 Authentication
- Secure JWT-based authentication
- Session persistence with localStorage
- Role-based access control (Super Admin)
- Auto-logout on token expiration

### 📊 Dashboard Overview
- Real-time statistics cards (Orders, Revenue, Products, Pending)
- Interactive sales charts (Chart.js)
- Top-selling products visualization
- Recent orders table with quick actions

### 📦 Order Management
- View all orders with filtering (Pending, Shipped, Delivered, Cancelled)
- Search orders by customer name, email, or order ID
- Update order status with one click
- View detailed order information including customer details
- Real-time notification badges for pending orders

### 🛍️ Product Management
- Add new products with image upload
- Edit existing products
- Delete products with confirmation
- Manage inventory (stock levels)
- Category-based filtering
- Image upload to Cloudinary (configurable)
- Support for discounts per product

### 🏷️ Discount & Festival Offers
- Create percentage or fixed-amount discounts
- Apply discounts to:
  - Entire store
  - Specific categories
  - Individual products
- Schedule start and end dates
- Active/inactive status management
- Visual offer cards with clear status indicators

### 📈 Analytics
- Daily, weekly, and monthly sales trends
- Revenue tracking with interactive charts
- Orders volume analysis
- Top-selling products ranking
- Performance indicators

### 🔔 Notifications
- Real-time order notifications
- Badge counters for pending items
- Dropdown notification list
- Click-to-view order details

### 🎨 UI/UX
- Modern Shopify-inspired design
- Fully responsive (mobile, tablet, desktop)
- Dark mode support
- Smooth animations and transitions
- Loading states for all async operations
- Form validation with error messages
- Accessible components (ARIA labels, keyboard navigation)

## 📁 Folder Structure

```
admin/
├── index.html              # Main dashboard HTML
├── assets/
│   ├── css/
│   │   └── admin.css       # Custom styles
│   ├── js/
│   │   └── admin.js        # Application logic
│   └── images/             # Admin-specific images
└── README.md               # This file
```

## 🔧 Configuration

### Environment Setup

1. **API Configuration** (in `assets/js/admin.js`):
```javascript
const API_BASE = '/api/admin'; // Your backend API endpoint
```

2. **Cloudinary Image Upload** (optional):
```javascript
const CLOUDINARY_CLOUD_NAME = 'your-cloud-name';
const CLOUDINARY_UPLOAD_PRESET = 'your-preset';
```

3. **Default Login Credentials** (for demo):
- Email: `admin@adigurus.com`
- Password: `admin123`

⚠️ **Important**: Change default credentials in production!

## 🛠️ Backend API Requirements

### Authentication Endpoints

```
POST /api/admin/login
Body: { email, password }
Response: { token, user }

POST /api/admin/logout
Headers: { Authorization: Bearer <token> }
Response: { success: true }
```

### Orders Endpoints

```
GET /api/admin/orders?status=pending&search=query
Response: [{ id, customer, email, phone, total, status, items, date, address }]

PUT /api/admin/orders/:id/status
Body: { status: 'pending|shipped|delivered|cancelled' }
Response: { success: true, order }

GET /api/admin/orders/:id
Response: { order details with items }
```

### Products Endpoints

```
GET /api/admin/products?category=Hair%20Care
Response: [{ id, name, category, price, stock, discount, image, description }]

POST /api/admin/products
Body: FormData { name, category, description, price, stock, discount, image }
Response: { success: true, product }

PUT /api/admin/products/:id
Body: FormData { name, category, description, price, stock, discount, image }
Response: { success: true, product }

DELETE /api/admin/products/:id
Response: { success: true }
```

### Discounts Endpoints

```
GET /api/admin/discounts
Response: [{ id, name, type, value, scope, target, startDate, endDate, active }]

POST /api/admin/discounts
Body: { name, type, value, scope, target?, startDate, endDate, active }
Response: { success: true, discount }

DELETE /api/admin/discounts/:id
Response: { success: true }
```

### Analytics Endpoints

```
GET /api/admin/analytics?period=daily|weekly|monthly
Response: {
  daily: [{ date, sales, orders }],
  topProducts: [{ name, sales, revenue }],
  revenue: number,
  growth: number
}
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    discount INTEGER DEFAULT 0,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Discounts Table
```sql
CREATE TABLE discounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'percentage' or 'fixed'
    value DECIMAL(10, 2) NOT NULL,
    scope VARCHAR(50) NOT NULL, -- 'store', 'category', 'product'
    target VARCHAR(255), -- category name or product ID
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Getting Started

### 1. Clone and Setup
```bash
cd admin/
# No build step required - pure HTML/CSS/JS
```

### 2. Open in Browser
```bash
# Simply open index.html in your browser
# Or use a local server:
npx serve .
# or
python -m http.server 8000
```

### 3. Login
- Use credentials: `admin@adigurus.com` / `admin123`

### 4. Connect to Backend
Update `API_BASE` in `admin.js` to point to your backend API.

## 🔒 Security Best Practices

1. **Authentication**
   - Use HTTPS in production
   - Implement token refresh mechanism
   - Set secure cookie flags
   - Add rate limiting on login

2. **Authorization**
   - Validate roles on every request
   - Implement CSRF protection
   - Sanitize all inputs

3. **Data Protection**
   - Hash passwords with bcrypt
   - Encrypt sensitive data
   - Implement audit logging

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🎨 Color Scheme

```css
--primary: #4A6741      /* Earth Green */
--primary-dark: #3D5636
--secondary: #D4AF37    /* Gold */
--danger: #DC2626
--success: #10B981
--warning: #F59E0B
--info: #3B82F6
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Navigate between all pages
- [ ] Create new product
- [ ] Edit existing product
- [ ] Delete product
- [ ] Filter orders by status
- [ ] Search orders
- [ ] Update order status
- [ ] Create discount
- [ ] View analytics charts
- [ ] Toggle dark mode
- [ ] Test on mobile devices
- [ ] Test notifications

## 🔄 Future Enhancements

- [ ] Multi-admin support with role hierarchy
- [ ] Export reports to CSV/PDF
- [ ] Bulk product import/export
- [ ] Advanced analytics with date range picker
- [ ] Customer management module
- [ ] Inventory alerts (low stock notifications)
- [ ] Email notifications for new orders
- [ ] Real-time WebSocket updates
- [ ] Multi-language support
- [ ] Activity audit log

## 📄 License

Proprietary - Adiguru's eCommerce Platform

## 👥 Support

For issues or questions, contact: admin@adigurus.com

---

**Version**: 1.0.0  
**Last Updated**: January 2025
