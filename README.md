# BECOME - Personal Operating System

A personal development SaaS for young men (18-25) focused on discipline, systems, and consistent execution.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: NextAuth.js (Auth.js)
- **Styling**: TailwindCSS
- **Language**: TypeScript

## Features (MVP)

- ✅ Email/password authentication
- ✅ 3 structured programs (Discipline Reset, Dopamine Detox, Physical Reset)
- ✅ Daily actionable tasks (3-5 per day)
- ✅ Streak tracking (current & longest)
- ✅ Progress visualization
- ✅ Minimalist, no-distraction UI

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase Database

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Copy your database connection string from Project Settings → Database
4. The connection string format:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

```env
# Database (from Supabase)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"  # Generate with: openssl rand -base64 32

# Node Environment
NODE_ENV="development"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with 3 programs
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database (no migrations)
npm run db:seed      # Seed database with programs
npm run db:studio    # Open Prisma Studio (database GUI)
```

## Project Structure

```
become/
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed data (3 programs)
│
├── src/
│   ├── app/
│   │   ├── (auth)/             # Auth pages (login, signup)
│   │   ├── (protected)/        # Protected routes
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── programs/       # Program selection
│   │   │   └── progress/       # Progress tracking
│   │   └── api/auth/           # NextAuth API routes
│   │
│   ├── components/
│   │   ├── auth/               # Login/Signup forms
│   │   ├── dashboard/          # Dashboard components
│   │   └── ui/                 # Base UI components
│   │
│   ├── lib/
│   │   ├── actions/            # Server Actions
│   │   │   ├── auth.ts         # Signup
│   │   │   ├── programs.ts     # Enrollment
│   │   │   ├── tasks.ts        # Task completion
│   │   │   └── streak.ts       # Streak calculation
│   │   ├── db.ts               # Prisma client
│   │   ├── auth.ts             # NextAuth config
│   │   └── utils.ts            # Utilities
│   │
│   └── types/
│       └── index.ts            # TypeScript types
```

## Database Schema

### Core Models

- **User**: Authentication + streak data
- **Program**: 21/14/30-day structured programs
- **ProgramDay**: Daily structure (principle + tasks)
- **DailyTask**: Individual tasks (body/mindset/focus/habits)
- **Enrollment**: User's journey through a program
- **TaskCompletion**: Tracks completed tasks

### Seeded Programs

1. **Discipline Reset** (21 days, Beginner)
   - Build discipline through physical & mental challenges

2. **Dopamine Detox** (14 days, Intermediate)
   - Break free from dopamine addiction

3. **Physical Reset** (30 days, Beginner)
   - No-gym functional strength program

## Development Notes

### Auth Flow

1. User signs up → auto-login → redirect to `/programs`
2. User selects program → redirect to `/dashboard`
3. Dashboard shows today's tasks + streak

### Streak Logic

- **Threshold**: 60% of tasks completed = day counts
- **Calculation**: Runs on every task completion
- **Reset**: Missed day (< 60%) breaks the streak

### Task Completion

- Tasks are tied to a specific program day
- Users can only have 1 active enrollment at a time
- Checking a task creates a `TaskCompletion` record with today's date

## Next Steps (Post-MVP)

- [ ] Email notifications (streak reminders)
- [ ] Program completion certificates
- [ ] Weekly/monthly progress charts
- [ ] User settings (change program, reset progress)
- [ ] Payment integration (Stripe)
- [ ] Admin panel for program management

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Database (Already on Supabase)

No additional database deployment needed. Supabase is already cloud-hosted.

## Troubleshooting

### Database Issues

If you get Prisma errors:

```bash
# Reset Prisma Client
npm run db:generate

# Reset database (WARNING: Deletes all data)
npx prisma db push --force-reset
npm run db:seed
```

### Auth Issues

- Make sure `NEXTAUTH_SECRET` is set in `.env.local`
- Verify `NEXTAUTH_URL` matches your dev URL
- Clear browser cookies and try again

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## License

Private - Not open source

## Support

For issues, contact: [your-email@example.com]
