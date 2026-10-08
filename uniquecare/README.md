# Unicare (Ucare) — Full-Stack Monorepo

Welcome to **Unicare (Ucare)**, a Smart Lab Maintenance & Automation System built for The Uniques Community.

This repository is structured as a decoupled full-stack architecture with separated `frontend` and `backend` applications.

---

## 📁 Project Structure

```text
uniquecare/
│
├── frontend/                     # React + Vite Frontend Application
│   ├── public/                   # Static assets & public resources
│   ├── src/
│   │   ├── assets/               # Image & vector assets
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Page components & views
│   │   ├── services/             # API client & services layer
│   │   ├── hooks/                # Custom React hooks
│   │   ├── App.tsx               # Main React Application
│   │   ├── main.tsx              # Entry point
│   │   └── style.css             # TailwindCSS & Global styles
│   ├── index.html                # HTML Template
│   ├── package.json              # Frontend dependencies & scripts
│   ├── tsconfig.json             # TypeScript configuration
│   └── vite.config.ts            # Vite bundler configuration
│
├── backend/                      # Node.js + Express Backend Service
│   ├── src/
│   │   ├── controllers/          # Request handlers & logic
│   │   │   └── healthController.js
│   │   ├── routes/               # API route definitions
│   │   │   └── healthRoutes.js
│   │   ├── models/               # Data & Database models
│   │   ├── middleware/           # Express middleware (CORS, Error Handling)
│   │   │   └── errorHandler.js
│   │   ├── services/             # Business logic & external integrations
│   │   └── server.js             # Express server entry point
│   ├── .env                      # Environment variables
│   ├── .env.example              # Environment variables template
│   └── package.json              # Backend dependencies & scripts
│
├── .gitignore                    # Global git ignore rules
└── README.md                     # Project documentation
```

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js**: `v18+` recommended
- **npm**: `v9+` recommended

---

### 1️⃣ Frontend Setup

Navigate to the `frontend` directory and install dependencies:

```bash
cd frontend
npm install
```

#### Run Frontend Development Server

```bash
npm run dev
```

- **Frontend Application URL**: [http://localhost:5173](http://localhost:5173)

#### Build Frontend for Production

```bash
npm run build
```

---

### 2️⃣ Backend Setup

Navigate to the `backend` directory and install dependencies:

```bash
cd backend
npm install
```

#### Environment Configuration

Create a `.env` file inside the `backend/` directory (or use default values):

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
```

#### Run Backend Development Server (with Auto-Reload)

```bash
npm run dev
```

#### Run Backend Production Server

```bash
npm start
```

- **Backend API Base URL**: [http://localhost:5000](http://localhost:5000)
- **Health Check Endpoint**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description | Sample Response |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API Welcome message | `{"success": true, "message": "Welcome to Ucare API Server"}` |
| `GET` | `/api/health` | Health Check Endpoint | `{"success": true, "message": "Ucare backend is running"}` |

---

## 🌐 Application URLs

- **Frontend URL**: `http://localhost:5173`
- **Backend API URL**: `http://localhost:5000`
- **Health API URL**: `http://localhost:5000/api/health`
