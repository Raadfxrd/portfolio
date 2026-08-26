export interface BlogPostSummary {
    id: number;
    slug: string;
    title: string;
    description: string;
    author: string;
    date: string;
    published: boolean;
    path: string;
}

/**
 * Published posts, newest first.
 *
 * Every caller shares the `blog-posts` key so Nuxt deduplicates the request.
 * The footer renders on every page alongside the home / blog / sitemap
 * listings, and each of those used to issue its own call to the same endpoint.
 */
export function useBlogPosts() {
    return useAsyncData<BlogPostSummary[]>(
        "blog-posts",
        async () => {
            const data = await $fetch<Omit<BlogPostSummary, "path">[]>(
                "/api/cms/posts",
            );

            if (!Array.isArray(data)) return [];

            return data
                .filter((post) => post.published)
                .map((post) => ({ ...post, path: `/blog/${post.slug}` }))
                .sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
                );
        },
        { default: () => [] },
    );
}
