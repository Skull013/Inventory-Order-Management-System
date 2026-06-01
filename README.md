# Inventory & Order Management System

A full-stack containerized application for managing products, customers, orders, and inventory tracking.

# Technology Stack

# Backend
- **Python 3.11**
- **FastAPI** - Modern, fast web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM for database operations
- **Pydantic** - Data validation

# Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client

# DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server for frontend

# Features
# Product Management
- ✅ Create, read, update, and delete products
- ✅ Unique SKU validation
- ✅ Price and quantity tracking
- ✅ Inventory management

# Customer Management
- ✅ Create and manage customers
- ✅ Unique email validation
- ✅ Contact information storage

# Order Management
- ✅ Create orders with multiple products
- ✅ Automatic inventory reduction
- ✅ Insufficient stock validation
- ✅ Automatic total calculation
- ✅ Order history tracking

# Dashboard
- ✅ Total products count
- ✅ Total customers count
- ✅ Total orders count
- ✅ Low stock alerts (quantity < 10)

# Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── products.py
│   │   │   ├── customers.py
│   │   │   └── orders.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── database.py
│   │   └── config.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── Products.js
│   │   │   ├── Customers.js
│   │   │   └── Orders.js
│   │   ├── App.js
│   │   ├── api.js
│   │   └── index.js
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── .dockerignore
├── docker-compose.yml
├── .env.example
└── README.md
```

# Getting Started

# Prerequisites
- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

# Installation & Running

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inventory-management-system
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

# Stopping the Application
```bash
docker-compose down
```

# Stopping and Removing Volumes
```bash
docker-compose down -v
```

# API Endpoints

# Products
- `POST /products` - Create a new product
- `GET /products` - Get all products
- `GET /products/{id}` - Get product by ID
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product

# Customers
- `POST /customers` - Create a new customer
- `GET /customers` - Get all customers
- `GET /customers/{id}` - Get customer by ID
- `DELETE /customers/{id}` - Delete customer

# Orders
- `POST /orders` - Create a new order
- `GET /orders` - Get all orders
- `GET /orders/{id}` - Get order by ID
- `DELETE /orders/{id}` - Delete order
- `GET /orders/dashboard/stats` - Get dashboard statistics

# Business Rules

1. **Product SKU must be unique** - Enforced at database level
2. **Customer email must be unique** - Enforced at database level
3. **Product quantity cannot be negative** - Validated in API
4. **Orders cannot be placed if inventory is insufficient** - Checked before order creation
5. **Creating an order automatically reduces available stock** - Transactional operation
6. **Total order amount is calculated automatically** - Backend calculation
7. **All APIs include proper error handling** - HTTP status codes and error messages
8. **Request data validation** - Pydantic schemas

# Docker Configuration

# Backend Dockerfile
- Uses `python:3.11-slim` for smaller image size
- Multi-stage build not needed for backend
- Installs only production dependencies
- Exposes port 8000

# Frontend Dockerfile
- Multi-stage build for optimized production image
- Build stage: `node:18-alpine`
- Production stage: `nginx:alpine`
- Serves static files via Nginx
- Exposes port 80

# Docker Compose Services
1. **Database (PostgreSQL)**
   - Image: `postgres:15-alpine`
   - Named volume for data persistence
   - Health check configured

2. **Backend (FastAPI)**
   - Built from `./backend`
   - Depends on database health check
   - Environment variables for database connection

3. **Frontend (React)**
   - Built from `./frontend`
   - Nginx serves static files
   - Depends on backend service

# Deployment

### Backend Deployment Options
- **Render**: https://render.com

# Frontend Deployment Options
- **Vercel**: https://vercel.com

# Deployment Steps

# Backend (Example: Render)
1. Create a new Web Service
2. Connect your GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable: `DATABASE_URL`
6. Deploy

# Frontend (Example: Vercel)
1. Import your GitHub repository
2. Set framework preset to "Create React App"
3. Add environment variable: `REACT_APP_API_URL` (your backend URL)
4. Deploy

# Docker Hub

To push the backend image to Docker Hub:

```bash
# Build the image
docker build -t yourusername/inventory-backend:latest ./backend

# Login to Docker Hub
docker login

# Push the image
docker push yourusername/inventory-backend:latest
```

# Testing the Application

### Using the API Documentation
Visit http://localhost:8000/docs to access the interactive Swagger UI where you can test all API endpoints.

# Sample Data

**Create a Product:**
```json
{
  "name": "Laptop",
  "sku": "LAP001",
  "price": 999.99,
  "quantity": 50
}
```

**Create a Customer:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}
```

**Create an Order:**
```json
{
  "customer_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ]
}
```

# Development

# Running Backend Locally (without Docker)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

# Running Frontend Locally (without Docker)
```bash
cd frontend
npm install
npm start
```

# Environment Variables

# Backend
- `DATABASE_URL` - PostgreSQL connection string

# Frontend
- `REACT_APP_API_URL` - Backend API URL

# Troubleshooting

# Database Connection Issues
- Ensure PostgreSQL container is healthy: `docker-compose ps`
- Check database logs: `docker-compose logs db`

# Frontend Cannot Connect to Backend
- Verify `REACT_APP_API_URL` is set correctly
- Check CORS configuration in backend
- Ensure backend is running: `docker-compose ps`

# Port Already in Use
- Change ports in `docker-compose.yml`
- Or stop the conflicting service

# License

This project is created for educational purposes as part of a technical assessment.

# Author

Software Engineer Technical Assessment

# Acknowledgments

- FastAPI documentation
- React documentation
- Docker documentation
