# 🏁 Ajinora LMS - Comprehensive Database Setup Guide (A to Z)

Setting up your database correctly is essential for the LMS to function. Follow these steps meticulously:

---

### Phase 1: Installation & Preparation

#### 1. Download MySQL
If you don't have MySQL installed, download the **MySQL Community Server** for your OS:
- **Windows:** [MySQL Installer for Windows](https://dev.mysql.com/downloads/installer/) (Choose the "Full" or "Developer" setup).
- **Mac:** `brew install mysql` (if using Homebrew).

#### 2. Start the Service
Ensure your MySQL service is running. 
- **Windows:** Search for "Services" in the Start menu, look for `MySQL80` (or similar), and ensure it says **Running**.
- **Mac/Linux:** Run `mysql.server start` or `sudo service mysql start`.

#### 3. Choose your Tool
You can manage your database using:
- **CLI:** Command Line Interface.
- **GUI (Recommended):** [MySQL Workbench](https://www.mysql.com/products/workbench/) or [DBeaver](https://dbeaver.io/).

---

### Phase 2: Building the Architecture

#### 4. Create Database & Tables
I have provided a complete script at `/src/lib/schema.sql`. 

**Using the MySQL CLI:**
1. Open your terminal/command prompt.
2. Log in: `mysql -u root -p` (enter your password when prompted).
3. Run the import:
   ```bash
   # Inside the project folder
   mysql -u root -p ajinora_lms < src/lib/schema.sql
   ```

**Using a GUI (Workbench/TablePlus):**
1. Connect to your local server.
2. Open the file `/src/lib/schema.sql` within the tool.
3. Click "Execute All" (usually the lightning bolt icon ⚡).
4. Refresh your sidebar; you should see the `ajinora_lms` database with all tables created.

---

### Phase 3: Application Connection

#### 5. Configure Environment Variables
Locate the `.env.local` file in your root folder. Update it with your exact credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=ajinora_lms
NEXTAUTH_SECRET=a_random_unique_string
```

---

### Phase 4: The "Admin-Controlled" Access

#### 6. Generate the First Admin Account
Since public signup is disabled, you must manually create the first admin. 
Open your MySQL console or GUI and run this exact SQL:

```sql
# 1. Step into the database
USE ajinora_lms;

# 2. Insert the super admin (password: admin123)
# Note: For initial setup, the app supports plaintext fallback if you haven't hashed yet.
INSERT INTO users (username, password, role, full_name) 
VALUES ('admin', 'admin123', 'admin', 'System Administrator');
```

---

### Phase 5: Verification

#### 7. Test it Out
1. Ensure the app is running: `npm run dev`.
2. Visit `http://localhost:3000/login`.
3. Enter username: `admin` and password: `admin123`.
4. If you land on the **Admin Dashboard**, your database setup is perfectly complete! ✅

---

### 🛡️ Troubleshooting Tips:
- **Connection Refused?** Ensure the `DB_HOST` and `DB_PORT` match your MySQL settings (default port is `3306`).
- **Table Missing?** Re-run the script in step 4 and ensure you see no error messages.
- **Password Error?** Triple-check the `DB_PASSWORD` in `.env.local`.
