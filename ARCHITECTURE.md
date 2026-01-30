# BECOME - System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                       (Next.js 14)                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Login/     │  │  Dashboard   │  │   Programs   │      │
│  │   Signup     │  │    Page      │  │    Page      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Progress   │  │  Task List   │  │    Streak    │      │
│  │    Page      │  │  Component   │  │   Display    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                  Server Actions (RSC)
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      SERVER LAYER                            │
│                    (Next.js Server)                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Server Actions                        │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │     │
│  │  │   Auth   │ │ Programs │ │  Tasks   │          │     │
│  │  └──────────┘ └──────────┘ └──────────┘          │     │
│  │  ┌──────────┐                                     │     │
│  │  │  Streak  │  (Business Logic)                   │     │
│  │  └──────────┘                                     │     │
│  └────────────────────────────────────────────────────┘     │
│                            │                                 │
│  ┌────────────────────────▼───────────────────────────┐     │
│  │            NextAuth.js (Auth.js)                   │     │
│  │        - Session Management                        │     │
│  │        - JWT Tokens                                │     │
│  │        - Credential Provider                       │     │
│  └────────────────────────────────────────────────────┘     │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                        Prisma ORM
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                   DATABASE LAYER                              │
│                 (PostgreSQL - Supabase)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────┐  ┌─────────┐  ┌────────────┐  ┌──────────┐       │
│  │ User │──│Enrollment│──│  Program   │──│ProgramDay│       │
│  └──────┘  └─────────┘  └────────────┘  └────┬─────┘       │
│      │                                        │              │
│      │                                   ┌────▼──────┐      │
│      │                                   │ DailyTask │      │
│      │                                   └────┬──────┘      │
│      │                                        │              │
│      │       ┌────────────────┐               │              │
│      └───────│ TaskCompletion │───────────────┘              │
│              └────────────────┘                              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Authentication Flow

```
User Input (Email/Password)
        │
        ▼
SignupForm (Client Component)
        │
        ▼
signupUser() Server Action
        │
        ├─→ Validate with Zod
        ├─→ Hash password (bcrypt)
        ├─→ Create user in DB
        │
        ▼
signIn() from next-auth/react
        │
        ▼
NextAuth Credential Provider
        │
        ├─→ Find user by email
        ├─→ Compare password
        ├─→ Generate JWT token
        │
        ▼
Session Created
        │
        ▼
Redirect to /programs
```

### 2. Task Completion Flow

```
User clicks checkbox
        │
        ▼
TaskList Component (Client)
        │
        ├─→ Optimistic UI update
        │   (instant feedback)
        │
        ▼
completeTask() Server Action
        │
        ├─→ Validate userId + taskId
        ├─→ Check if already completed
        ├─→ Create TaskCompletion record
        │
        ▼
updateStreak() Server Action
        │
        ├─→ Calculate today's completion %
        ├─→ Check yesterday's completion
        ├─→ Update currentStreak
        ├─→ Update longestStreak
        │
        ▼
revalidatePath('/dashboard')
        │
        ▼
UI re-renders with fresh data
```

### 3. Program Enrollment Flow

```
User clicks "Start Program"
        │
        ▼
Form submission (Server Action)
        │
        ▼
enrollInProgram()
        │
        ├─→ Find existing active enrollment
        ├─→ Deactivate old enrollment
        ├─→ Create new enrollment
        │   - Set currentDay = 1
        │   - Set isActive = true
        │
        ▼
Redirect to /dashboard
        │
        ▼
Dashboard loads today's tasks
        │
        ├─→ Get active enrollment
        ├─→ Get ProgramDay (based on currentDay)
        ├─→ Get DailyTasks for that day
        ├─→ Get TaskCompletions for today
        │
        ▼
Render tasks with completion status
```

## Component Architecture

### Server Components (Default)

```
app/
├── page.tsx                    [Server] Root redirect
├── (auth)/
│   ├── login/page.tsx          [Server] Contains LoginForm
│   └── signup/page.tsx         [Server] Contains SignupForm
│
└── (protected)/
    ├── layout.tsx              [Server] Protected layout + nav
    ├── dashboard/page.tsx      [Server] Fetches data, renders UI
    ├── programs/page.tsx       [Server] Fetches programs
    └── progress/page.tsx       [Server] Fetches completions
```

### Client Components (Interactive)

```
components/
├── auth/
│   ├── LoginForm.tsx           [Client] Form handling
│   └── SignupForm.tsx          [Client] Form handling
│
├── dashboard/
│   ├── TaskList.tsx            [Client] Checkbox interactions
│   ├── StreakDisplay.tsx       [Server] Static display
│   └── DailyPrinciple.tsx      [Server] Static display
│
├── ui/
│   ├── Button.tsx              [Client] Interactive
│   ├── Card.tsx                [Server] Static wrapper
│   └── Input.tsx               [Client] Form input
│
└── providers/
    └── SessionProvider.tsx     [Client] Auth context
```

### Why This Split?

- **Server Components**: Fetch data, reduce JS bundle, better SEO
- **Client Components**: Handle interactivity, forms, state

## Security Architecture

### Authentication Layers

```
1. Route Protection
   └─→ (protected)/layout.tsx
       └─→ getServerSession()
           └─→ Redirect if no session

2. Server Action Validation
   └─→ Every action gets userId from session
       └─→ Validates ownership
           └─→ Prevents unauthorized access

3. Database Constraints
   └─→ Foreign keys enforce relationships
       └─→ Unique constraints prevent duplicates
           └─→ Cascade deletes maintain integrity
```

