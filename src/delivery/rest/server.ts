import { buildApp } from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const app = buildApp();

app.listen(PORT, () => {
  console.log(`[post-validator] listening on http://localhost:${PORT}`);
});
