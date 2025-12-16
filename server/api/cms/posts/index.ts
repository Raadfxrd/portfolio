import {db} from "~/server/database/client";
import {blogPosts} from "~/server/database/schema";
import {requireAuth} from "~/server/utils/auth";
import {eq} from "drizzle-orm";

// GET - List all blog posts
export default defineEventHandler(async (event) => {
    const method = event.method;

    if (method === "GET") {
        // Public endpoint - only return published posts unless authenticated
        try {
            await requireAuth(event);
            // Authenticated - return all posts

            return await db.select().from(blogPosts);
        } catch {
            // Not authenticated - return only published posts
            return await db
                .select()
                .from(blogPosts)
                .where(eq(blogPosts.published, true));
        }
    }

    if (method === "POST") {
        // Protected endpoint - create new blog post
        await requireAuth(event);

        const body = await readBody(event);
        const {slug, title, description, content, author, date, published} = body;

        if (!slug || !title || !description || !content || !author || !date) {
            throw createError({
                statusCode: 400,
                message: "Missing required fields",
            });
        }

        // Check if slug already exists
        const existing = await db
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.slug, slug))
            .limit(1);

        if (existing.length > 0) {
            throw createError({
                statusCode: 400,
                message: "A post with this slug already exists",
            });
        }

        await db.insert(blogPosts).values({
            slug,
            title,
            description,
            content,
            author,
            date,
            published: published || false,
        });

        // Fetch and return the newly created post
        const [newPost] = await db
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.slug, slug))
            .limit(1);

        return newPost;
    }

    throw createError({
        statusCode: 405,
        message: "Method not allowed",
    });
});
