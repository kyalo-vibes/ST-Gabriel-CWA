# ST. GABRIEL CWA MANAGEMENT SYSTEM — PROJECT BIBLE

> This file is the complete context for any new conversation on this project.
> Read every section before writing any code.

---

## QUICK COMMANDS

```bash
# Frontend (root of repo)
npm run dev          # Dev server → http://localhost:3000
npm run build        # Production build → ./build/

# Backend
cd backend
npm run start:dev    # NestJS dev server → http://localhost:3001
npm run start:prod   # Production

# Database (once Prisma is set up)
cd backend
npx prisma migrate dev    # Run migrations
npx prisma db seed        # Seed with CWA data
npx prisma studio         # Visual DB browser
```

---

## 1. PROJECT OVERVIEW

A web-based management system for the **Catholic Women's Association (CWA) of St. Gabriel Church, Thome, Nairobi, Kenya**. The association has ~50 active members organised into 4 Jumuia (sub-groups): St. Peter, St. Paul, St. Joseph, St. Mary.

**Users are mostly elderly, non-technical women. Simplicity of UI is the highest priority.**

### Core Features (V1 Scope)
1. **Member Management** — register members, track profiles, admin approval workflow
2. **Financial Records** — track contributions (income) and welfare payments (expenses)
3. **Contribution Events** — create collection drives (bereavement, wedding, harambee, etc.), track per-member payment status
4. **Debt Management** — view all members with outstanding payments, send WhatsApp reminders
5. **Notifications** — WhatsApp messaging (individual + group), manual triggers + **automated cron jobs**
6. **Reports** — financial summaries with charts, printable PDF export

### Explicitly OUT of Scope (removed by parish priest)
- Bank integration (Equity, Caritas)
- M-Pesa integration
- Signatory/bulk payment workflows
- The system **tracks money only — it does NOT move money**

---

## 2. REPOSITORY STRUCTURE

```
/ST-Gabriel-CWA/
├── src/                          # React frontend
│   ├── pages/                    # One file per route
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives — DO NOT edit
│   │   ├── events/               # CreateEventModal
│   │   ├── notifications/        # NotificationModal, NotificationHistory, MessagePreview, RecipientSummary
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Navbar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── store/useStore.ts         # Zustand store (single source of truth, localStorage persist)
│   └── data/                     # Static seed data (to be replaced by API calls)
│       ├── members.ts            # 50 approved + 3 pending members
│       ├── contributions.ts      # 100 contribution records
│       ├── expenses.ts           # Expense records
│       ├── events.ts             # 3 contribution events + 150 EventPayment records
│       ├── notifications.ts      # Notification history
│       ├── reports.ts            # Pre-calculated report summaries
│       └── filters.ts            # Saved filter presets
├── backend/                      # NestJS backend
│   ├── src/
│   │   ├── whatsapp/             # WhatsApp Baileys module (COMPLETE — do not refactor)
│   │   │   ├── whatsapp.controller.ts
│   │   │   ├── whatsapp.service.ts
│   │   │   ├── whatsapp.module.ts
│   │   │   └── dto/send-message.dto.ts
│   │   ├── app.module.ts
│   │   └── main.ts               # Port 3001, CORS for :3000 and :5173
│   ├── whatsapp-session/         # Baileys auth files — NEVER delete, NEVER gitignore
│   └── package.json
├── documents/                    # Requirements photos + real Excel data files
│   ├── requirements-1.jpeg       # Core functionality requirements (handwritten)
│   ├── requirements-2.jpeg       # Bank integration (REMOVED from scope), expenditure
│   ├── requirements-3.jpeg       # 12 SCC chapters/Jumuia groups table
│   ├── CWA contributions 2nd Oct. 2025 (for Sharing).xlsx
│   └── CWA HEADSCARF.xlsx
├── index.html                    # Vite entry + @media print CSS (hides sidebar/nav for PDF export)
└── vite.config.ts                # Vite + SWC, 40+ Radix UI package aliases, output: build/
```

---

## 3. CURRENT STATE — WHAT IS BUILT

### Frontend: Complete UI Mockup ✅

All pages are built. Data lives in Zustand store backed by localStorage (`persist` key: `cwa-store`). **No API calls exist yet** — replacing Zustand mutations with API calls is the next major task.

