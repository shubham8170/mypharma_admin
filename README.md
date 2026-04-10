# MyPharma Admin (React)

Initial React + TypeScript admin app scaffold based on the provided Figma project intent.

## Run

```bash
npm install
npm run dev
```

## Backend Integration

- Default API base is `http://localhost:3000/api/v1`.
- Override with env:

```bash
cp .env.example .env
# edit VITE_API_BASE_URL if needed
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
