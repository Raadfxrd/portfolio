# Sitemap Developer Guide

The sitemap at `/sitemap` is a **human-readable page**, not an XML sitemap for search engines. It lists the
site's main pages, legal pages, published blog posts and a few external links.

It is **semi-automatic**: blog posts appear on their own, but a new static page must be registered in three
maps before it shows up. This guide explains why, and what to edit.

## Table of Contents

- [Architecture](#architecture)
- [Adding a new page](#adding-a-new-page)
- [How blog posts are discovered](#how-blog-posts-are-discovered)
- [External links](#external-links)
- [Troubleshooting](#troubleshooting)

## Architecture

Everything lives in a single file: [`pages/sitemap.vue`](../pages/sitemap.vue).

It combines two sources.

**1. Static pages — from the Vue Router registry**

```ts
const router = useRouter();
const routes = router.getRoutes();
```

`getRoutes()` returns every route Nuxt generated from `pages/`. That list is then filtered against a
hand-maintained category map:

```ts
const mainPages = routes.filter((route) => {
  const path = route.path;
  return (
    pageCategories[path] === "main" &&
    !path.includes(":") &&   // skip dynamic routes like /blog/:slug
    path !== "/sitemap"      // don't list the sitemap on itself
  );
});
```

This is the semi-automatic part. Creating `pages/foo.vue` registers the route, but because
`pageCategories["/foo"]` is undefined, the filter drops it. **A new page is invisible until you add it to the
maps.**

That is a deliberate trade-off: it keeps admin routes (`/admin/login`, `/cms`) and utility routes
(`/newsletter/unsubscribe`) off the public sitemap without needing an exclusion list.

**2. Blog posts — from the database**

```ts
const { data: posts } = await useBlogPosts();
```

Fully automatic. See [below](#how-blog-posts-are-discovered).

### The three maps

| Map | Purpose | Fallback if missing |
| --- | --- | --- |
| `pageCategories` | `"main"` or `"legal"`. **Controls whether the page appears at all.** | Page is omitted entirely |
| `pageTitles` | Display name | Last path segment |
| `pageDescriptions` | One-line summary | `"Explore this page"` |

Only `pageCategories` is load-bearing. The other two degrade to something usable, but the fallbacks read
poorly — fill in all three.

## Adding a new page

Say you have just created `pages/uses.vue`.

Open [`pages/sitemap.vue`](../pages/sitemap.vue) and add one entry to each map:

```ts
const pageDescriptions: Record<string, string> = {
  // ...
  "/uses": "The hardware and software I use day to day",
};

const pageTitles: Record<string, string> = {
  // ...
  "/uses": "Uses",
};

const pageCategories: Record<string, "main" | "legal"> = {
  // ...
  "/uses": "main",
};
```

That's it — no build step, no separate config file.

### Choosing a category

- **`"main"`** — content pages a visitor would browse: `/`, `/projects`, `/services`, `/interests`,
  `/contact`, `/blog`.
- **`"legal"`** — policy pages, rendered in their own section: `/privacy`, `/terms`.

`"main"` entries are sorted with `/` pinned first, then alphabetically by title.

### Pages that should *not* be listed

Do nothing. Omitting the path from `pageCategories` is the mechanism. This is why `/admin/login`, `/cms` and
`/newsletter/unsubscribe` do not appear.

### Dynamic routes

Routes containing a parameter (`/blog/:slug`) are filtered out by the `!path.includes(":")` check, since a
route pattern is not a visitable URL. Individual blog posts are listed separately from the database.

## How blog posts are discovered

`useBlogPosts()` ([`composables/useBlogPosts.ts`](../composables/useBlogPosts.ts)) calls
`GET /api/cms/posts`, which returns posts from the `blog_posts` table. The composable then:

1. Keeps only posts where `published` is `true`.
2. Adds a `path` of `/blog/${slug}`.
3. Sorts newest first by `date`.

**Publishing a post through the CMS is all that is required — the sitemap needs no edit.** Unpublished drafts
never appear: the API omits them for unauthenticated callers, and the composable filters again client-side.

All callers share the `blog-posts` key, so the sitemap, the footer and the blog index reuse a single request
rather than each issuing their own.

> Historically this content came from `@nuxt/content` and markdown files under `content/blog/`. That was
> replaced by the database-backed CMS; there is no `content/` directory any more.

## External links

`externalLinks` is a plain hardcoded array — GitHub, LinkedIn, and the CV PDF in `public/assets/`. Edit it
directly. These are rendered with an external-link icon and are not part of the route filtering above.

## Troubleshooting

**A new page isn't showing up**

It is almost certainly missing from `pageCategories`. That map alone decides inclusion; adding only a title
and description does nothing.

**The page title reads like a URL fragment**

`pageTitles` has no entry for that path, so it fell back to the last path segment.

**A blog post isn't listed**

Check that it is published in the CMS. Also confirm its `date` parses — an invalid date sorts unpredictably.

**Everything except blog posts renders**

`useBlogPosts()` failed, most likely a database connection problem. The composable defaults to an empty array
so the rest of the page still renders. Check the server logs for `/api/cms/posts`.

## Related

- [`pages/sitemap.vue`](../pages/sitemap.vue) — the page itself
- [`composables/useBlogPosts.ts`](../composables/useBlogPosts.ts) — shared post list
- [`server/api/cms/posts/index.ts`](../server/api/cms/posts/index.ts) — post list endpoint