### Password Security

```
Signup
  │
  ├─→ Plain password
  ├─→ bcrypt.hash(password, 10)
  ├─→ Store hash only
  └─→ Original password discarded

Login
  │
  ├─→ Plain password
  ├─→ Fetch user's hash from DB
  ├─→ bcrypt.compare(plain, hash)
  └─→ Generate JWT if match
```

## Performance Optimizations

### 1. Database Queries

```typescript
// ❌ BAD: N+1 queries
const enrollment = await getEnrollment(userId);
const tasks = await getTasks(enrollment.programId);
const streak = await getStreak(userId);

// ✅ GOOD: Parallel queries
const [enrollment, tasks, streak] = await Promise.all([
  getEnrollment(userId),
  getTasks(userId),
  getStreak(userId),
]);
```

### 2. Indexes

```prisma
// Frequently queried fields
@@index([userId])           // Fast user lookups
@@index([programId])        // Fast program queries
@@index([userId, date])     // Fast completion checks
```

### 3. Optimistic UI

```typescript
// Update UI immediately
setOptimisticTasks((prev) =>
  prev.map((t) => (t.id === taskId ? { ...t, isCompleted: true } : t))
);

// Then sync with server
await completeTask(userId, taskId);
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│              Vercel (Edge Network)               │
│  ┌───────────────────────────────────────────┐  │
│  │        Next.js App (Server + Static)      │  │
│  │  - Server Components (SSR)                │  │
│  │  - API Routes (NextAuth)                  │  │
│  │  - Static Assets (CSS, images)            │  │
│  └────────────────┬──────────────────────────┘  │
└─────────────────────────────────────────────────┘
                    │
                    │ Database Queries
                    ▼
┌─────────────────────────────────────────────────┐
│           Supabase (PostgreSQL)                  │
│  - Connection pooling                            │
│  - Automatic backups                             │
│  - SSL encryption                                │
└─────────────────────────────────────────────────┘
```

## Scalability Considerations

### Current MVP (0-1,000 users)
- ✅ Supabase free tier (500 MB)
- ✅ Vercel free tier
- ✅ No caching needed
- ✅ Direct database queries

### Growth Phase (1,000-10,000 users)
- [ ] Upgrade Supabase plan
- [ ] Add Redis for sessions
- [ ] Enable Vercel caching
- [ ] Add database read replicas

### Scale Phase (10,000+ users)
- [ ] Connection pooling (PgBouncer)
- [ ] CDN for static assets
- [ ] Background jobs for streaks
- [ ] Database sharding

## Folder Structure Rationale

```
src/
├── app/                    # Next.js routing (App Router)
│   ├── (auth)/            # Route group: public pages
│   ├── (protected)/       # Route group: auth-required pages
│   └── api/               # API routes (NextAuth only)
│
├── components/            # React components
│   ├── auth/             # Auth-specific components
│   ├── dashboard/        # Dashboard components
│   ├── ui/               # Reusable UI primitives
│   └── providers/        # Context providers
│
├── lib/                  # Business logic (server-side)
│   ├── actions/          # Server Actions (grouped by domain)
│   ├── auth.ts           # Auth configuration
│   ├── db.ts             # Database client
│   └── utils.ts          # Helper functions
│
└── types/                # TypeScript definitions
    ├── index.ts          # Shared types
    └── next-auth.d.ts    # Auth type extensions
```

### Why This Structure?

1. **Route Groups** `(auth)` and `(protected)`:
   - Group pages by access level
   - Share layouts
   - Don't affect URL structure

2. **Server Actions in `/lib/actions`**:
   - Keep business logic separate from UI
   - Easier to test
   - Reusable across pages

3. **Components by Domain**:
   - `/auth` = authentication UI
   - `/dashboard` = feature-specific
   - `/ui` = generic, reusable

## Technology Choices

### Why Next.js App Router?
- Server Components reduce JS bundle
- Server Actions eliminate API routes
- Nested layouts reduce duplication
- Built-in optimization (images, fonts)

### Why Prisma?
- Type-safe database queries
- Migration management
- Auto-generated types
- Great developer experience

### Why NextAuth.js?
- Industry standard for Next.js
- Handles session management
- Easy to extend (OAuth later)
- Security best practices built-in

### Why TailwindCSS?
- Utility-first = fast development
- No CSS files to manage
- Excellent purging (small bundles)
- Consistent design system

### Why Supabase?
- Free tier generous for MVP
- PostgreSQL (not proprietary)
- Easy migration path
- Built-in backups

## Future Architecture Additions

### Phase 2: Notifications
```
┌──────────────┐
│  Vercel Cron │ (Daily at 8am)
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  Email Service   │ (Resend / SendGrid)
│  - Streak alerts │
│  - Daily reminders│
└──────────────────┘
```

### Phase 3: Payments
```
User → Checkout → Stripe → Webhook → Database
                              │
                              ▼
                    Update subscription status
```

### Phase 4: Analytics
```
Frontend Events → PostHog → Dashboard
                    │
                    └─→ Retention metrics
                        Funnel analysis
                        Feature usage
```

---

**Questions?** See [README.md](README.md) or [SETUP.md](SETUP.md)
