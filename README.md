# Signal — Blog Publishing Platform

Signal is a full-stack blog publishing platform built with Next.js and MySQL. It supports a public editorial site, an authenticated author workflow for submitting articles, and an admin panel for reviewing, managing, and publishing content.

## Features

**Public site**
- Homepage with hero, featured articles, latest posts, categories, and contributors
- Blog listing with search, category filters, sorting, and pagination
- Statically generated blog detail pages with full article body, references, related posts, and prev/next navigation
- Category index and per-category listing pages
- Dedicated search page
- Newsletter signup (homepage hero and footer) with email notifications when new posts are published
- SEO: dynamic sitemap, robots.txt, canonical URLs, and Open Graph/Twitter metadata per page

**Authentication**
- Email/password registration and login with hashed passwords (bcrypt)
- Session management via signed JWTs in httpOnly cookies (works in both Node and Edge runtimes)
- Forgot password / reset password flow with single-use, expiring tokens
- Route protection via middleware for authenticated and admin-only areas

**Author dashboard (`/dashboard`)**
- Submit new articles (title, description, content, category, featured image, references)
- Track submission status: Draft, Pending Review, Approved, Rejected, Published
- View and edit your own submissions

**Admin panel (`/admin`)**
- Dashboard with content and user statistics
- Blog management: create, edit, approve, reject, publish, unpublish, delete any article; reassign author or category
- Pending review queue with an approve / request changes / reject workflow and optional reviewer notes
- Category management (create, rename, recolor, delete — with safeguards against orphaning published content)
- User management: add authors, manage roles, block/unblock accounts, view submission history

## Newsletter

- **Subscribe** — the homepage hero CTA and the footer form both `POST` to
  `app/api/newsletter/route.js`, which validates the email, treats a repeat
  signup as a success rather than an error, and stores it in the
  `NewsletterSubscriber` table. Both forms show inline loading/success/error
  states with no page reload.
- **Notifications on publish** — `lib/email.js` sends a "new post published"
  email to every subscriber via [Resend](https://resend.com) when an admin
  publishes a blog. This is optional: without `RESEND_API_KEY` set, publishing
  still works and the send is just skipped (logged to the console instead of
  failing).
- **Unsubscribe** — each notification email includes a one-click link to
  `app/api/newsletter/unsubscribe/route.js`, which returns a small standalone
  confirmation page rather than JSON, since there's no app UI to hand a
  response to.
- If subscribing ever shows "Something went wrong," it almost always means
  the `NewsletterSubscriber` table doesn't exist yet — run `npm run db:migrate`.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router), React 18 |
| Styling | CSS Modules (no UI framework) |
| Database | MySQL via Prisma ORM |
| Authentication | bcryptjs for password hashing, jose for JWT session tokens |
| Email | Resend (newsletter "new post published" notifications) |
| Images | next/image, configured for Unsplash, pravatar.cc, and picsum.photos |

## Project Structure

```
app/                  Next.js App Router pages and API routes
  admin/              Admin panel pages
  api/                API routes (auth, blogs, admin, newsletter)
  blogs/, categories/ Public content pages
  dashboard/          Author dashboard pages
components/           Shared and admin React components
  admin/               Admin-specific components
lib/                  Auth, Prisma client, email, and data-access helpers
prisma/               Database schema and seed script
middleware.js         Route protection for /dashboard and /admin
scripts/              Maintenance/utility scripts
```

## Data Model

Defined in `prisma/schema.prisma`:

- **User** — id, name, email, hashed password, role (`ADMIN` / `AUTHOR` / `USER`), avatar, bio, isActive, and password-reset token fields
- **Category** — id, slug, name, color
- **Blog** — id, slug, title, excerpt, structured content (JSON blocks), featuredImage, status (`DRAFT` / `PENDING_REVIEW` / `APPROVED` / `REJECTED` / `PUBLISHED`), featured, popular, tags, references, rejectionNote, and relations to User (author) and Category
- **NewsletterSubscriber** — id, email, createdAt

Publishing workflow: Author submits → Pending Review → Admin approves/rejects/requests changes → Published. Authors cannot self-publish.

## Getting Started

### Prerequisites
- Node.js 18+
- A MySQL database (local, or a managed provider such as PlanetScale, Railway, or Aiven)

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment template and fill in real values:
   ```bash
   cp .env.example .env
   ```
3. Create the database tables and seed initial data (categories, an admin account, sample authors and posts):
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

Open http://localhost:3000. Register a new account to submit blogs as an author, or log in with the seeded admin credentials (printed by the seed script — change the password before deploying) to access the admin panel at `/admin`.

## Environment Variables

Set these in `.env` (see `.env.example` for details):

| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL connection string in Prisma format |
| `JWT_SECRET` | Long random string used to sign session tokens (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, used for canonical links, Open Graph tags, and the sitemap. Falls back to `http://localhost:3000` for local development |
| `RESEND_API_KEY` | Optional. API key from [resend.com](https://resend.com/api-keys) for newsletter "new post published" emails. Without it, publishing still works and sends are just skipped |
| `RESEND_FROM_EMAIL` | Optional. Verified sender address for Resend. `onboarding@resend.dev` works for local testing (delivers only to your own Resend signup email); verify your own domain for production |

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server (Turbo mode) |
| `npm run build` | Build for production |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed the database with categories, an admin account, and sample content |

## Deployment

1. Push the repository to GitHub.
2. Provision a MySQL database with your provider of choice and note the connection string.
3. Import the repository into [Vercel](https://vercel.com/new) (or any Next.js-compatible host).
4. Set the following environment variables in your hosting provider's project settings:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_SITE_URL` (your deployed domain)
   - `RESEND_API_KEY` / `RESEND_FROM_EMAIL` (optional, for newsletter emails)
5. Deploy. `postinstall` runs `prisma generate` automatically on install.
6. Run `npm run db:migrate` and `npm run db:seed` once against the production database to create tables and seed initial data.
7. Log in as the seeded admin account and change the password immediately.

## SEO

- `app/sitemap.js` generates `/sitemap.xml` dynamically from published posts and categories.
- `app/robots.js` generates `/robots.txt`, disallowing `/admin`, `/dashboard`, auth pages, and `/api/`.
- Canonical URLs and Open Graph/Twitter metadata are set per page via `generateMetadata`, with site-wide defaults in `app/layout.js`.
- Account and admin pages are marked `noindex`.

## License

Proprietary — all rights reserved.
