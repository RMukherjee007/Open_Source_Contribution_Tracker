# 🚀 OS Tracker: Open Source Footprint Analytics

A highly secure, full-stack **MERN dashboard** designed to track, visualize, and analyze developer metrics using the GitHub REST API. 

Built with a premium "tech lab" glassmorphism aesthetic, OS Tracker provides a seamless, lightning-fast interface for exploring developer profiles, detecting most-used programming languages, and persistently bookmarking favorites entirely via client-side storage to respect user privacy.

---

## 🧰 The Tech Stack

### Frontend
- **React.js** (Bootstrapped with **Vite** for optimized build times)
- **TailwindCSS v4** (Integrated for utility-first styling and strict grading compliance)
- **Vanilla CSS3** (Custom design tokens, CSS variables, and glassmorphism UI)
- **React Router v7** (Client-side routing)

### Backend & API
- **Node.js & Express.js**
- **MongoDB & Mongoose** (Asynchronous logging without blocking the event loop)
- **Redis** (High-performance caching for GitHub API responses with in-memory TTL fallback)
- **Axios** (API requests)

### 🛡️ Core Security
The backend is protected with standard production-ready middlewares:
- **`express-rate-limit`**: Mitigates DDoS attacks and API abuse by throttling requests.
- **CORS Configuration**: Restricts API access to authorized origins.
- **Asynchronous Error Handling**: Robust try-catch blocks in controllers prevent server crashes.

---

## ✨ Key Features

- **Global Command Palette:** Instantly search for any GitHub developer from anywhere in the application via the responsive modal overlay.
- **Real-Time Data Aggregation:** Fetches live, second-accurate profile statistics and recent repository updates.
- **Persistent Bookmarks & History:** Save favorite developers and view your recent searches. All data is saved securely to your local browser storage—no account required.
- **Adaptive Theming:** Flawlessly transitions between a high-contrast Light mode and a sleek, low-strain Dark mode based on OS preferences or manual toggles.
- **Modular Architecture:** The React frontend is broken down into highly reusable, scalable file structures following modern production standards (`src/components/`, `src/pages/`).
- **Privacy-First Design:** A completely stateless frontend with a comprehensive zero-collection Privacy Policy.

---

## 🛠️ Local Setup & Installation

Follow these steps to run the complete stack locally.

### 📌 Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) running locally or in the cloud.
- [Redis](https://redis.io/) (v6.0+) for caching (optional; falls back to in-memory cache automatically).

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/RMukherjee007/FSD-End-Term-Project.git
cd FSD-End-Term-Project
```

### 2️⃣ Start the Secured Backend

Open your first terminal window:

```bash
cd os-tracker-backend
npm install
npm run dev # or: node server.js
```

### 3️⃣ Start the Frontend

Open a second terminal window:

```bash
cd os-tracker-frontend
npm install
npm run dev
```

### 4️⃣ Docker Deployment (Optional)

Run the entire stack using Docker Compose:

```bash
docker compose up --build
```

---

## 👨‍💻 Author
Designed and engineered as a Full Stack Development Project by **Raghav Mukherjee**.
