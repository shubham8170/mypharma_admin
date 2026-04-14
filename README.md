# MyPharma Admin (React)

Initial React + TypeScript admin app scaffold based on the provided Figma project intent.

## Run

```bash
npm install
npm run dev
```

## Backend Integration

- The API base URL is read **only** from `VITE_API_BASE_URL` in `.env` (no fallback in code). Create your env file before running the app:

```bash
cp .env.example .env
# set VITE_API_BASE_URL to your API root, e.g. http://13.205.250.230/api
```

- Login uses `POST /auth/login` with your admin credentials.
- On app boot, auth state is validated using `GET /auth/me`.

## Build

```bash
npm run build
npm run preview
```

## API Documentation

See `docs/api-contract.md` for required backend APIs and payloads.

## Note

The Figma MCP request was rate-limited during generation. After access is restored, UI can be updated to exact visual parity from the target nodes.
