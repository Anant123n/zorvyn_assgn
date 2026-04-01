# Finance Dashboard Backend API

A comprehensive **Finance Data Processing and Access Control Backend** built with **Node.js**, **Express.js**, and **MongoDB**. Features role-based access control (RBAC), financial record management, dashboard analytics with aggregation pipelines, JWT authentication, and full API documentation.

---

## 🏗️ Architecture

```
backend/
├── server.js                    # Entry point
├── app.js                       # Express app configuration
├── config/
│   └── swagger.js               # Swagger/OpenAPI configuration
├── DbConfig/
│   └── db.js                    # MongoDB connection
├── models/
│   ├── User.js                  # User schema with bcrypt & roles
│   └── FinancialRecord.js       # Financial record schema
├── middleware/
│   ├── auth.js                  # JWT authentication & role authorization
│   ├── validate.js              # Request validation middleware
│   └── errorHandler.js          # Global error handler
├── controllers/
│   ├── authController.js        # Auth endpoints
│   ├── userController.js        # User management endpoints
│   ├── financialRecordController.js  # Record CRUD endpoints
│   └── dashboardController.js   # Dashboard analytics endpoints
├── services/
│   ├── authService.js           # Auth business logic
│   ├── userService.js           # User management logic
│   ├── financialRecordService.js # Record management logic
│   └── dashboardService.js      # Dashboard aggregation logic
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── financialRecordRoutes.js
│   └── dashboardRoutes.js
├── validators/
│   ├── authValidators.js        # Auth input validation chains
│   ├── userValidators.js        # User input validation chains
│   └── financialRecordValidators.js # Record input validation chains
├── utils/
│   ├── AppError.js              # Custom error class
│   ├── apiFeatures.js           # Query builder (filter, sort, paginate)
│   └── constants.js             # App-wide constants
├── seeds/
│   └── seed.js                  # Database seeding script
└── tests/
    ├── auth.test.js             # Authentication tests
    ├── financialRecord.test.js  # Record CRUD & RBAC tests
    └── dashboard.test.js        # Dashboard analytics tests
```

### Design Pattern: Layered Architecture

```
Client Request
     │
     ▼
  Routes          →  URL mapping + middleware chain
     │
     ▼
  Middleware      →  Auth (JWT), Authorization (RBAC), Validation
     │
     ▼
  Controllers     →  HTTP handling, request/response formatting
     │
     ▼
  Services        →  Business logic (isolated & testable)
     │
     ▼
  Models          →  Data layer (Mongoose ODM)
     │
     ▼
  MongoDB         →  Persistence
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v16+ 
- **MongoDB** running locally or a MongoDB Atlas URI
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Seed the database with sample data
npm run seed

# Start development server
npm run dev
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `MONGODB_URI` | `mongodb://localhost:27017/finance_dashboard` | MongoDB connection string |
| `JWT_SECRET` | — | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | `7d` | JWT token expiry duration |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |

---

## 🔐 Authentication & Authorization

### Authentication
- JWT-based authentication via `Authorization: Bearer <token>` header
- Passwords hashed with **bcrypt** (12 salt rounds)
- Tokens expire after 7 days (configurable)

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|------------|
| **Viewer** | View financial records, view recent activity |
| **Analyst** | All Viewer permissions + access dashboard analytics (summary, trends, breakdowns) |
| **Admin** | All permissions: create/update/delete records, manage users, full dashboard access |

### Test Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@financeapp.com` | `admin123` |
| Analyst | `analyst@financeapp.com` | `analyst123` |
| Viewer | `viewer@financeapp.com` | `viewer123` |

---

## 📚 API Reference

### Base URL: `http://localhost:5000/api/v1`

📖 **Interactive API Docs**: Visit `http://localhost:5000/api-docs` for Swagger UI

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/auth/register` | Public | Register a new user |
| `POST` | `/auth/login` | Public | Login and receive JWT |
| `GET` | `/auth/me` | Authenticated | Get current user profile |

### User Management (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | List all users (paginated) |
| `GET` | `/users/:id` | Get user by ID |
| `PATCH` | `/users/:id` | Update user (name, email) |
| `PATCH` | `/users/:id/role` | Change user role |
| `PATCH` | `/users/:id/status` | Toggle active/inactive |
| `DELETE` | `/users/:id` | Soft delete user |

### Financial Records

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/records` | Admin | Create record |
| `GET` | `/records` | All Auth | List records (filterable) |
| `GET` | `/records/:id` | All Auth | Get record by ID |
| `PATCH` | `/records/:id` | Admin | Update record |
| `DELETE` | `/records/:id` | Admin | Soft delete record |