| Route | Page | Notes |
|-------|------|-------|
| `/login` | LoginPage | Demo credential hints (click-to-fill), admin/member tabs |
| `/signup` | SignupPage | Registration form |
| `/dashboard` | DashboardPage (admin) / MemberDashboardPage (member) | Role-based render |
| `/members` | MembersPage | DataTable, CRUD, filter panel, pending approvals card |
| `/members/:id` | MemberDetailPage | Profile + contributions + notifications tabs |
| `/profile` | MemberProfilePage | Member's own profile |
| `/contributions` | ContributionsPage | Add contributions/expenses, summary cards, tabs |
| `/events` | EventsPage | Event cards with progress bars, create modal, filter tabs |
| `/events/:id` | EventDetailPage | Per-member payment table, mark-as-paid, summary tab |
| `/debt` | DebtManagementPage | Defaulters table, single/bulk WhatsApp reminders |
| `/reports` | ReportsPage | Charts + `window.print()` PDF export |
| `/notifications` | NotificationsPage | WhatsApp status badge, notification history |
| `/settings` | SettingsPage | Profile, theme toggle, WhatsApp group registration |

### Backend: WhatsApp Module Only ✅

The NestJS backend currently has only the WhatsApp module. All other modules (members, contributions, events, auth, scheduler) need to be built.

**Working WhatsApp endpoints:**
```
GET  /whatsapp/status   → { status: 'loading' | 'qr' | 'connected' | 'disconnected' }
GET  /whatsapp/qr       → { qr: 'data:image/png;base64,...' }
GET  /whatsapp/groups   → [{ id: '120363XXX@g.us', name: 'CWA St. Gabriel' }]
POST /whatsapp/send     → send group or individual messages
```

**WhatsApp send payload:**
```typescript
// Group mode
{ mode: 'group', groupId: string, message: string, notificationType: string, targetGroup: string }

// Individual mode
{ mode: 'individual', recipients: [{name: string, phone: string, balance: number}][], message: string, notificationType: string, targetGroup: string }
```

**Baileys "Bad MAC" errors** on startup are **harmless** — failed decryption of queued incoming messages from when the backend was offline. Outgoing message sending is unaffected. Errors stop after 2–5 minutes.

---

## 4. TECH STACK

### Frontend
| Technology | Notes |
|-----------|-------|
| React 18.3 + TypeScript | — |
| Vite + SWC | Dev :3000, build → `./build/` |
| React Router v6 | Client-side routing |
| Zustand + persist middleware | `cwa-store` key in localStorage |
| Tailwind CSS | — |
| Radix UI (shadcn/ui) | 40+ components in `src/components/ui/` — DO NOT edit |
| Recharts | All charts |
| Lucide React | All icons |
| Sonner 2.0.3 | Toast notifications |
| React Hook Form | Form validation |

### Backend (existing + to-be-built)
| Technology | Notes |
|-----------|-------|
| NestJS 10 | Framework |
| Prisma | ORM — schema at `backend/prisma/schema.prisma` |
| **PostgreSQL** | Database (see decision below) |
| @nestjs/schedule | Cron jobs for automated notifications |
| @nestjs/jwt + passport-jwt | JWT authentication |
| @whiskeysockets/baileys | WhatsApp — already wired, do not change |
| Pino | Logger |

**Why PostgreSQL over SQLite:** Deploying on a VPC server — PostgreSQL is the correct production choice. Provides remote admin access (pgAdmin, DBeaver), proper backup tooling (`pg_dump`), standard production tooling. Prisma makes the connection a one-line env var change. SQLite is a file-embedded database designed for single-process/local use, not server deployments.

---

## 5. DATA MODELS

These TypeScript interfaces define the shape of every entity. The Prisma schema must reflect these. When building API responses, match these field names exactly to minimise frontend changes.

