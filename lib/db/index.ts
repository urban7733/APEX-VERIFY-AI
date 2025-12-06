import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

const connectionString = process.env.DATABASE_URL!

const sql = neon(connectionString)

export const db = drizzle({ client: sql, schema, logger: process.env.NODE_ENV === "development" })

export * from "./schema"
