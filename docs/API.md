# House of Jaee — API Documentation

Base URL: `http://localhost:5000/api`

All request/response bodies are JSON. Protected routes require an `Authorization: Bearer <token>` header.

---

## Auth

### Customer

| Method | Endpoint                  | Auth | Description |
|--------|----------------------------|------|--------------|
| POST   | `/customer/auth/register` | —    | `{ name, email, password, mobileNumber }` → `{ token, customer }` |
| POST   | `/customer/auth/login`    | —    | `{ email, password }` → `{ token, customer }` |
| GET    | `/customer/auth/me`       | Customer | Returns the logged-in customer's profile |

### Admin

| Method | Endpoint               | Auth  | Description |
|--------|--------------------------|-------|--------------|
| POST   | `/admin/auth/login`     | —     | `{ email, password }` → `{ token, admin }` |
| GET    | `/admin/auth/me`        | Admin | Returns the logged-in admin's profile |

---

## Categories

| Method | Endpoint                      | Auth  | Description |
|--------|--------------------------------|-------|--------------|
| GET    | `/categories`                 | —     | List all active categories |
| GET    | `/categories/:slug`            | —     | Get one category by slug |
| GET    | `/admin/categories`            | Admin | List all categories (incl. inactive) |
| POST   | `/admin/categories`             | Admin | `{ name, description, imageUrl }` |
| PUT    | `/admin/categories/:id`        | Admin | `{ name, description, imageUrl, isActive }` |
| DELETE | `/admin/categories/:id`        | Admin | Fails if products still reference this category |

---

## Products

| Method | Endpoint                              | Auth  | Description |
|--------|-----------------------------------------|-------|--------------|
| GET    | `/products`                           | —     | List with filters (see query params below) |
| GET    | `/products/:slug`                      | —     | Single product with images |
| GET    | `/admin/products/:id`                  | Admin | Single product by numeric ID (for edit forms) |
| POST   | `/admin/products`                       | Admin | Create product (see body below) |
| PUT    | `/admin/products/:id`                  | Admin | Update product |
| DELETE | `/admin/products/:id`                  | Admin | Delete product |
| POST   | `/admin/products/:id/images`           | Admin | `{ imageUrl, isPrimary, displayOrder }` |
| DELETE | `/admin/products/images/:imageId`      | Admin | Remove a single image |

**`GET /products` query params:**
`category` (slug) · `search` · `newArrival=true` · `bestSeller=true` · `festival=true` · `minPrice` · `maxPrice` · `sortBy` (`price`\|`rating`\|`created_at`\|`name`) · `sortOrder` (`ASC`\|`DESC`) · `page` · `limit`

**Create/update product body:**
```json
{
  "categoryId": 1,
  "name": "Maroon Mysore Silk Saree",
  "description": "...",
  "fabric": "Mysore Silk",
  "colour": "Maroon",
  "occasion": "Festival, Wedding",
  "careInstructions": "Dry clean only.",
  "price": 6499.00,
  "discountPrice": 5499.00,
  "stockQuantity": 18,
  "isNewArrival": false,
  "isBestSeller": true,
  "isFestivalCollection": true,
  "isActive": true,
  "images": ["/images/products/example-1.svg", "/images/products/example-2.svg"]
}
```

---

## Orders

| Method | Endpoint                       | Auth              | Description |
|--------|----------------------------------|--------------------|--------------|
| POST   | `/orders/checkout`             | Optional (guest OK) | Place an order |
| GET    | `/orders/track/:orderNumber`   | —                  | Public order tracking |
| GET    | `/orders/my-orders`            | Customer           | Logged-in customer's order history |
| GET    | `/admin/orders`                 | Admin              | List orders, `?status=&page=&limit=` |
| GET    | `/admin/orders/:id`             | Admin              | Single order with items + payment |
| PUT    | `/admin/orders/:id/status`     | Admin              | `{ status }` — one of Pending/Confirmed/Packed/Shipped/Delivered/Cancelled |
| GET    | `/admin/dashboard/stats`       | Admin              | `{ totalProducts, totalOrders, revenue, pendingOrders }` |

**Checkout body:**
```json
{
  "customerName": "Priya Sharma",
  "mobileNumber": "9876543210",
  "email": "priya@example.com",
  "addressLine": "12 Lotus Apartments, Andheri West",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pinCode": "400053",
  "items": [
    { "productId": 1, "quantity": 1 },
    { "productId": 5, "quantity": 2 }
  ],
  "paymentMethod": "UPI"
}
```
`paymentMethod` must be one of: `"UPI"`, `"Credit Card"`, `"Cash on Delivery"`.

Server resolves the live price per product, validates stock, computes subtotal/delivery/total
(delivery is ₹99 flat, free above ₹7,000 subtotal), and creates the order + items + payment +
stock decrement inside a single DB transaction. Authenticated customers get `customer_id` attached
automatically; guests do not need to send a token.

---

## Contact & Newsletter

| Method | Endpoint                          | Auth  | Description |
|--------|-------------------------------------|-------|--------------|
| POST   | `/contact`                        | —     | `{ name, email, phone, subject, message }` |
| POST   | `/newsletter/subscribe`           | —     | `{ email }` |
| GET    | `/admin/contact-messages`         | Admin | List all messages |
| PUT    | `/admin/contact-messages/:id/read`| Admin | Mark a message as read |

---

## Response Shape

Success:
```json
{ "success": true, "message": "...", "...": "..." }
```

Error:
```json
{ "success": false, "message": "Human-readable error message" }
```

Common status codes: `400` validation error, `401` missing/invalid token, `403` wrong role,
`404` not found, `409` conflict (duplicate/foreign-key), `500` server error.
