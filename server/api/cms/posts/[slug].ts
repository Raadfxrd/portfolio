import {db} from "~/server/database/client";
import {blogPosts} from "~/server/database/schema";
import {requireAuth} from "~/server/utils/auth";
import {eq} from "drizzle-orm";

export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, "slug");
    const method = event.method;

    if (!slug) {
        throw createError({
            statusCode: 400,
            message: "Slug is required",
        });
    }

    if (method === "GET") {
        // Get single post
        const [post] = await db
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.slug, slug))
            .limit(1);

        if (!post) {
            throw createError({
                statusCode: 404,
                message: "Post not found",
            });
        }

        return post;
    }

    if (method === "PUT") {
        // Update post - protected
        await requireAuth(event);

        const body = await readBody(event);
        const {title, description, content, author, date, published} = body;

        const [post] = await db
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.slug, slug))
            .limit(1);

        if (!post) {
            throw createError({
                statusCode: 404,
                message: "Post not found",
            });
        }

        await db
            .update(blogPosts)
            .set({
                title: title || post.title,
                description: description || post.description,
                content: content || post.content,
                author: author || post.author,
                date: date || post.date,
                published: published !== undefined ? published : post.published,
                updatedAt: new Date(),
            })
            .where(eq(blogPosts.slug, slug));

        // Fetch and return the updated post
        const [updatedPost] = await db
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.slug, slug))
            .limit(1);

        return updatedPost;
    }

    if (method === "DELETE") {
        // Delete post - protected
        await requireAuth(event);

        const [post] = await db
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.slug, slug))
            .limit(1);

        if (!post) {
            throw createError({
                statusCode: 404,
                message: "Post not found",
            });
        }

        await db.delete(blogPosts).where(eq(blogPosts.slug, slug));

        return {
            success: true,
            message: "Post deleted successfully",
        };
    }

    throw createError({
        statusCode: 405,
        message: "Method not allowed",
    });
});
