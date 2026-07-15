# Gatekeep - Secure Full-Stack JWT Authentication Portal

Gatekeep is a secure, modern full-stack Login/Logout application engineered with a monorepo architecture using **React (Vite + TypeScript)** for the frontend, **Node.js (Express + TypeScript)** for the backend, and **MySQL (AWS RDS)** for the database layer.

---

## 🚀 Key Features

*   **Secure Session Authentication:** Implements stateless **JSON Web Tokens (JWT)** for session validation.
*   **Cryptographic Password Hashing:** User passwords are salted and hashed using **bcrypt** (via `bcryptjs` with a work factor of 10) prior to database insertion.
*   **Client Route Protection:** Encapsulated React components (`ProtectedRoute`) guard authentic pages and handle unauthorized redirection.
*   **Automatic Session Restoration:** Automatically verifies active sessions by retrieving stored JWTs on load and contacting the backend `/api/auth/me` endpoint.
*   **SQL Injection Mitigation:** Deploys query parameters and parameter binding exclusively across all MySQL operations.
*   **Modern Visual Aesthetics:** A responsive, dark-mode user interface featuring glassmorphic panel controls, active field focus states, password visibility toggles, and live session status monitoring.

---

## 📂 Project Structure

```
gatekeep/
├── client/                 # React (Vite + TS) Application
│   ├── src/
│   │   ├── components/     # UI Components (Login, Register, Dashboard, ProtectedRoute)
│   │   ├── context/        # React Context Providers (AuthContext)
│   │   ├── App.tsx         # Main router and route definitions
│   │   ├── index.css       # Premium CSS styling system (Dark theme, glassmorphism)
│   │   └── main.tsx        # React mounting entry point
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Express (Node.js + TS) Backend
│   ├── src/
│   │   ├── config/         # Database connection pool settings (db.ts)
│   │   ├── controllers/    # Route controllers (authController.ts)
│   │   ├── middleware/     # JWT authentication parser (auth.ts)
│   │   ├── routes/         # Router paths (authRoutes.ts)
│   │   ├── index.ts        # App bootstrapper
│   │   └── types.ts        # TypeScript Request interface extensions
│   ├── package.json
│   └── tsconfig.json
├── database/               # SQL Schemas
│   └── schema.sql          # MySQL tables schema + bcrypt usage notes
└── package.json            # Root monorepo workspace configurations
```

---

## 🛠️ Installation & Setup

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
*   [MySQL](https://www.mysql.com/) (Local server or AWS RDS instance)

### 1. Repository Setup
Clone the repository and install all workspace dependencies from the root directory:
```bash
# Installs dependencies for root, client, and server workspaces in one step
npm install
```

### 2. Database Schema Import
Run the schema definitions against your MySQL server to initialize the database:
```bash
# If using a local MySQL server:
mysql -u root -p < database/schema.sql

# If using an AWS RDS instance (replace host and user parameters):
mysql -h <rds-endpoint> -P 3306 -u <master-user> -p < database/schema.sql
```

### 3. Server Configuration
Create a `.env` file in the `server/` directory by copying the template:
```bash
cp server/.env.example server/.env
```
Open [server/.env](server/.env) and populate it with your database and JWT secret configurations:
```env
PORT=5000
DB_HOST=your-mysql-host (e.g. 127.0.0.1 or rds-endpoint.amazonaws.com)
DB_PORT=3306
DB_USER=your-database-username
DB_PASSWORD=your-database-password
DB_NAME=gatekeep_db
JWT_SECRET=use-a-strong-custom-passphrase
JWT_EXPIRES_IN=24h
```

---

## ⚡ Running the Application

Start the development environments for both the Express server and Vite React client concurrently:

```bash
# From the root directory
npm run dev
```

*   **Vite React Frontend:** [http://localhost:5173](http://localhost:5173)
*   **Express Auth API:** [http://localhost:5000](http://localhost:5000)
*   **API Health Status:** [http://localhost:5000/health](http://localhost:5000/health)

---

## 🔒 Security Implementations

1.  **CORS Hardening:** Configured in `server/src/index.ts` to only accept connections from the client origins with credentials (cookies/auth headers) allowed.
2.  **Stateless Session Validation:** JWTs are issued upon login with a preset expiration period (`JWT_EXPIRES_IN`). Token validity is parsed cryptographically without querying the database for every action, optimizing processing time.
3.  **Encrypted Sign-up Passwords:** Hashes plain-text passwords using a cryptographically secure hash function (`bcryptjs`) before saving to persistent storage.
4.  **Database Protection:** Prevents SQL Injection attacks by compiling prepared statements and binding request payloads to SQL placeholders.
