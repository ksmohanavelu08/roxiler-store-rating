# Store Rating System

Full-stack web application for managing store ratings with role-based access control.

## 📌 Project Information

- **Assignment:** Roxiler Systems FullStack Intern Coding Challenge
- **Tech Stack:** Node.js, Express.js, SQLite, React.js
- **Author:** K S Mohan Velu
- **GitHub:** https://github.com/ksmohanavelu08

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Backend Setup
```bash
cd backend
npm install
npm run dev
```
Server runs on `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
App opens at `http://localhost:3000`

### Create Test Data
```bash
cd backend
node seed.js
```

---

## 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | Admin@123 |
| Owner | owner@test.com | Owner@123 |
| User | user@test.com | User@123 |

---

## 📚 API Documentation

**Base URL:** `http://localhost:5000/api`

### Authentication

#### Signup
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe Test User Account",
  "email": "john@example.com",
  "password": "Test@123",
  "address": "123 Main Street"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "Admin@123"
}

Response:
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "name": "Administrator",
    "email": "admin@test.com",
    "role": "admin"
  }
}
```

#### Update Password
```http
PATCH /api/auth/update-password
Authorization: Bearer <token>

{
  "oldPassword": "Admin@123",
  "newPassword": "NewPass@456"
}
```

---

### Admin Endpoints

All admin endpoints require `Authorization: Bearer <admin_token>`

#### Get Dashboard Stats
```http
GET /api/admin/dashboard

Response:
{
  "usersCount": 15,
  "storesCount": 8,
  "ratingsCount": 42
}
```

#### List Stores
```http
GET /api/admin/stores?name=electronics&sort=avgRating:desc

Response:
[
  {
    "id": 1,
    "name": "Amazing Electronics Store",
    "email": "store@test.com",
    "avgRating": 4.5,
    "ratingCount": 10
  }
]
```

#### Create Store
```http
POST /api/admin/stores

{
  "name": "Best Bookstore Collection Name",
  "email": "books@example.com",
  "address": "456 Book Avenue",
  "owner_id": 3
}
```

#### List Users
```http
GET /api/admin/users?role=user&sort=name:asc
```

#### Create User
```http
POST /api/admin/users

{
  "name": "New User Test Account Name",
  "email": "newuser@example.com",
  "password": "User@123",
  "role": "user"
}
```

#### Get User Details
```http
GET /api/admin/users/:id
```

---

### User Endpoints

All user endpoints require `Authorization: Bearer <user_token>`

#### List Stores
```http
GET /api/user/stores?name=electronics

Response:
[
  {
    "id": 1,
    "name": "Amazing Electronics Store",
    "avgRating": 4.5,
    "userRating": 5
  }
]
```

#### Submit Rating
```http
POST /api/user/ratings

{
  "store_id": 1,
  "rating": 5
}
```

#### Update Rating
```http
PATCH /api/user/ratings/:storeId

{
  "rating": 4
}
```

#### Delete Rating
```http
DELETE /api/user/ratings/:storeId
```

---

### Owner Endpoints

Requires `Authorization: Bearer <owner_token>`

#### Get Dashboard
```http
GET /api/owner/dashboard

Response:
{
  "store": {
    "id": 1,
    "name": "Amazing Electronics Store",
    "email": "store@test.com"
  },
  "avgRating": "4.50",
  "totalRatings": 10,
  "raters": [
    {
      "name": "Regular User",
      "email": "user@test.com",
      "rating": 5,
      "created_at": "2025-01-11 10:30:00"
    }
  ]
}
```

---

## 👥 User Roles & Features

### Admin
- ✅ View dashboard statistics
- ✅ Manage all users (create, view, filter)
- ✅ Manage all stores (create, view, filter)
- ✅ Assign roles to users
- ✅ Search and filter functionality

### User
- ✅ Browse all stores
- ✅ Search stores by name/address
- ✅ Submit ratings (1-5 stars)
- ✅ Update existing ratings
- ✅ Delete ratings
- ✅ View overall and personal ratings

### Owner
- ✅ View store dashboard
- ✅ Monitor average rating
- ✅ See total ratings count
- ✅ View customer ratings list
- ✅ See rating distribution

---

## ✅ Validation Rules

| Field | Rule | Example |
|-------|------|---------|
| Name | 20-60 characters | "John Doe Test User Account" |
| Email | Valid email format | user@example.com |
| Password | 8-16 chars, 1 uppercase, 1 special | Test@123 |
| Address | Max 400 characters | "123 Main St, City" |
| Rating | Integer 1-5 | 5 |

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE Users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL CHECK(length(name) >= 20 AND length(name) <= 60),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  address TEXT CHECK(length(address) <= 400),
  role TEXT NOT NULL CHECK(role IN ('admin', 'user', 'owner'))
);
```