```typescript
interface Member {
  id: string;                   // cuid from DB
  name: string;
  phone: string;                // Format: "+254XXXXXXXXX"
  email: string;
  join_date: string;            // ISO date string (map from DB joinDate)
  total_contributed: number;    // KES — computed: sum of contributions
  balance: number;              // KES outstanding across all active events
  status: 'Active' | 'Inactive' | 'Pending';
  jumuia: 'St. Peter' | 'St. Paul' | 'St. Joseph' | 'St. Mary';
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
}

interface Contribution {
  id: string;
  member_id: string;
  amount: number;               // KES
  type: string;                 // 'Monthly Contribution' | 'Development' | 'Welfare' | 'Project' | 'Special Contribution' | 'Fundraising'
  date: string;                 // ISO date string
  reference: string;            // e.g. "REF001"
  status: string;               // 'Completed'
}

interface Expense {
  id: string;
  description: string;
  amount: number;               // KES
  category: string;             // 'Welfare' | 'Development' | 'Project' | 'Administrative' | 'Event' | 'Other'
  date: string;
  reference: string;
  status: string;               // 'Completed'
}

interface ContributionEvent {
  id: string;
  title: string;
  type: 'Bereavement' | 'Wedding' | 'School Fees' | 'Monthly' | 'Harambee' | 'Special';
  amountPerMember: number;      // KES
  dueDate: string;              // ISO date string
  createdDate: string;
  targetJumuia: 'All' | 'St. Peter' | 'St. Paul' | 'St. Joseph' | 'St. Mary';
  status: 'Active' | 'Closed';
  description: string;
}

interface EventPayment {
  id: string;
  eventId: string;
  memberId: string;
  amountDue: number;
  amountPaid: number;
  status: 'Pending' | 'Paid';
  paidDate?: string;
}

interface Notification {
  id: string;
  member_id: string;            // 'bulk' for group/broadcast sends
  message: string;
  date: string;
  type: string;                 // 'Payment Reminder' | 'Event Announcement' | 'General Update' | 'Thank You' | 'Fundraising'
  status: string;               // 'Sent'
  targetGroup?: string;
  contributionType?: string;
  recipientCount?: number;
}

interface ApprovedGroup {
  id: string;                   // WhatsApp JID e.g. "120363XXXXXXXXXX@g.us"
  name: string;                 // e.g. "CWA St. Gabriel"
}
```

---

## 6. FULL BACKEND IMPLEMENTATION PLAN

### NestJS Modules to Build

| Module | HTTP Endpoints | Access |
|--------|---------------|--------|
| **PrismaModule** | None (shared service) | Internal |
| **AuthModule** | `POST /auth/login` | Public |
| **MembersModule** | `GET /members`, `POST /members`, `GET /members/:id`, `PATCH /members/:id`, `DELETE /members/:id`, `PATCH /members/:id/approve` | Admin (except own profile) |
| **ContributionsModule** | `GET /contributions`, `POST /contributions`, `GET /contributions/member/:id` | Admin; Member sees own |
| **ExpensesModule** | `GET /expenses`, `POST /expenses` | Admin only |
| **EventsModule** | `GET /events`, `POST /events`, `GET /events/:id`, `PATCH /events/:id`, `GET /events/:id/payments`, `PATCH /events/:id/payments/:memberId/pay` | Admin only |
| **NotificationsModule** | `GET /notifications`, `POST /notifications` | Admin only |
| **ReportsModule** | `GET /reports/summary`, `GET /reports/monthly-trends`, `GET /reports/top-contributors`, `GET /reports/outstanding` | Admin; Member sees limited |
| **GroupsModule** | `GET /groups`, `POST /groups`, `DELETE /groups/:id` | Admin only (approved WhatsApp groups) |
| **SchedulerModule** | No HTTP — internal cron only | Internal |
| **WhatsAppModule** | Already built ✅ | Admin only |

### Prisma Schema

