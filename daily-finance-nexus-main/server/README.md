# DFCS Back-End (Express + MongoDB)

## Prerequisites
1. **Node.js 18+**
2. **MongoDB Atlas** (or local MongoDB) connection string

## Setup
```bash
cd server
cp .env.example .env   # edit with your values
npm install
npm run dev            # starts on http://localhost:4000
```

The API root returns `{ message: 'DFCS API running' }`.

## Environment variables (`.env`)
| Key | Description |
|---|---|
| `MONGODB_URI` | Mongo connection string |
| `JWT_SECRET`  | Secret for signing JWTs |
| `PORT`        | (optional) API port |

## Endpoints (summary)
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create finance or shopkeeper account |
| POST | `/api/auth/login` | Obtain JWT |
| GET | `/api/loans` | List loans |
| POST | `/api/loans` | Add loan |
| PUT | `/api/loans/:id` | Update loan |
| DELETE | `/api/loans/:id` | Delete loan |
| GET | `/api/payments?loanId=` | List payments |
| POST | `/api/payments` | Record payment/missed |

## Dev workflow
Use Vite’s proxy in `vite.config.ts` (`/api` → `http://localhost:4000`) so the React app can call the API without CORS issues.

---
Feel free to extend models and routes as required.
