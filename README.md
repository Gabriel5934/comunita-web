# Comunita Web

React + TypeScript + Vite frontend with TanStack Router, React Query, Material UI, React Hook Form, and Zod.

```sh
npm install
npm run dev
```

The development server runs on `http://localhost:5174` and proxies API requests
to `http://localhost:8000`. Set `VITE_API_URL` when the production API is hosted
on a different origin.

Routes include:

- `/register` and `/login` for persisted email authentication
- `/home` for building selection and entrance-form creation
- `/liberar/{building-slug}` for the public entrance form
