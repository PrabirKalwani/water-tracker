# Hydro Tracker

Hydro Tracker is a React + Vite app with serverless API routes under `/api`, so frontend and backend can be deployed together (Next.js-style) as one project.

## Run locally

```bash
npm install
npm run dev
```

Optional: if you want to call a remote API endpoint while developing, set `VITE_API_URL`.

## API routes

The app calls:

- `GET /api/water`
- `GET /api/water/day/:date`
- `PUT /api/water/day/:date`
- `PUT /api/water/settings`

These routes are handled by Vercel functions in `/api`.

## Deploy

Deploy the repository as a single Vercel project. You do not need a separate Express server deployment.
