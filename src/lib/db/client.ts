import { neon } from "@neondatabase/serverless";
import { prisma } from "../prisma";

const DEFAULT_DATABASE_URL =
  "postgresql://neondb_owner:npg_3HBMrzVEeXi8@ep-ancient-fire-ay9nsm0h-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&connection_limit=5&pool_timeout=20";

const databaseUrl =
  process.env.DATABASE_URL && process.env.DATABASE_URL.trim()
    ? process.env.DATABASE_URL.trim()
    : DEFAULT_DATABASE_URL;

export const sql = neon(databaseUrl);
export { prisma };
