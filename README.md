# Task Manager Backend

A RESTful API for a Task Manager application built with **Node.js**, **Express**, **Supabase**, and **JWT authentication**.

The project provides user authentication, task management, request validation, and secure authorization using **Access Tokens** and **Refresh Tokens**.

---

## ✨ Features

* User registration
* User login
* JWT Access Token authentication
* Refresh Token flow
* User logout
* CRUD operations for tasks
* Protected routes
* Request validation with Zod
* Centralized error handling
* Password hashing with bcrypt

---

## 🛠️ Technologies

* Node.js
* Express.js
* Supabase
* PostgreSQL
* JSON Web Token (JWT)
* bcrypt
* Zod
* cookie-parser
* dotenv

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/morva1n/task-manager-backend.git
cd task-manager-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

```env
PORT=

SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=

JWT_KEY=
JWT_REFRESH_KEY=
```

### 4. Start the development server

```bash
npm run dev
```

---

## 🔐 Authentication

Authentication is based on **JWT**.

* Access Token is returned in the response.
* Refresh Token is stored in an **HTTP-only cookie**.
* Protected routes require the following header:

```http
Authorization: Bearer <access_token>
```

---

## 📌 API Endpoints

### Authentication

| Method | Endpoint        | Description                 |
| :----: | :-------------- | :-------------------------- |
|  POST  | `/registration` | Register a new user         |
|  POST  | `/login`        | Login                       |
|  POST  | `/refresh`      | Generate a new Access Token |
|  POST  | `/logout`       | Logout                      |

### Tasks

| Method | Endpoint              | Description            |
| :----: | :-------------------- | :--------------------- |
|   GET  | `/tasks`              | Get all user tasks     |
|  POST  | `/tasks`              | Create a task          |
|  PATCH | `/tasks/:id`          | Update a task          |
|  PATCH | `/tasks/:id/complete` | Toggle task completion |
| DELETE | `/tasks/:id`          | Delete a task          |

---

## ✅ Validation

Incoming request data is validated using **Zod** before reaching the controllers.

Validation includes:

* Email format validation
* Password length validation
* Required fields validation
* Task data validation
* Returning multiple validation errors in a single response

---

## 👨‍💻 Author

**Morva1n**

GitHub: https://github.com/morva1n

---

## 📄 License

This project is licensed under the **MIT License**.