**Query Parameters for `GET /records`:**
- `type` — Filter by `income` or `expense`
- `category` — Filter by category name
- `startDate` / `endDate` — Date range filter (ISO 8601)
- `search` — Text search in description
- `sort` — Sort field (e.g., `-amount`, `date`, `-createdAt`)
- `page` / `limit` — Pagination (default: page 1, limit 20)

### Dashboard Analytics

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/dashboard/summary` | Analyst, Admin | Total income, expenses, net balance |
| `GET` | `/dashboard/category-breakdown` | Analyst, Admin | Category-wise totals |
| `GET` | `/dashboard/monthly-trends` | Analyst, Admin | Monthly income/expense trends |
| `GET` | `/dashboard/recent-activity` | All Auth | Latest N records |

All dashboard endpoints support `startDate` and `endDate` query params for date filtering.

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Tests cover:
# - Authentication (register, login, profile)
# - Financial Records (CRUD, filtering, access control)
# - Dashboard (summary, category breakdown, monthly trends, RBAC)
```

Tests use a separate `_test` database suffix to avoid polluting development data.

---

## 📊 Data Models

### User
| Field | Type | Description |
|-------|------|-------------|
| `name` | String | User's full name (2-100 chars) |
| `email` | String | Unique email address |
| `password` | String | Bcrypt hashed (never returned in API responses) |
| `role` | Enum | `viewer`, `analyst`, or `admin` |
| `status` | Enum | `active` or `inactive` |
| `isDeleted` | Boolean | Soft delete flag |

### Financial Record
| Field | Type | Description |
|-------|------|-------------|
| `amount` | Number | Transaction amount (≥ 0) |
| `type` | Enum | `income` or `expense` |
| `category` | Enum | One of 17 predefined categories |
| `date` | Date | Transaction date (cannot be future) |
| `description` | String | Optional notes (max 500 chars) |
| `createdBy` | ObjectId | Reference to User who created it |
| `isDeleted` | Boolean | Soft delete flag |

**Available Categories:** salary, freelance, investments, rent, utilities, food, transportation, healthcare, entertainment, education, shopping, travel, insurance, taxes, gifts, subscriptions, other

---

## 🛡️ Error Handling

The API returns consistent error responses:

```json
{
  "status": "fail",
  "message": "Human-readable error description"
}
```

### HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad request / Validation error |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Resource not found |
| `409` | Conflict (duplicate email) |
| `429` | Too many requests (rate limited) |
| `500` | Internal server error |

---

## 🏛️ Design Decisions & Assumptions

1. **Soft Delete**: All entities use `isDeleted` flag instead of hard delete — preserves audit trail and enables data recovery.

2. **Service Layer**: Business logic is isolated in service classes, keeping controllers thin and logic testable independently of HTTP concerns.

3. **Validation at Multiple Levels**: Input validation at route level (express-validator) + schema validation at model level (Mongoose) provides defense in depth.

4. **Password Security**: bcrypt with 12 salt rounds; passwords never returned in any API response (Mongoose `select: false` + `toJSON` override).

5. **MongoDB Aggregation Pipelines**: Dashboard analytics use server-side aggregation for efficiency — no client-side computation of totals.

6. **Self-Action Protection**: Admins cannot change their own role, deactivate themselves, or delete their own account.

7. **Rate Limiting**: Applied globally to `/api` routes (100 requests per 15-minute window) to prevent abuse.

8. **Role Hierarchy**: viewer → analyst → admin. Each higher role inherits read permissions of lower roles. Write operations are admin-only.

---

## 🔧 Optional Enhancements Implemented

- ✅ **JWT Authentication** with configurable expiry
- ✅ **Pagination** with page/limit/totalPages metadata
- ✅ **Search** (regex-based text search on descriptions)
- ✅ **Soft Delete** on all entities
- ✅ **Rate Limiting** (express-rate-limit)
- ✅ **Integration Tests** (Jest + Supertest)
- ✅ **API Documentation** (Swagger UI at `/api-docs`)
- ✅ **Security Headers** (Helmet)
- ✅ **Request Logging** (Morgan in development mode)
- ✅ **Database Seeding** with realistic sample data
- ✅ **Input Validation** (express-validator)
- ✅ **CORS Support** (enabled for all origins in dev)

---

## 📄 License

ISC
