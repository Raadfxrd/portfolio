import { db } from "~/server/database/client";
import { blogPosts } from "~/server/database/schema";
import { getAuthUser, requireAuth } from "~/server/utils/auth";
import { eq } from "drizzle-orm";

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

        // An unpublished post must look identical to a missing one, otherwise
        // guessing a slug reveals that a draft exists and returns its body.
        if (!post || (!post.published && !getAuthUser(event))) {
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
        const { title, description, content, author, date, published } = body;

        const [updatedPost] = await db
            .update(blogPosts)
            .set({
                // Only overwrite fields the caller actually sent. The previous
                // `title || post.title` form silently discarded intentional
                // edits to an empty string and to `published: false`.
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(content !== undefined && { content }),
                ...(author !== undefined && { author }),
                ...(date !== undefined && { date }),
                ...(published !== undefined && { published }),
                updatedAt: new Date(),
            })
            .where(eq(blogPosts.slug, slug))
            .returning();

        if (!updatedPost) {
            throw createError({
                statusCode: 404,
                message: "Post not found",
            });
        }

        return updatedPost;
    }

    if (method === "DELETE") {
        // Delete post - protected
        await requireAuth(event);

        const [deleted] = await db
            .delete(blogPosts)
            .where(eq(blogPosts.slug, slug))
            .returning({ id: blogPosts.id });

        if (!deleted) {
            throw createError({
                statusCode: 404,
                message: "Post not found",
            });
        }

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