```prisma
// backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Member {
  id             String         @id @default(cuid())
  name           String
  phone          String         @unique
  email          String         @unique
  joinDate       DateTime       @default(now())
  status         MemberStatus   @default(ACTIVE)
  jumuia         Jumuia
  approvalStatus ApprovalStatus @default(PENDING)
  contributions  Contribution[]
  eventPayments  EventPayment[]
  notifications  Notification[]
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
}

model Contribution {
  id        String   @id @default(cuid())
  member    Member   @relation(fields: [memberId], references: [id])
  memberId  String
  amount    Float
  type      String
  date      DateTime
  reference String
  status    String   @default("Completed")
  createdAt DateTime @default(now())
}

model Expense {
  id          String   @id @default(cuid())
  description String
  amount      Float
  category    String
  date        DateTime
  reference   String
  status      String   @default("Completed")
  createdAt   DateTime @default(now())
}

model ContributionEvent {
  id              String       @id @default(cuid())
  title           String
  type            EventType
  amountPerMember Float
  dueDate         DateTime
  targetJumuia    String       @default("All")
  status          EventStatus  @default(ACTIVE)
  description     String?
  payments        EventPayment[]
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

model EventPayment {
  id         String            @id @default(cuid())
  event      ContributionEvent @relation(fields: [eventId], references: [id])
  eventId    String
  member     Member            @relation(fields: [memberId], references: [id])
  memberId   String
  amountDue  Float
  amountPaid Float             @default(0)
  status     PaymentStatus     @default(PENDING)
  paidDate   DateTime?
  createdAt  DateTime          @default(now())

  @@unique([eventId, memberId])
}

model Notification {
  id               String   @id @default(cuid())
  member           Member?  @relation(fields: [memberId], references: [id])
  memberId         String?
  message          String
  type             String
  status           String   @default("Sent")
  targetGroup      String?
  contributionType String?
  recipientCount   Int?
  sentAt           DateTime @default(now())
}

model ApprovedGroup {
  id        String   @id    // WhatsApp JID e.g. "120363XXX@g.us"
  name      String
  createdAt DateTime @default(now())
}

enum MemberStatus   { ACTIVE INACTIVE PENDING }
enum Jumuia         { ST_PETER ST_PAUL ST_JOSEPH ST_MARY }
enum ApprovalStatus { PENDING APPROVED REJECTED }
enum EventType      { BEREAVEMENT WEDDING SCHOOL_FEES MONTHLY HARAMBEE SPECIAL }
enum EventStatus    { ACTIVE CLOSED }
enum PaymentStatus  { PENDING PAID }
```

### Authentication Design

**Two roles, two login paths:**

| Role | Credential | Check |
|------|-----------|-------|
| Administrator | Email + Password (from env vars) | Compare against `ADMIN_EMAIL` + `ADMIN_PASSWORD` |
| Member | Email only (no password for V1) | Find by email, check `approvalStatus === APPROVED` |

**JWT payload:** `{ sub: string, email: string, role: 'Administrator' | 'Member', name: string }`

Token stored in localStorage via Zustand store on the frontend.

### Environment Variables

```env
# backend/.env
DATABASE_URL="postgresql://cwa_user:password@localhost:5432/cwa_db"
JWT_SECRET="generate-a-long-random-string-here"
ADMIN_EMAIL="admin@stgabriel.org"
ADMIN_PASSWORD="set-a-strong-password"
FRONTEND_URL="https://your-domain.com"
PORT=3001
```

---

## 7. AUTOMATED NOTIFICATIONS (Cron Jobs)

This is the most valuable feature for the CWA. The admin never needs to trigger routine reminders — the system does it automatically.

### Cron Schedule

| Job | Cron Expression | Logic |
|-----|----------------|-------|
| Monthly contribution reminder | `0 8 1 * *` | 8am on the 1st of every month → all Active+Approved members |
| Event due-soon reminder | `0 8 * * *` | 8am daily → events where `dueDate = today + 3 days` → pending members |
| Event overdue reminder | `0 9 * * *` | 9am daily → events where `dueDate < today` AND status=ACTIVE → pending members |
| Weekly defaulters digest | `0 7 * * MON` | 7am every Monday → compile outstanding summary → send to admin phone |

### Immediate (Action-Triggered) Notifications

| Trigger | Auto-notification |
|---------|-----------------|
| Admin creates a new ContributionEvent | Immediately send "Event Announcement" to all targeted members |
| Admin marks an EventPayment as Paid | Send thank-you message to that member |

### Message Templates

```
Monthly:   "Dear {name}, this is your monthly contribution reminder for {month}. Please pay KES {amount} by the end of the month. God bless you. — CWA St. Gabriel"

Due-soon:  "Dear {name}, your contribution of KES {amount} for '{eventTitle}' is due in 3 days ({dueDate}). Please make your payment soon. — CWA St. Gabriel"

Overdue:   "Dear {name}, your contribution of KES {amount} for '{eventTitle}' was due on {dueDate}. Please settle this at your earliest convenience. God bless you. — CWA St. Gabriel"

Thank you: "Dear {name}, your payment of KES {amount} for '{eventTitle}' has been received. Thank you for your generosity! God bless you. — CWA St. Gabriel"

Digest:    "CWA Admin Report: {n} members have outstanding payments totalling KES {total}. Active events with debt: {eventList}."
```

