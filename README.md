# ProjectFlow

A project and task management tool built as part of the Ethara.AI assessment. Think lightweight Jira — three roles, real auth, Recharts dashboards, the whole thing.

---

## Stack

- **Next.js 14** (App Router, server components where it makes sense)
- **Supabase** — Postgres, used purely as a database. No Supabase Auth.
- **JWT** — rolled manually, stored in an httpOnly cookie
- **bcryptjs** — password hashing
- **Tailwind CSS + shadcn/ui** — dark theme, custom color palette
- **Recharts** — bar + donut charts on the dashboard
- **Zod** — validation on every API route

---

## Getting started

### 1. Clone and install

```bash
git clone <repo-url>
cd ethara_ai
npm install
```

### 2. Supabase setup

Create a project at [supabase.com](https://supabase.com), then run the SQL in `db/schema.sql` inside the Supabase SQL editor. That creates the four tables: `users`, `projects`, `project_members`, `tasks`.

### 3. Environment variables

Create a `.env.local` at the root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=something-random-and-at-least-32-chars
```

### 4. Run it

```bash
npm run dev
```

App runs at `http://localhost:3000`. First hit `/register` to create your first user, then go into Supabase and manually set their role to `ADMIN` — there's no invite flow, by design.

---

## Roles

| | MEMBER | MANAGER | ADMIN |
|---|---|---|---|
| View own tasks | ✓ | ✓ | ✓ |
| Update task status (own tasks) | ✓ | ✓ | ✓ |
| Create projects | | ✓ | ✓ |
| Edit projects | | ✓ (own) | ✓ |
| Delete projects | | | ✓ |
| Create/edit/delete tasks | | ✓ | ✓ |
| Add/remove project members | | ✓ (own) | ✓ |
| View all users | | | ✓ |
| Change user roles | | | ✓ |
| Delete users | | | ✓ |

---

## Project structure

```
app/
  (auth)/           login + register pages
  (dashboard)/      everything behind auth — dashboard, projects, tasks, admin
  api/              all API routes live here
components/
  auth/             LoginForm, RegisterForm
  dashboard/        Charts, StatsCard
  layout/           Sidebar, Topbar, MobileSidebar
  projects/         ProjectCard, ProjectForm, MemberManager
  tasks/            TaskForm, TaskTable, StatusBadge
  shared/           EmptyState, LoadingSkeleton, ConfirmDialog, RoleBadge
context/
  AuthContext.tsx   wraps the app, exposes user + logout()
lib/
  auth.ts           getCurrentUser() — reads cookie, verifies JWT, fetches user
  jwt.ts            signToken / verifyToken
  hash.ts           bcrypt helpers
  supabase.ts       supabase client init
  validations.ts    all Zod schemas
middleware.js       route protection — redirects unauthenticated users
```

---

## API reference

All routes are under `/api`. Auth is cookie-based — the login/register endpoints set an httpOnly cookie called `token`. Every other endpoint reads that cookie server-side, so you don't pass a header manually from the browser. For Postman testing, use the provided collection (`postman_collection.json` in the repo root) or import it directly from the shared link below — both handle cookies automatically via a cookie jar.

**Postman collection:** [ProjectFlow API](https://www.postman.com/orange-comet-895516/ethara-ai/collection/mlvdyct/projectflow-api?action=share&creator=31961114)

### Auth

| Method | Route | Who |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Authenticated |
| GET | `/api/me` | Authenticated |

### Projects

| Method | Route | Who |
|---|---|---|
| GET | `/api/projects` | All (scoped by role) |
| POST | `/api/projects` | MANAGER, ADMIN |
| GET | `/api/projects/:id` | Members of project, ADMIN |
| PATCH | `/api/projects/:id` | Project owner, ADMIN |
| DELETE | `/api/projects/:id` | ADMIN only |

### Project members

| Method | Route | Who |
|---|---|---|
| POST | `/api/projects/:id/members` | Project owner, ADMIN |
| DELETE | `/api/projects/:id/members` | Project owner, ADMIN |

### Tasks

| Method | Route | Who |
|---|---|---|
| GET | `/api/projects/:id/tasks` | Project members, ADMIN |
| POST | `/api/projects/:id/tasks` | MANAGER, ADMIN |
| GET | `/api/tasks` | All (returns only own tasks) |
| PATCH | `/api/tasks/:id` | MANAGER/ADMIN (full), MEMBER (status only, own tasks) |
| DELETE | `/api/tasks/:id` | MANAGER (own project), ADMIN |

### Users

| Method | Route | Who |
|---|---|---|
| GET | `/api/users` | Authenticated (basic info) |
| GET | `/api/users?admin=1` | ADMIN (includes created_at) |
| PATCH | `/api/users/:id` | ADMIN |
| DELETE | `/api/users/:id` | ADMIN |

### Stats

| Method | Route | Who |
|---|---|---|
| GET | `/api/stats` | Authenticated |

---

## Notes

- Passwords are never returned from any endpoint. The select is always explicit.
- The JWT contains `{ id, email, role }` — role is re-verified from the DB on sensitive operations.
- Deleting a project cascades to members and tasks via FK constraints set in Supabase.
- `MEMBER` role cannot change anything on a task except its own `status` field. Trying to send any other field returns a 403.
- The `/api/users` endpoint without `admin=1` is intentionally open to all authenticated users so the member-picker dropdown works without requiring admin access.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
