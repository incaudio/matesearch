import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations/d1",
  schema: "./server/db/schema.d1.ts",
  dialect: "sqlite",
  driver: "d1-http",
});
