import { db } from "~/server/database/client";
import { blogPosts } from "~/server/database/schema";
import { getAuthUser, requireAuth } from "~/server/utils/auth";
import { eq } from "drizzle-orm";

/**
 * Columns returned by the list endpoint.
 *
 * `content` is deliberately excluded: this list is rendered by the footer on
 * every page, plus the home, blog index, sitemap and CMS pages, and none of
 * them display the post body. Including it made every page load carry the full
 * markdown of every post.
 */
const listColumns = {
    id: blogPosts.id,
    slug: blogPosts.slug,
    title: blogPosts.title,
    description: blogPosts.description,
    author: blogPosts.author,
    date: blogPosts.date,
    published: blogPosts.published,
    createdAt: blogPosts.createdAt,
    updatedAt: blogPosts.updatedAt,
};

export default defineEventHandler(async (event) => {
    const method = event.method;

    if (method === "GET") {
        const query = db.select(listColumns).from(blogPosts);

        // Drafts are only visible to a signed-in admin.
        if (getAuthUser(event)) {
            return await query;
        }

        return await query.where(eq(blogPosts.published, true));
    }

    if (method === "POST") {
        // Protected endpoint - create new blog post
        await requireAuth(event);

        const body = await readBody(event);
        const { slug, title, description, content, author, date, published } = body;

        if (!slug || !title || !description || !content || !author || !date) {
            throw createError({
                statusCode: 400,
                message: "Missing required fields",
            });
        }

        // The slug becomes a public URL segment, so keep it to a safe shape.
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
            throw createError({
                statusCode: 400,
                message:
                    "Slug must contain only lowercase letters, numbers and single hyphens",
            });
        }

        // Check if slug already exists
        const existing = await db
            .select({ id: blogPosts.id })
            .from(blogPosts)
            .where(eq(blogPosts.slug, slug))
            .limit(1);

        if (existing.length > 0) {
            throw createError({
                statusCode: 400,
                message: "A post with this slug already exists",
            });
        }

        const [newPost] = await db
            .insert(blogPosts)
            .values({
                slug,
                title,
                description,
                content,
                author,
                date,
                published: published || false,
            })
            .returning();

        return newPost;
    }

    throw createError({
        statusCode: 405,
        message: "Method not allowed",
    });
});
