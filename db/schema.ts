import { sql } from "drizzle-orm";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const studies = sqliteTable(
  "studies",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    book: text("book").notNull(),
    chapters: text("chapters").notNull(),
    title: text("title").notNull(),
    generationMode: text("generation_mode", { enum: ["daily", "deep"] }).notNull().default("deep"),
    academicJson: text("academic_json").notNull(),
    devotionalJson: text("devotional_json"),
    readerPrompt: text("reader_prompt").notNull().default(""),
    notes: text("notes").notNull().default(""),
    journeyJson: text("journey_json"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_studies_user_created").on(table.userId, table.createdAt)],
);

export const readerProfiles = sqliteTable("reader_profiles", {
  userId: text("user_id").primaryKey(),
  preferredName: text("preferred_name").notNull().default(""),
  avatarData: text("avatar_data"),
  defaultMode: text("default_mode", { enum: ["daily", "deep"] }).notNull().default("daily"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