### Scheduler Implementation Pattern

```typescript
// backend/src/scheduler/scheduler.service.ts
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SchedulerService {
  constructor(
    private prisma: PrismaService,
    private whatsapp: WhatsAppService,
  ) {}

  @Cron('0 8 1 * *')
  async sendMonthlyReminders() { ... }

  @Cron('0 8 * * *')
  async sendDueSoonReminders() { ... }

  @Cron('0 9 * * *')
  async sendOverdueReminders() { ... }

  @Cron('0 7 * * MON')
  async sendWeeklyDigest() { ... }
}
```

All sends must also log to the `Notification` table.

---

## 8. FRONTEND API INTEGRATION

When the backend is ready, swap Zustand mutations for API calls. **Keep Zustand** — it becomes a cache layer, not the source of truth.

```
OLD:  store.addMember(data)             → mutates Zustand array
NEW:  await api.post('/members', data)  → on success → store.setMembers(updatedList)
```

### API Layer Structure

Create `src/api/` with one file per resource:

```
src/api/
├── client.ts          # Base fetch wrapper with JWT header injection
├── auth.ts
├── members.ts
├── contributions.ts
├── expenses.ts
├── events.ts
├── notifications.ts
├── reports.ts
└── groups.ts
```

**Base client pattern:**
```typescript
// src/api/client.ts
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function apiFetch(path: string, options?: RequestInit) {
  const token = useStore.getState().token; // read JWT from store
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}
```

Add `token: string | null` and `setToken(token: string)` to the Zustand store.

---

## 9. VPC DEPLOYMENT ARCHITECTURE

All services run on a single VPC server (Ubuntu 22.04 recommended).

```
Internet
    │
    ▼
Nginx (:80 / :443 with SSL)
    ├── /          → serves React build/ (static files)
    └── /api/*     → proxy_pass http://localhost:3001/

PM2 manages NestJS process
    └── NestJS (:3001)
            ├── All API modules
            ├── WhatsApp Baileys (persistent WebSocket)
            └── @nestjs/schedule cron jobs

PostgreSQL (:5432) — internal only, NOT exposed to internet
```

### Critical Deployment Notes

1. **`backend/whatsapp-session/`** — MUST persist across deployments. Never delete. Never gitignore (or gitignore carefully leaving the folder). WhatsApp re-linking requires a phone scan and can be disruptive.
2. **PM2 configuration** — use `--max-memory-restart 500M` since Baileys can grow in memory
3. **Nginx WebSocket** — add `proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade";` for the NestJS proxy block
4. **Frontend env** — create `src/.env.production` with `VITE_API_URL=https://your-domain.com/api`
5. **CORS** — update `backend/src/main.ts` CORS origin to the production domain

### Environment Setup on VPC

```bash
# Install dependencies
sudo apt update
sudo apt install -y nodejs npm postgresql nginx
npm install -g pm2

# Setup PostgreSQL
sudo -u postgres psql
CREATE DATABASE cwa_db;
CREATE USER cwa_user WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE cwa_db TO cwa_user;

# Backend
cd backend
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, etc.
npm install
npx prisma migrate deploy
npx prisma db seed
pm2 start dist/main.js --name "cwa-backend" --max-memory-restart 500M
pm2 save
pm2 startup

# Frontend build
cd ..  # repo root
npm run build
# Copy build/ to Nginx web root or configure Nginx to serve from build/
```

---

## 10. CODING CONVENTIONS

### Frontend Rules

- **Toast imports:** Always `import { toast } from 'sonner@2.0.3'` — this exact specifier, NOT `'sonner'`
- **Colors:** Primary `#1C3D5A` (navy), Accent `#D4AF37` (gold)
- **Buttons:** `className="bg-[#1C3D5A] hover:bg-[#2A5A7A]"` for primary actions
- **Page heading:** `<h1 className="text-3xl text-[#1C3D5A] dark:text-white mb-2">Title</h1>`
- **shadcn/ui components:** Import from `../components/ui/...` — NEVER edit files in `src/components/ui/`
- **Path alias:** `@` resolves to `./src` — use for all intra-src imports
- **Store access:** `const { members, addMember } = useStore();`
- **Role check:** `const isAdmin = user?.role === 'Administrator';`
- **Admin-only routes:** Wrapped in `{isAdmin && (...)}` in `App.tsx`

