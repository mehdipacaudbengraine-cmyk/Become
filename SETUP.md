# BECOME - Quick Setup Checklist

Follow these steps in order to get your app running.

## ✅ Prerequisites

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Supabase account created

## 📦 Step 1: Install Dependencies

```bash
cd become
npm install
```

**Expected output**: All packages installed successfully.

## 🗄️ Step 2: Database Setup

### 2.1 Create Supabase Project

1. Go to https://supabase.com
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - **Name**: become-db
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
   - **Plan**: Free

### 2.2 Get Database URL

1. In your Supabase project, go to **Settings** → **Database**
2. Scroll to **Connection string** → **URI**
3. Copy the connection string (it looks like this):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with your actual database password

## 🔐 Step 3: Environment Variables

### 3.1 Create `.env.local`

```bash
cp .env.example .env.local
```

### 3.2 Edit `.env.local`

Open `.env.local` and fill in:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run this command to generate: openssl rand -base64 32"
NODE_ENV="development"
```

### 3.3 Generate NEXTAUTH_SECRET

Run this in your terminal:

```bash
openssl rand -base64 32
```

Copy the output and paste it as the value for `NEXTAUTH_SECRET`.

**Final `.env.local` should look like:**

```env
DATABASE_URL="postgresql://postgres:MyPass123!@db.abc123xyz.supabase.co:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1fG3="
NODE_ENV="development"
```

## 🛠️ Step 4: Initialize Database

Run these commands **in order**:

```bash
# 1. Generate Prisma Client
npm run db:generate

# 2. Push schema to Supabase
npm run db:push

# 3. Seed database with 3 programs
npm run db:seed
```

**Expected outputs**:

1. `✔ Generated Prisma Client`
2. `✔ Your database is now in sync with your schema`
3. `🎉 Seeding complete!`

## 🚀 Step 5: Run Development Server

```bash
npm run dev
```

**Expected output**:

```
✓ Ready in 2.3s
○ Local:   http://localhost:3000
```

## ✅ Step 6: Test the App

1. Open http://localhost:3000
2. You should be redirected to `/login`
3. Click "Sign up"
4. Create an account:
   - Name: Test User
   - Email: test@test.com
   - Password: test123
5. You'll be redirected to `/programs`
6. Select "Discipline Reset"
7. You'll be redirected to `/dashboard`
8. You should see:
   - Day 1 of 21
   - 5 tasks
   - Current Streak: 0
   - Today's principle

## 🐛 Troubleshooting

### Database Connection Error

```
Error: P1001: Can't reach database server
```

**Fix**: Check your `DATABASE_URL` in `.env.local`

- Make sure you replaced `[YOUR-PASSWORD]` with your actual password
- Verify the connection string from Supabase is correct

### Prisma Client Error

```
Error: @prisma/client did not initialize yet
```

**Fix**: Run `npm run db:generate`

### Auth Error

```
[next-auth][error][NO_SECRET]
```

**Fix**: Make sure `NEXTAUTH_SECRET` is set in `.env.local`

### Port 3000 Already in Use

```
Error: Port 3000 is already in use
```

**Fix**: Either:
- Stop the other process using port 3000
- Or run: `npm run dev -- -p 3001` (uses port 3001)

## 🎯 Next Steps

Once everything is working:

1. ✅ Create an account
2. ✅ Enroll in a program
3. ✅ Complete your first task
4. ✅ Check your streak
5. ✅ View progress page

## 📊 Optional: View Database

To see your data in a GUI:

```bash
npm run db:studio
```

Opens Prisma Studio at http://localhost:5555

## 🚢 Ready to Deploy?

See [README.md](README.md) for deployment instructions.

---

**Need help?** Open an issue or contact support.
