# 🗳️ Poll Voting System

A full-stack poll voting system built with React, Node.js/Express, and PostgreSQL.

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Setup PostgreSQL

Create the database and run the schema:

```bash
psql -U postgres -c "CREATE DATABASE poll_voting_db;"
psql -U postgres -d poll_voting_db -f server/config/schema.sql
```

### 3. Configure Environment

```bash
cp server/.env.example server/.env
# Edit server/.env with your DB credentials and JWT secret
```

### 4. Run the App

```bash
# Terminal 1 — Start backend
cd server
npm run dev    # uses nodemon for hot reload

# Terminal 2 — Start frontend
cd client
npm start
```

- Frontend: http://localhost:3000  
- Backend API: http://localhost:5000

---

## 🔐 Default Admin Account

| Field    | Value                   |
|----------|-------------------------|
| Email    | admin@pollsystem.com    |
| Password | password                |
| Role     | admin                   |

> ⚠️ Change this password in production!

---

## 🏗️ Project Structure

```
poll-voting-system/
├── client/                   # React frontend
│   └── src/
│       ├── charts/           # PieChart & BarChart (Chart.js)
│       ├── components/       # Navbar, PollCard
│       ├── pages/            # All page components
│       ├── services/         # Axios API layer + AuthContext
│       ├── App.js            # Router & route guards
│       └── App.css           # Global styles
│
├── server/                   # Node/Express backend
│   ├── config/
│   │   ├── db.js             # PostgreSQL pool
│   │   └── schema.sql        # Database DDL
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── pollController.js
│   │   └── voteController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT + role guards
│   │   └── upload.js         # Multer config
│   ├── routes/
│   │   ├── auth.js
│   │   ├── polls.js
│   │   └── votes.js
│   ├── uploads/              # Temp file storage
│   └── server.js             # App entry point
│
└── docs/
    ├── example_poll.csv
    ├── example_poll.json
    └── example_poll.txt
```

---

## 📡 API Reference

### Auth
| Method | Endpoint              | Description          | Auth |
|--------|-----------------------|----------------------|------|
| POST   | /api/auth/register    | Register user        | ❌   |
| POST   | /api/auth/login       | Login & get token    | ❌   |
| GET    | /api/auth/me          | Get current user     | ✅   |

### Polls
| Method | Endpoint              | Description          | Auth     |
|--------|-----------------------|----------------------|----------|
| GET    | /api/polls            | List all polls       | ✅       |
| GET    | /api/polls/:id        | Get poll + options   | ✅       |
| POST   | /api/polls            | Create poll          | Admin    |
| DELETE | /api/polls/:id        | Delete poll          | Admin    |
| GET    | /api/polls/:id/results| Get results + stats  | ✅       |
| POST   | /api/polls/upload     | Create from file     | Admin    |

### Voting
| Method | Endpoint              | Description          | Auth |
|--------|-----------------------|----------------------|------|
| POST   | /api/vote             | Cast a vote          | ✅   |
| GET    | /api/votes/my         | My voting history    | ✅   |

---

## 📁 File Upload Format

### CSV
```csv
title,option
Best Language,Python
Best Language,JavaScript
Best Language,Go
```

### JSON
```json
{
  "title": "Best Language",
  "description": "Optional",
  "options": ["Python", "JavaScript", "Go"]
}
```

### TXT (line 1 = title, remaining lines = options)
```
Best Language
Python
JavaScript
Go
```

---

## 🛡️ Security Features

- **JWT Authentication** — stateless token-based auth
- **bcrypt password hashing** — 10 salt rounds
- **One vote per user** — enforced by `UNIQUE(user_id, poll_id)` DB constraint
- **Role-based access** — admin vs user middleware guards
- **Poll expiry validation** — backend rejects votes on expired polls
- **File type validation** — only CSV, JSON, TXT allowed

---

## 🧠 DSA Concepts Applied

| Concept | Where Used |
|---------|-----------|
| Hashing | bcrypt password hashing, JWT signatures |
| Set (uniqueness) | `UNIQUE(user_id, poll_id)` prevents duplicate votes |
| Sorting | Results sorted by vote count DESC (winner detection) |
| Counting | Vote aggregation with SQL `COUNT()` |
| Parsing | CSV/JSON/TXT file parsing for auto poll creation |

---

## 🔮 Future Enhancements

- Real-time updates with Socket.io
- Poll countdown timer on UI
- Search & filter polls
- Analytics dashboard with trends
- Email notifications
- OAuth (Google/GitHub login)