### Backend Rules (NestJS)

- Use **Prisma directly in services** — no separate Repository pattern
- DTOs use `class-validator` decorators (`@IsString()`, `@IsEmail()`, etc.)
- Protected routes: `@UseGuards(JwtAuthGuard)`
- Admin-only routes: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('Administrator')`
- Services throw NestJS exceptions: `NotFoundException`, `BadRequestException`, `UnauthorizedException` — never raw `Error`
- WhatsApp sends go through `WhatsAppService` only — inject it, never instantiate Baileys elsewhere
- All cron job sends must log a record to the `Notification` table

---

## 11. KEY DECISIONS LOG

| Decision | Rationale |
|----------|-----------|
| PostgreSQL (not SQLite) | VPC server deployment — needs remote admin access, pg_dump backups, proper production tooling |
| Prisma ORM | TypeScript-first, excellent NestJS integration, easy DB switching if needed |
| Keep Zustand after backend integration | Remains as UI cache/state layer — just swaps mutations for API calls |
| No password for member login (V1) | CWA leaders decided simplicity > security; members are elderly and non-technical |
| Single admin account from env vars | One treasurer manages the system; multi-admin is V2 scope |
| WhatsApp via Baileys (not WhatsApp Business API) | Cost — Business API requires monthly fees; Baileys is free |
| Approved groups registered in Settings | Prevents admin's personal WhatsApp groups from appearing in notification UI |
| Target Group hidden in "WhatsApp Group" send mode | Sending to a group chat = one message, no member targeting needed |
| No bank/M-Pesa integration | Explicitly removed from scope by the parish priest |

---

## 12. WHATSAPP BEHAVIOUR NOTES

- **Session files** live in `backend/whatsapp-session/` — Baileys stores all encryption keys and credentials here
- **On reconnect**, "Bad MAC / Failed to decrypt" errors flood the log — this is **normal and harmless** (stale incoming message decryption failures). Outgoing sends are unaffected. Errors clear after ~5 minutes.
- **Group ID format:** `120363XXXXXXXXXX@g.us` — fetch via `GET /whatsapp/groups`
- **Individual message JID format:** Phone `+254706544095` → `254706544095@s.whatsapp.net` (Baileys handles this conversion in `whatsapp.service.ts`)
- **Rate limiting:** 1 second delay between individual messages (already implemented in `sendIndividualMessages`)
- **Approved groups UI:** Admin goes to Settings → "WhatsApp Groups" → loads all phone groups → ticks only CWA groups → saves. Only approved groups appear in the notification modal dropdown.

---

## 13. DEMO CONTEXT

The demo for CWA leaders covers 8 scenes (~12 minutes):

1. **Admin Login** → Dashboard KPIs + financial charts
2. **Member Management** → table, filter by Jumuia, member detail page
3. **Financial Records** → contributions + expenses, live-add a contribution
4. **Create Event** → e.g. "Easter Fundraiser KES 1,000 per member"
5. **Notify Members** → Individual Phones → 2 test members → live WhatsApp messages arrive
6. **Debt Management** → defaulters table → send reminder → live WhatsApp arrives
7. **Reports** → charts → Export Report → browser print dialog
8. **Member Login** → personal dashboard (own data only)

**Test members (phone numbers already configured):**
- `m-001`: Monicah Wambui (`monicah.wambui@gmail.com`)
- `m-002`: Mary Wanjiru (`mary.wanjiru@email.com`)

**Demo safety rule:** NEVER use "All Members" targeting for individual sends — other members in mock data have placeholder numbers that could reach real people. Use "Defaulters" (maps to the 2 test members) or the registered WhatsApp group.

---

## 14. SEED DATA PLAN

The backend seed (`backend/prisma/seed.ts`) should load data from the existing frontend data files:

```typescript
// Import and transform:
import { membersData } from '../../src/data/members';
import { contributionsData } from '../../src/data/contributions';
import { expensesData } from '../../src/data/expenses';
import { eventsData, eventPaymentsData } from '../../src/data/events';
import { notificationsData } from '../../src/data/notifications';
```

Transform field names to match Prisma schema (e.g. `join_date` → `joinDate`, jumuia strings → enum values).

**Real CWA historical data** (from Excel files in `documents/`) will be imported after the demo as a separate data migration task — this is out of scope for the current build.