### Stores Table
```sql
CREATE TABLE Stores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL CHECK(length(name) >= 20 AND length(name) <= 60),
  email TEXT UNIQUE NOT NULL,
  address TEXT CHECK(length(address) <= 400),
  owner_id INTEGER,
  FOREIGN KEY (owner_id) REFERENCES Users(id) ON DELETE CASCADE
);
```

### Ratings Table
```sql
CREATE TABLE Ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  store_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (store_id) REFERENCES Stores(id) ON DELETE CASCADE,
  UNIQUE(user_id, store_id)
);
```

---

## 📦 Project Structure
```
roxiler-store-rating/
├── backend/
│   ├── config/
│   │   └── database.js          # SQLite configuration
│   ├── middleware/
│   │   └── auth.js              # JWT authentication
│   ├── routes/
│   │   ├── auth.js              # Auth endpoints
│   │   ├── admin.js             # Admin endpoints
│   │   ├── user.js              # User endpoints
│   │   └── owner.js             # Owner endpoints
│   ├── server.js                # Express server
│   ├── seed.js                  # Database seeding
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── LoginForm.js
    │   │   ├── SignupForm.js
    │   │   ├── AdminDashboard.js
    │   │   ├── UserDashboard.js
    │   │   ├── OwnerDashboard.js
    │   │   └── Header.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── config/
    │   │   └── axios.js
    │   ├── App.js
    │   └── index.js
    └── package.json
```

---

## 🧪 Testing Guide

### Test Flow 1: Admin Workflow
1. Login as admin (admin@test.com / Admin@123)
2. View dashboard statistics
3. Navigate to Users tab
4. Search for a user
5. Create new store/user
6. Filter and sort data

### Test Flow 2: User Workflow
1. Signup as new user
2. Login with credentials
3. Browse stores
4. Search for specific store
5. Rate a store (1-5 stars)
6. Update the rating
7. Verify rating appears

### Test Flow 3: Owner Workflow
1. Login as owner (owner@test.com / Owner@123)
2. View store dashboard
3. Check average rating
4. View customer ratings list
5. Monitor rating distribution

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Database Corrupted
```bash
cd backend
del database.sqlite
npm run dev
node seed.js
```

### Module Not Found
```bash
cd backend
npm install

cd ../frontend
npm install
```

---

## 🎯 Features Implemented

✅ JWT-based authentication  
✅ Role-based access control (RBAC)  
✅ Password hashing with bcrypt  
✅ Input validation (frontend + backend)  
✅ CRUD operations for all entities  
✅ Search and filter functionality  
✅ Responsive UI design  
✅ Error handling and validation  
✅ SQL injection prevention  
✅ Protected API routes  

---

## 🚀 Technologies Used

**Backend:**
- Node.js
- Express.js
- SQLite3
- JWT (jsonwebtoken)
- bcrypt
- cors

**Frontend:**
- React.js
- React Router DOM
- Axios
- Context API
- CSS3

---

## 📄 License

MIT License

---

## 👨‍💻 Author

**K S Mohan Velu**
- GitHub: [@ksmohanavelu08](https://github.com/ksmohanavelu08)
- Repository: [roxiler-store-rating](https://github.com/ksmohanavelu08/roxiler-store-rating)

---

**Built for Roxiler Systems FullStack Intern Assignment** 🚀
