import {
  pgTable,
  text,
  doublePrecision,
  timestamp,
  json,
  index,
} from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"

export const verificationRecords = pgTable(
  "VerificationRecord",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    sha256: text("sha256").notNull().unique(),
    phash: text("phash"), // Perceptual hash for visual similarity matching
    verdict: text("verdict").notNull(),
    confidence: doublePrecision("confidence").notNull(),
    method: text("method"),
    result: json("result").notNull(),
    sourceUrl: text("sourceUrl"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("VerificationRecord_createdAt_idx").on(table.createdAt),
    index("VerificationRecord_phash_idx").on(table.phash),
  ]
)

export type VerificationRecord = typeof verificationRecords.$inferSelect
export type NewVerificationRecord = typeof verificationRecords.$inferInsert
