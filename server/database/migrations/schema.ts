import {boolean, index, pgTable, serial, text, timestamp, unique, varchar,} from "drizzle-orm/pg-core";

export const users = pgTable(
    "users",
    {
        id: serial().primaryKey().notNull(),
        username: varchar({length: 255}).notNull(),
        password: varchar({length: 255}).notNull(),
        email: varchar({length: 255}).notNull(),
        createdAt: timestamp("created_at", {mode: "string"})
            .defaultNow()
            .notNull(),
    },
    (table) => [
        unique("users_username_key").on(table.username),
        unique("users_email_key").on(table.email),
    ],
);

export const newsletter = pgTable(
    "newsletter",
    {
        id: serial().primaryKey().notNull(),
        email: varchar({length: 255}).notNull(),
        subscribedAt: timestamp("subscribed_at", {mode: "string"})
            .defaultNow()
            .notNull(),
        active: boolean().default(true).notNull(),
    },
    (table) => [
        index("idx_newsletter_active").using(
            "btree",
            table.active.asc().nullsLast().op("bool_ops"),
        ),
        index("idx_newsletter_email").using(
            "btree",
            table.email.asc().nullsLast().op("text_ops"),
        ),
        unique("newsletter_email_key").on(table.email),
    ],
);

export const blogPosts = pgTable(
    "blog_posts",
    {
        id: serial().primaryKey().notNull(),
        slug: varchar({length: 255}).notNull(),
        title: varchar({length: 255}).notNull(),
        description: text().notNull(),
        content: text().notNull(),
        author: varchar({length: 255}).notNull(),
        date: varchar({length: 10}).notNull(),
        published: boolean().default(false).notNull(),
        createdAt: timestamp("created_at", {mode: "string"})
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", {mode: "string"})
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("idx_blog_posts_published").using(
            "btree",
            table.published.asc().nullsLast().op("bool_ops"),
        ),
        index("idx_blog_posts_slug").using(
            "btree",
            table.slug.asc().nullsLast().op("text_ops"),
        ),
        unique("blog_posts_slug_key").on(table.slug),
    ],
);
