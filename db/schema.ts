import { pgTable, serial, text, jsonb, timestamp, boolean, uuid, varchar, vector, integer } from "drizzle-orm/pg-core";
import z from "zod";



export const reports = pgTable("reports", {
  id: integer("id").primaryKey(),
  userId: text("user_id").notNull(), // Added user_id
  idea: text("idea").notNull(),
  result_json: jsonb("result_json").notNull(),
  report_md: text("report_md").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});


export const signUpFormSchema = z.object({
  name: z.string().min(1, { message: "Nmae is required." }),
  email: z.string().email(),
  password: z.string().min(1, { message: "Password is required" }),
  confirmPassword: z.string().min(1, { message: "Password is required" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Paswords do not match",
  path: ["confirmPassword"]
})

export const signInFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: 'Password is required' })
})

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()).notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const researchReport = pgTable("research_report", {
  id: uuid("id").defaultRandom().primaryKey(),
  idea: text("idea").notNull(),
  marketAnalysis: text("market_analysis").notNull(),
  competitorAnalysis: text("competitor_analysis").notNull(),
  keyInsights: text("key_insights").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const document_chunks = pgTable("document_chunks", {
  id: serial("id").primaryKey(),
  userId: text("user_id"), // Added optional user_id for now, but should be required ideally. Making it optional to avoid breaking existing data if any, but better to be strict? Let's make it optional for now to be safe with migration if user has data.
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  embedding: vector("embedding", { dimensions: 768 }),
  created_at: timestamp("created_at").defaultNow(),
});

export const research_sessions = pgTable("research_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  status: text("status").notNull(), // 'processing', 'completed', 'failed'
  currentStep: text("current_step"),
  logs: text("logs").array(),
  resultId: integer("result_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const chat_sessions = pgTable("chat_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sessionId: uuid("session_id").notNull().references(() => chat_sessions.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user', 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});