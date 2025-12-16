import {boolean, integer, pgTable, text, timestamp, varchar,} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    username: varchar("username", {length: 255}).notNull().unique(),
    password: varchar("password", {length: 255}).notNull(),
    email: varchar("email", {length: 255}).notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    slug: varchar("slug", {length: 255}).notNull().unique(),
    title: varchar("title", {length: 255}).notNull(),
    description: text("description").notNull(),
    content: text("content").notNull(),
    author: varchar("author", {length: 255}).notNull(),
    date: varchar("date", {length: 10}).notNull(),
    published: boolean("published").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const newsletter = pgTable("newsletter", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    email: varchar("email", {length: 255}).notNull().unique(),
    subscribedAt: timestamp("subscribed_at").notNull().defaultNow(),
    active: boolean("active").notNull().default(true),
});
