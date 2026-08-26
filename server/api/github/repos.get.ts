import { marked } from "marked";

const GITHUB_USER = "raadfxrd";
const GITHUB_API = "https://api.github.com";

export interface PublicRepo {
    id: number;
    name: string;
    description: string;
    html_url: string;
    homepage: string | null;
    topics: string[];
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    updated_at: string;
    thumbnail: string;
    readmeTitle: string;
    readmeDescription: string;
}

function authHeaders(): Record<string, string> {
    const token = useRuntimeConfig().githubToken;

    return {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

/** Render markdown and strip it back down to a single line of plain text. */
function toPlainText(markdown: string): string {
    if (!markdown) return "";

    try {
        return (marked.parse(markdown) as string)
            .replace(/<[^>]*>/g, " ")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, " ")
            .trim();
    } catch {
        return markdown.replace(/\s+/g, " ").trim();
    }
}

/** First heading in the README, as plain text. */
function extractTitle(readme: string): string {
    const match = readme.match(/^#+\s+(.+?)$/m);
    return match?.[1] ? toPlainText(match[1].trim()) : "";
}

/** Prose following the first heading, skipping badges and images. */
function extractDescription(readme: string): string {
    const lines = readme.split("\n");
    const collected: string[] = [];
    let foundTitle = false;

    for (const line of lines) {
        if (/^#+\s+/.test(line)) {
            foundTitle = true;
            continue;
        }
        const trimmed = line.trim();
        if (
            foundTitle &&
            trimmed &&
            !trimmed.startsWith("!") &&
            !trimmed.startsWith("[")
        ) {
            collected.push(trimmed);
            if (collected.length >= 10) break;
        }
    }

    return toPlainText(collected.join(" "));
}

/** Does this URL actually serve something? Used to pick the right branch. */
async function urlExists(url: string): Promise<boolean> {
    try {
        const response = await fetch(url, { method: "HEAD" });
        return response.ok;
    } catch {
        return false;
    }
}

/** Resolve the first README image to an absolute, reachable URL. */
async function resolveThumbnail(
    readme: string,
    repoName: string,
    defaultBranch: string,
): Promise<string> {
    const match = readme.match(/!\[.*?]\((.*?)\)/i);
    const rawPath = match?.[1];
    if (!rawPath) return "";

    if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
        return rawPath;
    }

    const imagePath = rawPath.replace(/^\.?\//, "");
    const branch = defaultBranch || "main";
    const primary = `https://raw.githubusercontent.com/${GITHUB_USER}/${repoName}/${branch}/${imagePath}`;

    if (await urlExists(primary)) return primary;

    const fallbackBranch = branch === "main" ? "master" : "main";
    const fallback = `https://raw.githubusercontent.com/${GITHUB_USER}/${repoName}/${fallbackBranch}/${imagePath}`;

    return (await urlExists(fallback)) ? fallback : "";
}

/**
 * Server-side proxy for the public repo list.
 *
 * This used to run in the browser with the token exposed via
 * `runtimeConfig.public`, which shipped a working GitHub credential to every
 * visitor. It also meant ~60 GitHub requests per page view against the
 * unauthenticated 60-requests-per-hour-per-IP limit, so the page frequently
 * failed for real visitors. Here the work happens once and is cached.
 */
export default defineCachedEventHandler(
    async (): Promise<PublicRepo[]> => {
        const repos = await $fetch<any[]>(
            `${GITHUB_API}/users/${GITHUB_USER}/repos?sort=updated&per_page=20`,
            { headers: authHeaders() },
        );

        const publicRepos = repos.filter((repo) => !repo.fork);

        return await Promise.all(
            publicRepos.map(async (repo): Promise<PublicRepo> => {
                let readme = "";

                try {
                    readme = await $fetch<string>(
                        `${GITHUB_API}/repos/${GITHUB_USER}/${repo.name}/readme`,
                        {
                            headers: {
                                ...authHeaders(),
                                Accept: "application/vnd.github.raw",
                            },
                            // A repo without a README is normal, not an error.
                            responseType: "text",
                        },
                    );
                } catch {
                    readme = "";
                }

                return {
                    id: repo.id,
                    name: repo.name,
                    description: repo.description || "No description available",
                    html_url: repo.html_url,
                    homepage: repo.homepage,
                    topics: repo.topics || [],
                    stargazers_count: repo.stargazers_count,
                    forks_count: repo.forks_count,
                    language: repo.language,
                    updated_at: repo.updated_at,
                    // The raw README body is deliberately not returned: the page
                    // only ever renders the derived title and description.
                    thumbnail: readme
                        ? await resolveThumbnail(readme, repo.name, repo.default_branch)
                        : "",
                    readmeTitle: extractTitle(readme),
                    readmeDescription: extractDescription(readme),
                };
            }),
        );
    },
    {
        name: "github-repos",
        maxAge: 60 * 60, // 1 hour
        staleMaxAge: 60 * 60 * 24, // serve stale for a day if GitHub is down
        swr: true,
    },
);
