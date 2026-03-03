# Whip4You

This repository contains two separate applications:

* **Frontend** – a React/Vite single‑page app built in the root of the repo.
* **Backend** – an Express/Mongo API located in the `backend/` directory.

The two can be developed together or deployed independently.

---

## Development

### Frontend

```bash
# install dependencies from repo root
npm install

# start Vite dev server
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev         # runs `tsx index.ts`
```

The frontend will proxy API calls to the URL stored in `VITE_API_BASE`.
By default it points at `http://localhost:3000` which is where the backend
listens in development.

## Production build / deployment

1. **Backend**
   * Configure environment variables (`MONGODB_URI`, `JWT_SECRET`,
     `CLOUDINARY_*`, `CORS_ORIGIN`, etc.) using a `.env` file or your
     provider's secrets feature.
   * Install and build (no build step required, it's plain TS running via
     `tsx` or compiled to JS):
     ```bash
     cd backend
     npm install
     npm run start
     ```
   * Host the service on any Node‑capable platform. The app listens on
     `process.env.PORT || 3000`.

2. **Frontend**
   * Set `VITE_API_BASE` to the public URL of the backend (e.g.
     `https://api.whip4you.com`). Put this in `.env.production` or on the
     host.
   * Build and deploy the static assets:
     ```bash
     npm install
     npm run build
     ```
   * Point your static host (Vercel, Netlify, S3, etc.) at the generated
     `dist/` directory.

3.  If the two applications are on different origins, make sure the
    backend's `CORS_ORIGIN` value matches the frontend domain (or use
    `*` during testing).

---

## Notes

* `server.ts` at the repo root is a lightweight shim importing
  `backend/index.ts`. It remains for backwards compatibility but the
  frontend no longer depends on it.
* API client code in `api.ts` respects the `VITE_API_BASE` environment
  variable so that requests can target an external host.

Happy hacking!