# 🛠️ Ajinora LMS - Supabase (PostgreSQL) Setup Guide

Welcome to the **Ajinora LMS** project! The application now uses **PostgreSQL (Supabase)** for high-performance institutional data management.

---

### 1️⃣ Prerequisite
Create a new project on [Supabase](https://supabase.com/). Once your project is ready:
1. Go to **Project Settings** > **Database**.
2. Locate your **Connection String** (use the **URI** format).

---

### 2️⃣ Database Setup
Apply the schema to your Supabase instance:
1. Copy the contents of [src/lib/schema.sql](file:///c:/Users/dell/Desktop/Ajinora/src/lib/schema.sql).
2. Go to the **SQL Editor** in your Supabase Dashboard.
3. Paste the script and click **Run**.

---

### 3️⃣ Configure Environment Variables
Update your `.env.local` file in the root of your project:

```env
DATABASE_URL=postgres://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres
NEXTAUTH_SECRET=your_secret_string
```

> [!IMPORTANT]
> Ensure your password is URL-encoded if it contains special characters.

---

### 4️⃣ Manually Create Admin Account
Since there is no public signup, insert the first admin record via the Supabase SQL Editor:

```sql
INSERT INTO users (username, password, role, full_name) 
VALUES ('admin', 'admin123', 'admin', 'System Admin');
```

---

### 5️⃣ Development Server
Install the new PostgreSQL dependencies and start the server:
```bash
npm install
npm run dev
```
The dashboard will then be accessible at `http://localhost:3000`.
