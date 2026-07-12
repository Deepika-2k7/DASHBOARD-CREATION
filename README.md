# Student Task Dashboard

A friendly full-stack dashboard for daily student submissions. The student side is designed to feel motivating and lightweight, while the admin side stays clean and practical.

## Project structure

```text
Dashboard/
├── client/                  # React + TypeScript + Vite + Chakra UI
│   ├── src/
│   │   ├── api/             # Axios API client
│   │   ├── components/      # Reusable UI pieces
│   │   ├── contexts/        # Auth state
│   │   ├── hooks/           # Toast helper
│   │   ├── pages/           # Login, student, admin screens
│   │   └── theme/           # Chakra theme setup
│   └── .env.example
├── server/                  # Express + TypeScript + MongoDB + JWT
│   ├── src/
│   │   ├── config/          # Env and database connection
│   │   ├── controllers/     # Route logic
│   │   ├── middleware/      # Auth and role guards
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── utils/           # JWT, dates, leaderboard helpers
│   │   ├── index.ts         # Server entry point
│   │   └── seed.ts          # Demo data seeding
│   └── .env.example
└── package.json             # Convenience scripts
```

## Features

- Admin can add one daily task with a deadline
- Students can log in individually and submit once per task
- Submission lock prevents late work
- Leaderboard rewards completion, on-time work, and streaks
- Student dashboard includes streak, progress, friendly messaging, and top-3 highlights

## Backend overview

- `POST /api/auth/login` logs in a user and returns a JWT
- `GET /api/tasks` returns all tasks, plus student-friendly status flags
- `POST /api/tasks` allows admins to create daily tasks
- `POST /api/submissions` accepts student submissions only before the deadline
- `GET /api/leaderboard` calculates rankings in descending order by score

Score formula:

- `completed tasks * 10`
- `on-time submissions * 5`
- `current streak * 3`

## Frontend overview

- Student dashboard uses cards instead of tables
- Big submit action and simple modal flow
- Friendly locked-state copy
- Light gradient background, rounded UI, soft palette, and clear spacing
- Admin panel stays clean and practical without over-gamifying

## Local setup

1. Copy `server/.env.example` to `server/.env`
2. Copy `client/.env.example` to `client/.env`
3. Install dependencies:

```bash
npm run install:all
```

4. Start MongoDB locally
5. Seed demo data:

```bash
npm run seed --prefix server
```

6. Run the backend and frontend in separate terminals:

```bash
npm run dev:server
npm run dev:client
```

## Demo accounts

- Admin: `ava` / `password123`
- Student: `liam` / `password123`
- Student: `maya` / `password123`
- Student: `noah` / `password123`

## Beginner notes

- The server expects MongoDB running on `mongodb://127.0.0.1:27017/student-task-dashboard` by default
- Vite frontend runs on `http://localhost:5173`
- Express API runs on `http://localhost:5000`
- If you want more students, insert them into the `users` collection or expand `server/src/seed.ts`
