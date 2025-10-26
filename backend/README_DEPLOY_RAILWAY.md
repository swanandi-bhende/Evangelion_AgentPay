# Deploying the backend to Railway

This file documents the minimal steps to deploy the `backend` service to Railway.

1) Connect your GitHub repo
   - On Railway, create a new project and connect your GitHub repository (select the `backend` folder if using monorepo).

2) Set environment variables (Railway > Variables)
   - Add the variables from `.env.example` as project variables / secrets:
     - SENDER_ACCOUNT_ID
     - SENDER_PRIVATE_KEY
     - RECIPIENT_ACCOUNT_ID
     - TOKEN_ID
     - GEMINI_API_KEY
     - (Optional) PORT — Railway provides one automatically, but app reads process.env.PORT

3) Build & Start commands
   - Railway will run `npm install` automatically.
   - We added a `postinstall` script that runs `npm run build` so the TypeScript build runs during install.
   - The Procfile contains `web: npm run start` which runs `node dist/server.js`.

4) Verification
   - Once deployed, check the logs on Railway and open the health endpoint:
     - /api/health

5) Notes & troubleshooting
   - If your deployment shows "module not found" for TypeScript output, ensure the `postinstall` script ran and `dist/server.js` exists.
   - You can also set the build command explicitly in Railway to `npm run build` and the start command to `npm run start`.
   - For local testing, copy `.env.example` to `.env` and run `npm install` then `npm run build` and `npm run start` (or `npm run dev` for hot reload).

Optional: Deploying with Docker (Railway supports containers)
   - A simple `Dockerfile` is included. If you prefer container deployment, point Railway to the Dockerfile.
