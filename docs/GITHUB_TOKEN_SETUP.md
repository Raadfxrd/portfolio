# GitHub Token Setup Guide

The projects page at `/projects` lists public repositories for the `raadfxrd` GitHub account, along with a
thumbnail, title and description extracted from each repository's README.

Configuring a token is **optional but strongly recommended**. Without one the site still works, but it shares
the anonymous GitHub rate limit with everyone else on the same egress IP.

## Table of Contents

- [Why a token](#why-a-token)
- [Creating the token](#creating-the-token)
- [Configuring the token](#configuring-the-token)
- [How the integration works](#how-the-integration-works)
- [Security notes](#security-notes)
- [Troubleshooting](#troubleshooting)

## Why a token

| | Requests per hour | Scope |
| --- | --- | --- |
| No token | 60 | Per IP address, shared with everything else on that IP |
| With token | 5,000 | Per token |

On a serverless host many deployments share an outbound IP, so the anonymous 60/hour budget can be exhausted
by traffic that has nothing to do with this site. The result is a projects page that renders its error state.

## Creating the token

The integration only ever reads public data, so grant it as little as possible.

**Fine-grained token (recommended)**

1. Go to <https://github.com/settings/personal-access-tokens/new>.
2. **Token name**: something identifiable, e.g. `borysbabas.dev-portfolio`.
3. **Expiration**: pick a fixed expiry and set a reminder to rotate it.
4. **Repository access**: `Public Repositories (read-only)`.
5. **Permissions**: none need to be added. Public read access is implicit and is all this integration uses.
6. Click **Generate token** and copy the value — GitHub shows it exactly once.

**Classic token (alternative)**

1. Go to <https://github.com/settings/tokens/new>.
2. Select **no scopes at all**. An unscoped classic token can already read public repositories and gets the
   full 5,000/hour limit.
3. Click **Generate token** and copy the value.

> Do not grant `repo`. That scope carries **write** access to your private repositories and is not needed here.

## Configuring the token

Add it to `.env`:

```dotenv
GITHUB_TOKEN=github_pat_xxxxxxxxxxxxxxxxxxxx
```

Then restart the dev server so Nuxt picks up the new value.

For production, set `GITHUB_TOKEN` in your hosting provider's environment variables (on Vercel:
**Project → Settings → Environment Variables**).

> **The variable must not be named `NUXT_PUBLIC_GITHUB_TOKEN`.**
>
> Anything under `runtimeConfig.public` is serialised into the HTML sent to the browser. This project
> previously read the token from `NUXT_PUBLIC_GITHUB_TOKEN` and called the GitHub API directly from
> client-side JavaScript, which published a working credential to every visitor. The token is now read only on
> the server, from `runtimeConfig.githubToken`.

## How the integration works

The browser never talks to GitHub. It calls one endpoint on this site:

```
GET /api/github/repos
```

That handler — [`server/api/github/repos.get.ts`](../server/api/github/repos.get.ts) — does the following on
the server:

1. Fetches the repository list (`/users/raadfxrd/repos?sort=updated&per_page=20`) and drops forks.
2. Fetches each repository's README.
3. Derives a plain-text title and description from the README, and resolves the first image to an absolute
   URL (trying the default branch, then `main`/`master` as a fallback).
4. Returns a trimmed object per repository. The raw README body is **not** included — the page only renders
   the derived fields.

The response is cached with `defineCachedEventHandler`:

- `maxAge: 3600` — GitHub is hit at most once an hour.
- `staleMaxAge: 86400` with `swr: true` — if GitHub is unreachable, the last good response is served for up
  to a day rather than showing an error.

This is also why the token matters less than it used to: a cached hour of traffic costs a couple of dozen
GitHub requests in total, not a couple of dozen *per visitor*.

## Security notes

- `.env` is git-ignored. Never commit a token.
- Use the shortest practical expiry and rotate on schedule.
- Revoke immediately at <https://github.com/settings/tokens> if a token is ever exposed.
- Grant public read access only — this integration never needs write access or private repository access.

## Troubleshooting

**The projects page shows "Failed to load projects."**

Check the server logs. The request to `/api/github/repos` is where the failure will surface, not the browser
console.

**Still hitting rate limits with a token set**

Confirm the variable is actually reaching the server:

```bash
curl -s http://localhost:3000/api/github/repos | head -c 200
```

If that returns data, the endpoint is working. If it errors, the token is likely missing, malformed or
expired — the handler falls back to unauthenticated requests when `GITHUB_TOKEN` is empty, so a typo in the
variable name looks the same as having no token at all.

**Changes to a repository README are not showing up**

That is the cache doing its job. Wait up to an hour, or restart the server to clear it in development.

**A repository is missing from the page**

Forks are filtered out, and only the 20 most recently updated repositories are requested. A rarely-touched
repository can fall off the end of that list.
