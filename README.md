# borysbabas.dev, My Next-Gen Portfolio

![Thumbnail](public/img/portfolio.png)

This repository contains the source code for borysbabas.dev. The portfolio is built using **Nuxt 4**, **Vue 3**, and *
*Tailwind CSS 4**, showcasing projects fetched from GitHub, blog posts, skills, and personal information with beautiful
animations and interactive elements.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Guides](#setup-guides)
- [Recommended IDE Setup](#recommended-ide-setup)
- [Project Setup](#project-setup)
- [Development](#development)
- [Production](#production)
- [Folder Structure](#folder-structure)
- [Key Features](#key-features)
- [Scripts](#scripts)
- [Credits](#credits)

## Features

**Dynamic GitHub Integration** - Automatically fetches and displays projects from GitHub with READMEs and images  
**Dark Mode Support** - Seamless theme switching with system preference detection  
**Blog System** - Database-backed blog with Markdown post bodies  
**Built-in CMS** - Secure admin panel with PostgreSQL for managing blog posts and subscribers  
**Newsletter** - Double-checked subscribe/unsubscribe flow with signed, single-purpose links  
**Interactive UI** - Engaging animations and modal interactions  
**Lightning Fast** - Built with Nuxt 4 and Vite for optimal performance  
**Modern UI** - Tailwind CSS 4 with custom animations and transitions  
**Fully Responsive** - Mobile-first design approach

## Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com/) - Vue 3 meta-framework
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with Vite plugin
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Supabase) via [Drizzle ORM](https://orm.drizzle.team/)
- **Auth**: JWT session cookies with bcrypt password hashing
- **Email**: [Resend](https://resend.com/) in production, [Mailpit](https://mailpit.axllent.org/) over SMTP locally
- **Markdown**: [marked](https://marked.js.org/) for rendering post bodies
- **Icons**: [Heroicons Vue](https://heroicons.com/)
- **Animations**: GSAP & custom CSS animations
- **Typography**: [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin)
- **State Management**: VueUse for composable utilities

## Setup Guides

This project includes comprehensive setup and developer guides:

### [GitHub Token Setup Guide](docs/GITHUB_TOKEN_SETUP.md)

**Essential for GitHub API integration** - Learn how to create and configure a GitHub Personal Access Token to avoid
rate limiting when fetching repositories.

- Step-by-step token creation process
- Required scopes and permissions
- Environment variable configuration
- Rate limits: 60 requests/hour (without token) vs 5,000 requests/hour (with token)
- Security best practices

### [Sitemap Developer Guide](docs/SITEMAP_GUIDE.md)

**Complete sitemap system documentation** - Understand how the semi-automatic sitemap works and how to add new pages.

- Architecture overview (automatic blog discovery from the database)
- Configuration reference for adding new pages
- Implementation examples for different page types
- Route processing and blog post pipelines
- Troubleshooting guide
- Quick reference for developers

## Recommended IDE Setup

[WebStorm](https://www.jetbrains.com/webstorm/) - Full-featured IDE with built-in Vue 3, TypeScript, and Nuxt support
out of the box.

## Project Setup

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

`.env.example` documents every variable the app reads. Two are required before the site will run:

| Variable | Required | Notes |
| --- | --- | --- |
| `JWT_SECRET` | **Yes** | Signs admin sessions and newsletter unsubscribe links. There is no default — generate one with `openssl rand -base64 48`. |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string (Supabase or any Postgres host). |
| `GITHUB_TOKEN` | Recommended | Raises the GitHub API rate limit. See the [token guide](docs/GITHUB_TOKEN_SETUP.md). |
| `NUXT_RECAPTCHA_SECRET_KEY` / `NUXT_PUBLIC_RECAPTCHA_SITE_KEY` | Production | Protects the contact and newsletter forms. Set `SKIP_RECAPTCHA=true` locally. |
| `USE_RESEND` / `RESEND_API_KEY` | Production | When `USE_RESEND` is false, mail goes over SMTP to Mailpit instead. |

> Only variables prefixed `NUXT_PUBLIC_` are exposed to the browser. Never add that prefix to a secret.

Then set up the database and create the admin user:

```bash
npm run db:push          # apply the schema
npm run db:init          # create the admin user from ADMIN_* in .env
```

## Development

**Recommended**: Start the development environment with Mailpit (for testing contact form emails):

```bash
./dev-test.sh
```

This script will:

- Install and start Mailpit (if not already installed)
- Set up SMTP server on `localhost:2525`
- Open Mailpit web UI at `http://localhost:8025`
- Start Nuxt dev server on `http://localhost:3000`

**Or** start just the dev server without email testing:

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Generate static site:

```bash
npm run generate
```

## Folder Structure

```
portfolio/
├── .env                       # Environment variables (not in git)
├── .env.example               # Documented example environment configuration
├── .node-version              # Node version specification
├── nuxt.config.ts             # Nuxt configuration & runtime config
├── drizzle.config.ts          # Drizzle Kit configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
├── dev-test.sh                # Dev environment + Mailpit launcher
├── prod-test.sh               # Dev server with production config
├── supabase-setup.sql         # Initial database schema
├── docs/
│   ├── GITHUB_TOKEN_SETUP.md  # GitHub API token setup guide
│   └── SITEMAP_GUIDE.md       # Sitemap developer guide
├── app.vue                    # Root component
├── assets/css/
│   ├── main.css               # Global styles & Tailwind theme tokens
│   └── animations.css         # Custom animations
├── components/
│   ├── AdminNavbar.vue        # CMS navigation
│   ├── DetailModal.vue        # Modal for interests
│   ├── EducationTrajectory.vue# Education timeline
│   ├── ExplodingImage.vue     # GSAP portrait animation
│   ├── FadeInSection.vue      # Scroll-triggered reveal
│   ├── Footer.vue             # Site footer
│   ├── Navbar.vue             # Navigation bar
│   ├── NavLinks.vue           # Navigation links
│   ├── NotificationContainer.vue # Toast notifications
│   ├── PostCard.vue           # Blog post card
│   ├── SubscriptionForm.vue   # Newsletter subscription
│   ├── TechStack.vue          # Technology showcase
│   └── WorkExperience.vue     # Work history
├── composables/
│   ├── techStack.ts           # Tech stack data
│   ├── useBlogPosts.ts        # Shared published-post list
│   ├── useEmailObfuscation.ts # Email obfuscation utility
│   ├── useGreeting.ts         # Time-of-day greeting
│   ├── useIntroSequence.ts    # Intro animations
│   ├── useNavbarVisibility.ts # Navbar visibility state
│   ├── useNewsletter.ts       # Newsletter subscribe helper
│   ├── useNotification.ts     # Toast notification store
│   ├── useRecaptcha.ts        # reCAPTCHA v3 integration
│   └── useRotatingTitles.ts   # Rotating title effect
├── layouts/
│   ├── default.vue            # Public site layout
│   └── admin.vue              # CMS layout
├── middleware/
│   └── auth.ts                # Route guard for /cms
├── pages/
│   ├── index.vue              # Home page
│   ├── contact.vue            # Contact form
│   ├── interests.vue          # Personal interests
│   ├── privacy.vue            # Privacy policy
│   ├── projects.vue           # Projects (GitHub integration)
│   ├── services.vue           # Services offered
│   ├── sitemap.vue            # Human-readable sitemap
│   ├── terms.vue              # Terms of service
│   ├── admin/login.vue        # CMS login
│   ├── cms/index.vue          # CMS dashboard
│   ├── blog/
│   │   ├── index.vue          # Blog listing
│   │   └── [slug].vue         # Blog post page
│   └── newsletter/
│       └── unsubscribe.vue    # Unsubscribe confirmation
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   ├── assets/borys-cv.pdf    # Resume/CV
│   ├── fonts/Pearl.ttf        # Custom font
│   └── img/                   # Images and thumbnails
├── scripts/                   # One-off CLI tasks (admin user, migrations)
└── server/
    ├── api/
    │   ├── auth/              # login / logout / me
    │   ├── cms/posts/         # Blog post CRUD
    │   ├── github/repos.get.ts# Cached GitHub proxy
    │   ├── newsletter/        # subscribe / unsubscribe / notify
    │   └── contact.post.ts    # Contact form endpoint
    ├── database/
    │   ├── client.ts          # Drizzle + postgres connection
    │   ├── schema.ts          # Table definitions
    │   └── migrations/        # Generated migrations
    └── utils/
        ├── auth.ts            # JWT & password hashing
        ├── email.ts           # Resend/SMTP sending, signed tokens
        ├── emailTemplates.ts  # Transactional email markup
        ├── html.ts            # HTML escaping for emails
        ├── newsletter.ts      # Unsubscribe token resolution
        ├── rateLimit.ts       # In-memory request throttling
        └── recaptcha.ts       # reCAPTCHA verification
```


## Key Features

### GitHub Projects Integration

The projects page reads from `/api/github/repos`, a cached server-side proxy that fetches repositories from
GitHub (`raadfxrd`) and extracts README content. The GitHub token stays on the server. For each repository it
displays:

- First image from README as thumbnail
- Project title and description parsed from README
- Repository topics, stars, and language
- Links to live demos and source code

### Interactive Interests Page

Engaging modal-based interface:

- Click-to-reveal interest cards with smooth spinning animations
- Detailed information displayed in centered modals
- Heroicons integration for modern iconography
- Responsive design with backdrop blur effects

### Responsive Design

Mobile-first approach with breakpoints:

- Mobile: Base styles
- Tablet: `md:` prefix
- Desktop: `lg:` prefix

### Custom Animations

- Intro sequence with fade and scale effects
- Letter-by-letter text reveal
- Smooth page transitions
- Modal spinning animations with 3D transforms
- Hover effects and micro-interactions
- Exploding image gallery with satellites

### Dark Mode

Intelligent theme switching:

- Respects system preferences
- Manual toggle available
- Persistent across sessions
- Smooth transitions between modes

### Content Management

Blog posts are stored in PostgreSQL and authored through the built-in CMS at `/cms`:

- Post bodies written in Markdown, rendered with `marked`
- Draft/published state — drafts are never served to anonymous visitors
- Publishing a post can notify newsletter subscribers in batches
- Typography optimization via `@tailwindcss/typography`

## Scripts

### Development

- `npm install` - Install project dependencies
- `./dev-test.sh` - Start development environment with Mailpit for email testing (recommended)
- `./prod-test.sh` or `npm run dev:prod` - Start with production config (Supabase + Resend)
- `npm run dev` - Start development server with hot-reload only
- `npm run build` - Build for production
- `npm run generate` - Generate static site
- `npm run preview` - Preview production build locally
- `npm run postinstall` - Prepare Nuxt (runs automatically)

### Database & CMS

- `npm run db:generate` - Generate database migrations from schema
- `npm run db:push` - Apply database migrations
- `npm run db:studio` - Open Drizzle Studio (visual database editor)
- `npm run db:init` - Create/update admin user directly via Drizzle ORM
- `npm run db:migration:admin` - Generate SQL migration for admin user from .env
- `npm run db:migration:apply` - Apply admin user migration to Supabase
- `npm run db:migration:admin:full` - Generate and apply admin migration (one command)

### Quick Start for CMS

```bash
# Option 1: One-command migration setup (Recommended for Supabase)
npm run db:migration:admin:full

# Option 2: Legacy method (Direct insert via ORM)
npm run db:setup

# Start development server
npm run dev

# Access CMS: Double-click ".dev" in footer or visit /admin/login
```

**Database**: PostgreSQL (Supabase) - See `.env` for connection details

## Credits

- **Icons**: [Heroicons](https://heroicons.com/) & [Devicon](https://devicon.dev/)
- **Framework**: [Nuxt Team](https://nuxt.com/) for the amazing meta-framework
- **Animations**: [GSAP](https://greensock.com/gsap/) for smooth animations
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- **Database**: [Drizzle ORM](https://orm.drizzle.team/) & [Supabase](https://supabase.com/)

---

**Built with ❤️ by Borys (Raadfxrd)**

Check out the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more about the
framework.
