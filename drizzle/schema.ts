import {
  pgEnum,
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  numeric,
  jsonb,
} from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan", ["free", "starter", "growth", "agency"]);
export const proposalStatusEnum = pgEnum("proposal_status", [
  "draft",
  "generating",
  "ready",
  "sent",
  "accepted",
  "lost",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const verifications = pgTable("verifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  plan: planEnum("plan").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  proposalsUsed: integer("proposals_used").notNull().default(0),
  proposalsLimit: integer("proposals_limit").notNull().default(3),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull(),
  priceId: text("price_id").notNull(),
  status: text("status").notNull(),
  plan: planEnum("plan").notNull(),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const brandProfiles = pgTable("brand_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  companyName: text("company_name"),
  logo: text("logo"),
  primaryColor: text("primary_color"),
  website: text("website"),
  defaultTerms: text("default_terms"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const proposals = pgTable("proposals", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  status: proposalStatusEnum("status").notNull().default("draft"),
  clientName: text("client_name"),
  clientEmail: text("client_email"),
  briefText: text("brief_text"),
  scopeData: jsonb("scope_data").$type<Record<string, unknown> | null>(),
  timelineData: jsonb("timeline_data").$type<Record<string, unknown> | null>(),
  costData: jsonb("cost_data").$type<Record<string, unknown> | null>(),
  content: jsonb("content").$type<Record<string, unknown> | null>(),
  totalValue: numeric("total_value"),
  currency: text("currency").default("USD"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const proposalSections = pgTable("proposal_sections", {
  id: uuid("id").defaultRandom().primaryKey(),
  proposalId: uuid("proposal_id").references(() => proposals.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const scopeItems = pgTable("scope_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  proposalId: uuid("proposal_id").references(() => proposals.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  phase: text("phase"),
  effortHours: numeric("effort_hours"),
  cost: numeric("cost"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const timelinePhases = pgTable("timeline_phases", {
  id: uuid("id").defaultRandom().primaryKey(),
  proposalId: uuid("proposal_id").references(() => proposals.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  durationWeeks: integer("duration_weeks"),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const usageEvents = pgTable("usage_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id").references(() => organizations.id, { onDelete: "cascade" }).notNull(),
  proposalId: uuid("proposal_id").references(() => proposals.id, { onDelete: "set null" }),
  eventType: text("event_type").notNull(),
  metadata: jsonb("metadata")
    .$type<Record<string, unknown>>()
    .default({})
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
