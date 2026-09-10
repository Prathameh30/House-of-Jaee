# House of Jaee — Saree E-Commerce Website

A full-stack e-commerce website for a saree retail business, built with:

- **Frontend:** React (Vite) + React Router DOM + Tailwind CSS + Axios + React Icons
- **Backend:** Express.js + MySQL (raw SQL via `mysql2`, no ORM)
- **Auth:** JWT — separate flows for Admins and Customers. Guest checkout is also supported (no login required to buy).

---

## 1. Project Structure

```
house-of-jaee/
├── backend/              Express API server
│   ├── config/           MySQL connection pool
│   ├── controllers/      Request handlers
│   ├── middleware/       Auth guards, error handling
│   ├── models/           Raw SQL query layer
│   ├── routes/           Express routers
│   ├── seed/             Admin/demo-customer account seeding script
│   ├── utils/            JWT + order-number helpers
│   ├── .env.example
│   └── server.js
│
├── frontend/              React (Vite) storefront + admin panel
│   ├── public/images/    SVG placeholder product/category/hero art
│   └── src/
│       ├── components/   common/, product/, admin/
│       ├── context/      CartContext, AuthContext, ToastContext
│       ├── layouts/      MainLayout (storefront), AdminLayout
│       ├── pages/        customer pages + pages/admin/
│       ├── services/     Axios API clients
│       └── utils/        formatting helpers
│
├── database/
│   ├── schema.sql         All table definitions, keys, indexes
│   └── seed.sql            8 categories, 15 products, 1 admin, 10 orders
│
└── docs/
    └── API.md             Full REST API reference
```

---

## 2. Prerequisites

- Node.js 18+
- MySQL 8.0+ running locally (or reachable via network)
- npm

---

## 3. Database Setup

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

This creates the `house_of_jaee` database with all tables and sample data (8 categories, 15 sarees, 10 sample orders).

> **Note on the admin password:** `seed.sql` inserts a placeholder bcrypt hash for the admin account.
> Bcrypt hashes are salted per-generation, so don't rely on that static hash — instead run the backend's
> seed script (see step 4.3 below) right after installing dependencies. It overwrites the admin password
> with a correctly generated hash and also creates a demo customer account for testing.

---

## 4. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in your MySQL credentials and a JWT secret:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=house_of_jaee

JWT_SECRET=replace_this_with_a_long_random_secret_key
JWT_EXPIRES_IN=7d

SEED_ADMIN_EMAIL=admin@houseofjaee.com
SEED_ADMIN_PASSWORD=Admin@123

FRONTEND_URL=http://localhost:5173
PORT=5000
```

### 4.1 Run the seed script (creates working admin + demo customer logins)

```bash
npm run seed
```

This prints the admin and demo customer credentials to the console after running.

### 4.2 Start the backend

```bash
npm run dev      # with nodemon (auto-restart)
# or
npm start        # plain node
```

The API will be available at `http://localhost:5000/api`. Check `http://localhost:5000/api/health` to confirm it's running.

---

## 5. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

By default `.env` points to `http://localhost:5000/api` — adjust `VITE_API_BASE_URL` if your backend runs elsewhere.

```bash
npm run dev
```

The storefront will be available at `http://localhost:5173`.

---

## 6. Default Login Credentials (after running `npm run seed`)

| Role     | Email                         | Password      |
|----------|--------------------------------|---------------|
| Admin    | admin@houseofjaee.com          | Admin@123     |
| Customer | demo.customer@example.com      | Customer@123  |

Admin panel: `http://localhost:5173/admin/login`
Customer login: `http://localhost:5173/login`

Guests can also check out without any account — just add to cart and proceed to checkout.

---

## 7. Key Features

**Customer-facing:**
- Browse, search, and filter sarees by category, price, and tags (new arrival / best seller / festival)
- Product details with multiple images, fabric/colour/occasion/care info, stock status
- Cart (persisted in `localStorage`) with quantity controls
- Guest or logged-in checkout, delivery address form, 3 payment methods (UPI / Credit Card / COD — simulated)
- Order confirmation page + public order tracking by order number (no login required)
- Optional customer accounts: register/login, view "My Orders"
- About Us, Contact Us (with form + WhatsApp link), Newsletter signup

**Admin panel** (JWT-protected, separate from customer auth):
- Dashboard: total products, total orders, revenue, pending orders
- Products: create/edit/delete, manage images, toggle new-arrival/best-seller/festival flags
- Categories: create/edit/delete
- Orders: view details, update status (Pending → Confirmed → Packed → Shipped → Delivered / Cancelled)
- Contact messages: view and mark as read

---

## 8. Notes on Implementation Choices

- **No ORM** — all SQL is raw, parameterized queries via `mysql2/promise`, organized into a `models/` layer.
- **Order creation is transactional**: order + order_items + stock decrement + payment record all commit or roll back together (see `backend/models/orderModel.js`).
- **Images are SVG placeholders** generated programmatically (no copyrighted/stock photography used), styled to match the maroon/gold/cream/brown theme. Swap any `image_url` in the database or via the admin panel for real product photography when available.
- **JWT auth is fully separate** for admins and customers — different tokens, different middleware guards (`requireAdmin` / `requireCustomer`), stored under different `localStorage` keys on the frontend.

See `docs/API.md` for the full endpoint reference.
