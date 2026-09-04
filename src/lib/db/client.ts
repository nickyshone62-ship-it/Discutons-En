import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV !== "production") {
  console.warn(
    "⚠️ DATABASE_URL n'est pas encore définie dans .env.local (Phase 2)."
  );
}

export const sql = neon(
  databaseUrl || "postgres://unconfigured:unconfigured@localhost:5432/discutons_en"
);
