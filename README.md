# ⚡ Online Electronic Product Rental Management System

[![CI Pipeline](https://github.com/electrorent/electrorent-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/electrorent/electrorent-platform/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18.3-61dafb.svg)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg)](https://www.docker.com/)

A complete, production-grade **Online Electronic Product Rental Management System** engineered with the **MERN** stack (MongoDB, Express.js, React.js, Node.js) and modern **DevOps** principles including containerization, automated testing, continuous integration/continuous deployment (CI/CD) pipelines, and role-based access control (RBAC).

---

## 📑 Table of Contents
1. [Project Overview & Key Capabilities](#-project-overview--key-capabilities)
2. [User Roles & Permissions Matrix](#-user-roles--permissions-matrix)
3. [Technology Stack](#-technology-stack)
4. [System Architecture](#-system-architecture)
5. [DevOps CI/CD Architecture](#-devops-cicd-architecture)
6. [Repository & Project Structure](#-repository--project-structure)
7. [Default Seed Credentials](#-default-seed-credentials)
8. [Local Installation & Setup](#-local-installation--setup)
9. [Automated Testing Suite](#-automated-testing-suite)
10. [Docker & Container Orchestration](#-docker--container-orchestration)
11. [GitHub Actions CI/CD Configuration](#-github-actions-cicd-configuration)
12. [Cloud Deployment Guide (Vercel, Render, Atlas)](#-cloud-deployment-guide)
13. [REST API Documentation & Endpoints](#-rest-api-documentation--endpoints)
14. [Security & DevOps Hardening](#-security--devops-hardening)
15. [Troubleshooting FAQ](#-troubleshooting-faq)

---

## 🚀 Project Overview & Key Capabilities

ElectroRent solves modern consumer and enterprise challenges for accessing high-end electronic equipment (such as creator laptops, 4K mirrorless cameras, gaming consoles, conference projectors, and spatial audio gear) without large capital expenditures.

### Core System Features:
- **Comprehensive Hardware Catalog:** Filter by category, physical condition, price range, and real-time stock availability.
- **Dynamic Rental Calculation Engine:** Computes rental charges based on durations ($days \times rate$) alongside escrow security deposits and dynamic late penalty fees.
- **Complete Rental Lifecycle:** Confirmed $\rightarrow$ Dispatched $\rightarrow$ Active Window $\rightarrow$ Return Requested $\rightarrow$ Inspected $\rightarrow$ Returned.
- **Automated Overdue Detection:** Background job identifies unreturned hardware past their due date, computes accrued late fees, and updates administrative telemetry.
- **Warehouse Quality Assurance (QA):** Dedicated returned-product inspection workflow for Inventory Supervisors to grade hardware (New, Excellent, Good, Fair, Damaged, Under Maintenance) and replenish stock atomically.
- **Four Mandatory Analytical Reports:**
  1. **Rental Booking Report:** Comprehensive customer booking audits with multi-field date and status filters.
  2. **Product Availability Report:** Stock levels, rented counts, physical condition, and equipment utilization percentages.
  3. **Revenue Report:** Financial accounting covering base rental charges, escrow security deposits, late penalties, and visual breakdown charts.
  4. **Overdue Rental Report:** Priority penalty tracking for past-due equipment with customer contact info.
- **One-Click CSV Export:** Direct tabular export capability across all analytical reports for business auditing.

---

## 👥 User Roles & Permissions Matrix

The system implements strict Role-Based Access Control (RBAC) enforced on both client routes and server-side JWT authentication middleware:

| Feature / Resource | Public Guest | Customer | Inventory Manager | System Admin |
| :--- | :---: | :---: | :---: | :---: |
| Browse Catalog & Search Products | ✅ | ✅ | ✅ | ✅ |
| View Equipment Details & Live Price Preview | ✅ | ✅ | ✅ | ✅ |
| Register Account / Log In | ✅ | ✅ | ✅ | ✅ |
| Book Rental & Authorize Deposit | ❌ | ✅ | ❌ | ✅ |
| Track Active Leases & Order Timeline | ❌ | ✅ (Own) | ✅ (All) | ✅ (All) |
| Request Equipment Return | ❌ | ✅ (Own) | ❌ | ✅ (All) |
| Inspect Returned Units & Grade Condition | ❌ | ❌ | ✅ | ✅ |
| Adjust Stock Counts & Maintenance States | ❌ | ❌ | ✅ | ✅ |
| Add / Edit / Delete Products | ❌ | ❌ | ⚠️ Edit/Add | ✅ Full CRUD |
| User & Role Administration | ❌ | ❌ | ❌ | ✅ |
| Executive Reports & Financial Audits | ❌ | ❌ | ✅ Reports | ✅ Full Access |
| Automated Overdue Scanner | ❌ | ❌ | ✅ | ✅ |

---

## 🛠️ Technology Stack

### Frontend:
- **Library:** React 18 (Vite SPA)
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios (configured with JWT interceptors)
- **Charts & Visualization:** Chart.js + react-chartjs-2
- **Icons:** Lucide React
- **Styling:** Custom Vanilla CSS Design System (Zero heavyweight bloated UI libraries, clean responsive layouts)

### Backend:
- **Runtime:** Node.js (v20+ LTS)
- **Framework:** Express.js REST API
- **Database ODM:** Mongoose v8
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) + `bcryptjs` password salting
- **Security Middleware:** Helmet (HTTP header security), CORS, Express Rate Limiter
- **Testing:** Jest + Supertest + In-Memory MongoDB Server

### Database:
- **Database Engine:** MongoDB 7.0 (Local instance, Docker container, or MongoDB Atlas cluster)

### DevOps & Infrastructure:
- **Version Control:** Git & GitHub
- **Containerization:** Docker multi-stage builds (Lean Alpine Linux images)
- **Web Server:** Nginx (Serving React SPA with client-side fallback routing & reverse proxy)
- **Orchestration:** Docker Compose (Frontend + Backend + MongoDB + Health Checks)
- **CI/CD Automation:** GitHub Actions (`ci.yml` and `cd.yml`)
- **Code Quality:** ESLint

---

## 🏛️ System Architecture

```text
[ Client Browser / SPA ]
         |
         |  HTTPS / HTTP Requests (with JWT Bearer Header)
         v
[ Nginx Reverse Proxy / Port 80 ]
         |
         +-----> /          --> [ React Static Production Bundle ]
         +-----> /api/*     --> [ Node.js Express Server / Port 5000 ]
                                         |
                       +-----------------+-----------------+
                       |                                   |
              [ Auth & RBAC Middleware ]          [ Overdue Cron Engine ]
                       |                                   |
              [ Controllers / Services ]                  |
                       |                                   |
              [ Mongoose ODM Layer ] <---------------------+
                       |
                       v
         [ MongoDB Database / Port 27017 ]
```

---

## 🔄 DevOps CI/CD Architecture

```text
Developer Push / PR
       |
       v
GitHub Repository
       |
       +---> GitHub Actions CI Workflow (.github/workflows/ci.yml)
       |        |
       |        +---> Job 1: Backend Lint & Automated Tests (Jest / Supertest)
       |        +---> Job 2: Frontend Lint & Production Bundle Build (Vite)
       |        +---> Job 3: Docker Container Build Verification (Multi-stage)
       |
       v  (On Merge to main / production)
GitHub Actions CD Workflow (.github/workflows/cd.yml)
       |
       +---> Audit Environment Secrets (MONGO_URI, JWT_SECRET, etc.)
       +---> Push Docker Images to Container Registry
       +---> Trigger Backend Cloud Deploy (Render / Railway / AWS)
       +---> Trigger Frontend Cloud Deploy (Vercel / Nginx)
       |
       v
Production Cluster + MongoDB Atlas Database
```

---

## 📁 Repository & Project Structure

```text
projectvttttttt/
├── .github/
│   └── workflows/
│       ├── ci.yml               # Automated CI pipeline (lint, test, build, docker)
│       └── cd.yml               # Automated CD deployment workflow
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js            # MongoDB connection logic
│   │   ├── controllers/
│   │   │   ├── authController.js    # Register, login, profile
│   │   │   ├── productController.js # Product CRUD & filtering
│   │   │   ├── rentalController.js  # Lease calculation & booking
│   │   │   ├── userController.js    # User management & roles
│   │   │   └── reportController.js  # Analytical aggregation endpoints
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js    # JWT verification & role authorization
│   │   │   ├── errorMiddleware.js   # Centralized error handler
│   │   │   ├── loggerMiddleware.js  # Request time & status logger
│   │   │   └── validateMiddleware.js# Input parameter sanitization
│   │   ├── models/
│   │   │   ├── User.js          # User schema with bcrypt hooks
│   │   │   ├── Product.js       # Electronic hardware schema
│   │   │   └── Rental.js        # Lease record schema with lifecycle states
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── rentalRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   └── healthRoutes.js  # GET /api/health
│   │   ├── services/
│   │   │   ├── rentalService.js # Core calculation, stock deduction, overdue logic
│   │   │   └── reportService.js # 4 mandatory reports queries
│   │   ├── utils/
│   │   │   ├── apiResponse.js   # Consistent JSON envelope formatter
│   │   │   ├── logger.js        # Structured logging utility
│   │   │   └── seedData.js      # Seed datasets for users & hardware
│   │   ├── app.js               # Express application configuration
│   │   ├── server.js            # HTTP server entrypoint & graceful shutdown
│   │   └── seed.js              # Database seed script
│   ├── tests/
│   │   ├── setup.js             # In-memory Mongo test environment
│   │   ├── auth.test.js         # Authentication & token verification tests
│   │   ├── products.test.js     # Product CRUD and permission tests
│   │   ├── rentals.test.js      # Calculation, stock deduction, & overdue tests
│   │   └── reports.test.js      # Reporting and telemetry tests
│   ├── .env.example             # Backend environment documentation
│   ├── .eslintrc.json           # Backend linter configuration
│   ├── Dockerfile               # Production multi-stage backend container
│   ├── .dockerignore
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Adaptive navigation header
│   │   │   ├── Footer.jsx       # Highlights and architectural footer
│   │   │   ├── Sidebar.jsx      # Admin & Inventory portal navigation
│   │   │   ├── ProtectedRoute.jsx # Client-side route authorization guard
│   │   │   ├── StatCard.jsx     # Dashboard KPI card
│   │   │   ├── Badge.jsx        # Status and condition indicators
│   │   │   ├── Modal.jsx        # Accessible dialog window
│   │   │   ├── Alert.jsx        # Banner notification
│   │   │   └── LoadingSpinner.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # Authentication session provider
│   │   │   └── NotificationContext.jsx # Toast notification provider
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx   # Storefront layout (Nav + Footer)
│   │   │   └── DashboardLayout.jsx # Portal layout (Sidebar + Topbar)
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   │   ├── Home.jsx             # Landing page with hero & categories
│   │   │   │   ├── Login.jsx            # Sign in with 1-click demo buttons
│   │   │   │   ├── Register.jsx         # Customer self-registration
│   │   │   │   ├── ProductCatalog.jsx   # Catalog with category & search filters
│   │   │   │   └── ProductDetails.jsx   # Specs & live rental cost calculator
│   │   │   ├── customer/
│   │   │   │   ├── MyRentals.jsx        # Rental history & return request
│   │   │   │   └── RentalTracking.jsx   # Step-by-step dispatch timeline
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx   # Executive command center & charts
│   │   │   │   ├── ProductManagement.jsx# Add/Edit/Delete products
│   │   │   │   ├── RentalManagement.jsx # All leases & dispatch controls
│   │   │   │   ├── UserManagement.jsx   # Role configuration & account toggle
│   │   │   │   └── ReportsDashboard.jsx # 4 mandatory reports with CSV export
│   │   │   └── inventory/
│   │   │       ├── InventoryDashboard.jsx # Warehouse KPIs & queue overview
│   │   │       ├── InspectionWorkflow.jsx # Returned item QA inspection
│   │   │       └── StockManagement.jsx    # Quick condition & stock adjustments
│   │   ├── services/
│   │   │   ├── api.js           # Axios instance with interceptors
│   │   │   ├── authService.js
│   │   │   ├── productService.js
│   │   │   ├── rentalService.js
│   │   │   ├── reportService.js
│   │   │   └── userService.js
│   │   ├── styles/
│   │   │   └── index.css        # Responsive custom CSS design system
│   │   ├── App.jsx              # Application route tree
│   │   └── main.jsx
│   ├── .env.example             # Frontend environment documentation
│   ├── .eslintrc.json           # Frontend linter configuration
│   ├── nginx.conf               # Production Nginx SPA configuration
│   ├── Dockerfile               # Multi-stage Vite build + Nginx container
│   ├── .dockerignore
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── docker-compose.yml           # Multi-container orchestration (App + DB)
├── .dockerignore
├── .gitignore
└── README.md                    # Project documentation
```

---

## 🔑 Default Seed Credentials

For quick evaluation during college project evaluation, the seed script provides 3 ready-to-use profiles across all user roles:

| Role | Email Address | Password | Intended Portal |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `Password@123` | `/admin/dashboard` |
| **Inventory Manager** | `inventory@example.com` | `Password@123` | `/inventory/dashboard` |
| **Customer** | `customer@example.com` | `Password@123` | `/catalog` & `/my-rentals` |

> ⚠️ **Security Notice:** The default password `Password@123` is provided strictly for development and project evaluation. When deploying to a production cluster, rotate passwords and generate an unguessable 64-character `JWT_SECRET`.

---

## 💻 Local Installation & Setup

### Prerequisites:
- **Node.js** (v18 or v20+ LTS)
- **npm** (v9+)
- **MongoDB** (running locally on port 27017 or a free MongoDB Atlas connection URI)
- **Git**

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/online-electronic-product-rental.git
cd online-electronic-product-rental
```

### Step 2: Configure Environment Variables
```bash
# Backend configuration
cp backend/.env.example backend/.env

# Frontend configuration
cp frontend/.env.example frontend/.env
```

Review `backend/.env`:
```ini
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/electronic_rental
JWT_SECRET=super_secret_jwt_key_electronic_rental_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
LATE_FEE_MULTIPLIER=1.5
OVERDUE_CHECK_INTERVAL_MS=3600000
```

Review `frontend/.env`:
```ini
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Install Backend Dependencies & Seed Database
```bash
# Navigate to backend directory
cd backend
npm install

# Seed database with Users, 11 Electronic Products, and Sample Rentals
npm run seed
```

### Step 4: Install Frontend Dependencies
```bash
# In a separate terminal, navigate to frontend
cd ../frontend
npm install
```

### Step 5: Start the Development Servers
In Terminal 1 (Backend API):
```bash
cd backend
npm run dev
# Server running at: http://localhost:5000
# Health check: http://localhost:5000/api/health
```

In Terminal 2 (Frontend React App):
```bash
cd frontend
npm run dev
# Application accessible at: http://localhost:5173
```

---

## 🧪 Automated Testing Suite

The backend contains automated unit and integration tests powered by **Jest** and **Supertest**. Tests run against an isolated MongoDB instance without requiring external database dependencies.

### Run All Backend Tests:
```bash
cd backend
npm test
```

### Tested Scenarios:
1. **Authentication API:**
   - User registration with password hashing.
   - Prevention of duplicate email accounts.
   - Credential validation and JWT token issuance.
   - Profile retrieval via Bearer token and 401 unauthenticated protection.
2. **Product CRUD & Authorization:**
   - Public retrieval of available electronic equipment.
   - Admin authorization to create and delete equipment.
   - 403 Forbidden enforcement for non-admin accounts.
3. **Rental Business Logic & Calculations:**
   - Live cost computation ($days \times pricePerDay + deposit$).
   - Atomic decrement of available stock upon booking confirmation.
   - Prevention of bookings when stock is zero.
   - Equipment dispatch lifecycle.
   - Return request by customer.
   - Return inspection and acceptance by Inventory Manager.
   - Atomic increment of stock and condition grading upon return.
   - Overdue scan detection and dynamic late fee accrual ($lateDays \times pricePerDay \times 1.5$).
4. **Mandatory Reporting Endpoints:**
   - Rental booking aggregation.
   - Product availability and utilization rate calculation.
   - Revenue and fee breakdown.
   - Overdue tracking report.

---

## 🐳 Docker & Container Orchestration

Both frontend and backend include optimized, production-ready `Dockerfile` configurations using lightweight Alpine Linux images.

### Quick Start with Docker Compose:
The included `docker-compose.yml` spins up the complete microservice architecture:
- `electro-mongodb`: MongoDB 7.0 database engine.
- `electro-backend`: Express REST API running on Node.js 20 Alpine.
- `electro-frontend`: React Vite SPA compiled and served via Nginx 1.25 Alpine.

```bash
# Build and launch all containers in detached mode
docker-compose up --build -d

# Verify running container status and health probes
docker-compose ps

# View unified application logs
docker-compose logs -f
```

### Accessing the Dockerized Services:
- **Frontend Web Application:** [http://localhost](http://localhost) (Port 80)
- **Backend REST API:** [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check Endpoint:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **MongoDB:** `localhost:27017`

### Stop and Clean Up Containers:
```bash
docker-compose down -v
```

---

## ⚙️ GitHub Actions CI/CD Configuration

The repository includes two complete GitHub Actions workflows:

### 1. Continuous Integration (`.github/workflows/ci.yml`):
Triggered automatically on every `push` and `pull_request` to `main`, `master`, or `develop`.
- **Checkout:** Pulls repository source code.
- **Node.js Setup:** Installs Node.js v20 with dependency caching.
- **Backend Quality:** Installs dependencies, runs ESLint, and executes the full Jest test suite against a MongoDB service container.
- **Frontend Quality:** Installs frontend dependencies, runs ESLint, and executes the production Vite build (`npm run build`).
- **Container Validation:** Executes Docker Buildx to verify that both `backend/Dockerfile` and `frontend/Dockerfile` compile cleanly without layer errors.

### 2. Continuous Deployment (`.github/workflows/cd.yml`):
Triggered on merges into `main` or manual trigger via `workflow_dispatch`.
- Audits and loads encrypted secrets from repository settings.
- Builds and tags production container images.
- Triggers cloud webhooks or Vercel production deployment.

### Required GitHub Repository Secrets:
Configure these in **GitHub Repository $\rightarrow$ Settings $\rightarrow$ Secrets and variables $\rightarrow$ Actions**:

| Secret Key | Description | Example Value |
| :--- | :--- | :--- |
| `MONGO_URI` | MongoDB Atlas Production URI | `mongodb+srv://admin:pass@cluster0.mongodb.net/prod?retryWrites=true&w=majority` |
| `JWT_SECRET` | 64+ Character JWT Encryption Key | `9b8c6cf9bb67d23e...` |
| `CLIENT_URL` | Production Frontend Web Domain | `https://electrorent.vercel.app` |
| `VITE_API_URL` | Production Backend API Endpoint | `https://electrorent-api.onrender.com/api` |
| `RENDER_BACKEND_DEPLOY_HOOK` | (Optional) Render Deploy Webhook URL | `https://api.render.com/deploy/srv-xxxx` |
| `VERCEL_TOKEN` | (Optional) Vercel CLI Deployment Token | `a1b2c3d4...` |

---

## ☁️ Cloud Deployment Guide

### Database (MongoDB Atlas):
1. Create a free M0 cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Network Access**, allow IP `0.0.0.0/0` (or the specific IP ranges of your cloud host).
3. Under **Database Access**, create a user with read/write privileges.
4. Copy your connection string into `MONGO_URI`.

### Backend Deployment (Render / Railway / AWS):
1. Create a new **Web Service** pointing to your GitHub repository.
2. Select Root Directory as `backend`.
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Configure Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGO_URI`: `your-atlas-uri`
   - `JWT_SECRET`: `your-production-secret`
   - `CLIENT_URL`: `https://your-frontend-app.vercel.app`

### Frontend Deployment (Vercel):
1. Connect your GitHub repository on [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Add Environment Variable:
   - `VITE_API_URL`: `https://your-backend-api.onrender.com/api`
6. Deploy!

---

## 📡 REST API Documentation & Endpoints

All responses follow a consistent JSON response envelope:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Health Check Endpoint:
- `GET /api/health`: Returns service status, MongoDB connectivity, and uptime.
```json
{
  "success": true,
  "status": "healthy",
  "service": "Online Electronic Product Rental Management System API",
  "uptimeSeconds": 124,
  "database": "connected",
  "environment": "production"
}
```

### Authentication Endpoints (`/api/auth`):
- `POST /api/auth/register`: Create new customer account.
- `POST /api/auth/login`: Authenticate with email/password; returns JWT.
- `GET /api/auth/me`: Get current authenticated user profile (Bearer token required).

### Equipment Catalog Endpoints (`/api/products`):
- `GET /api/products`: Retrieve all products (Supports `?category=`, `?condition=`, `?search=`, `?sort=`).
- `GET /api/products/:id`: Retrieve single product specifications.
- `POST /api/products`: Add new equipment (Admin & Inventory Manager).
- `PUT /api/products/:id`: Update equipment details, stock, or status (Admin & Inventory Manager).
- `DELETE /api/products/:id`: Remove equipment permanently (Admin only).

### Rental Operations Endpoints (`/api/rentals`):
- `POST /api/rentals/estimate`: Live calculation preview for start/end dates.
- `POST /api/rentals`: Book equipment lease; atomically decrements available stock.
- `GET /api/rentals/my-rentals`: Customer views their personal rentals and tracking states.
- `GET /api/rentals`: Admin & Inventory Manager view all active/historical leases.
- `GET /api/rentals/:id`: View full rental dossier.
- `PUT /api/rentals/:id/dispatch`: Dispatch equipment from warehouse.
- `PUT /api/rentals/:id/return`: Customer initiates equipment return request.
- `PUT /api/rentals/:id/inspect`: Warehouse supervisor grades post-rental condition and restocks unit.
- `POST /api/rentals/check-overdue`: Triggers overdue scanner and applies late fees.

### Analytical Report Endpoints (`/api/reports`):
- `GET /api/reports/dashboard-summary`: Executive KPI metrics (users, products, revenue, stock).
- `GET /api/reports/rentals`: Report 1 - Rental Booking Report with date and status filters.
- `GET /api/reports/availability`: Report 2 - Product Availability & Utilization Rate Report.
- `GET /api/reports/revenue`: Report 3 - Revenue Report with 7d, 30d, custom filters, and category splits.
- `GET /api/reports/overdue`: Report 4 - Overdue Rental Report with calculated late days and penalties.

### User Administration Endpoints (`/api/users`):
- `GET /api/users`: List registered accounts (Admin only).
- `PUT /api/users/:id`: Modify user roles or activate/deactivate accounts.
- `DELETE /api/users/:id`: Delete user record.

---

## 🔒 Security & DevOps Hardening

1. **Zero Hardcoded Secrets:** Credentials, database connection strings, and JWT keys reside exclusively in `.env` files and GitHub Action Secrets.
2. **Password Security:** Passwords are never stored in plain text; salted with 10 rounds of bcrypt hashing before database persistence.
3. **Role-Based Authorization:** Every mutating endpoint verifies both the JWT token and the requester's role (`admin`, `inventory_manager`, `customer`).
4. **Header Protection:** Helmet middleware injects standard security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`).
5. **Rate Limiting:** Protects API endpoints against brute force and DDoS attempts (300 requests / 15 minutes per IP).
6. **Least Privilege Containerization:** Lightweight Alpine base images; unneeded ports are kept inside private Docker networks.

---

## ❓ Troubleshooting FAQ

### 1. MongoDB Connection Refused (`ECONNREFUSED 127.0.0.1:27017`):
- Ensure MongoDB is running locally (`mongod` service) or verify your Atlas connection URI in `backend/.env`.
- For Docker, ensure you run `docker-compose up` so the `electro-mongodb` container starts first.

### 2. Client CORS Errors:
- Check that `CLIENT_URL` in `backend/.env` matches the origin of your React app (`http://localhost:5173` for dev, `http://localhost` for Docker).

### 3. Port Conflicts (e.g. Port 5000 or 80 already in use):
- If port 5000 is occupied, adjust `PORT=5001` in `backend/.env` and update `VITE_API_URL=http://localhost:5001/api` in `frontend/.env`.

---

## 🎓 Academic Demonstration Checklist

- [x] Minimum 9 Functional Screens implemented (13 total screens).
- [x] Role-Based Access Control (Admin, Inventory Manager, Customer).
- [x] Four Mandatory Reports (Rental Booking, Availability, Revenue, Overdue).
- [x] Automatic rental duration & deposit calculation.
- [x] Inventory stock decreases upon booking and increases upon return.
- [x] Warehouse return inspection and condition updates.
- [x] Automatic overdue detection with late penalty calculation.
- [x] Automated backend test suite with Jest & Supertest.
- [x] Dockerfile for backend & multi-stage Nginx Dockerfile for frontend.
- [x] Multi-service `docker-compose.yml` with health-check probes.
- [x] GitHub Actions CI & CD workflows.
- [x] Complete production documentation.
