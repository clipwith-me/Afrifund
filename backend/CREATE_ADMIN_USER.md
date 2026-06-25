# Create Admin User - Quick Guide

If you're getting "Invalid credentials" when trying to login, the admin user hasn't been created in the database yet. Here are multiple ways to fix this.

## Admin Credentials

```
Email: lekankolawolejohn@gmail.com
Password: Kolawolelekan@21
Role: ADMIN
```

## Method 1: Run SQL Command Directly (Fastest)

**Step 1: Access your database**

If using a PostgreSQL client (pgAdmin, DBeaver, psql, etc.), run this SQL:

```sql
INSERT INTO users (
  id,
  email,
  password,
  "firstName",
  "lastName",
  role,
  "isVerified",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid()::text,
  'lekankolawolejohn@gmail.com',
  '$2b$10$0OZMzwBasa/5QC5XI33C3epP3szorsxRx0LxnsSj6sTAs3gxTcbBm',
  'Lekan',
  'Kolawole',
  'ADMIN',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password = '$2b$10$0OZMzwBasa/5QC5XI33C3epP3szorsxRx0LxnsSj6sTAs3gxTcbBm',
  role = 'ADMIN',
  "isVerified" = true,
  "updatedAt" = NOW();
```

**Step 2: Verify the user was created**

```sql
SELECT id, email, "firstName", "lastName", role, "isVerified"
FROM users
WHERE email = 'lekankolawolejohn@gmail.com';
```

You should see one row with the admin user.

**Step 3: Try logging in again**

- Go to: http://localhost:3000/auth/login (or your deployed URL)
- Email: lekankolawolejohn@gmail.com
- Password: Kolawolelekan@21

✅ **Should work immediately!**

---

## Method 2: Using psql Command Line

If you have `psql` installed:

```bash
# Connect to your database
psql postgresql://username:password@host:port/database

# Or if using local database
psql -U afrifund -d afrifund

# Then paste and run the SQL command from Method 1
```

---

## Method 3: Run Seed Script (If Database is Accessible)

**Step 1: Ensure database is running**

Check if your database server is accessible.

**Step 2: Run the seed script**

```bash
cd backend
npm run prisma:seed
```

**Step 3: Check the output**

You should see:
```
🌱 Starting database seed...
✅ Admin user created/updated:
   Email: lekankolawolejohn@gmail.com
   Role: ADMIN
   ID: <user-id>
🎉 Database seeding completed!
```

---

## Method 4: Via Prisma Studio (Visual)

**Step 1: Open Prisma Studio**

```bash
cd backend
npm run prisma:studio
```

**Step 2: Navigate to Users table**

Click on "User" in the left sidebar.

**Step 3: Add new record**

Click "Add record" button and fill in:

- **id**: (auto-generated, leave blank)
- **email**: `lekankolawolejohn@gmail.com`
- **password**: `$2b$10$0OZMzwBasa/5QC5XI33C3epP3szorsxRx0LxnsSj6sTAs3gxTcbBm`
- **firstName**: `Lekan`
- **lastName**: `Kolawole`
- **role**: `ADMIN`
- **isVerified**: `true`
- **createdAt**: (auto-generated)
- **updatedAt**: (auto-generated)

**Step 4: Click "Save 1 change"**

---

## Method 5: Using Database GUI Tools

### pgAdmin
1. Connect to your database
2. Open Query Tool
3. Paste and run the SQL from Method 1

### DBeaver
1. Connect to your database
2. Open SQL Editor
3. Paste and run the SQL from Method 1

### TablePlus / Postico
1. Connect to your database
2. Open SQL Query window
3. Paste and run the SQL from Method 1

---

## Verification Steps

After creating the admin user using any method:

### 1. Check Database

```sql
SELECT * FROM users WHERE email = 'lekankolawolejohn@gmail.com';
```

Should return one row with:
- email: lekankolawolejohn@gmail.com
- role: ADMIN
- isVerified: true

### 2. Test Login

Navigate to login page and enter:
- Email: `lekankolawolejohn@gmail.com`
- Password: `Kolawolelekan@21`

### 3. Access Admin Panel

After successful login:
- Go to: `/admin`
- You should see the admin dashboard

---

## Troubleshooting

### "Invalid credentials" error

**Possible causes:**

1. **User doesn't exist in database**
   - Solution: Run one of the methods above

2. **Wrong password hash**
   - Solution: Use the hash provided above
   - Hash: `$2b$10$0OZMzwBasa/5QC5XI33C3epP3szorsxRx0LxnsSj6sTAs3gxTcbBm`

3. **Email mismatch**
   - Check: Make sure email is exactly `lekankolawolejohn@gmail.com`
   - No spaces, correct spelling

4. **Database not in sync**
   - Solution: Run migrations
   ```bash
   cd backend
   npm run prisma:migrate
   ```

### "Can't reach database server"

**Solution:**
- Make sure database server is running
- Check DATABASE_URL in `.env` file
- Verify connection credentials

### "Table 'users' does not exist"

**Solution:**
```bash
cd backend
npm run prisma:migrate
```

---

## Generate New Hash (If Needed)

If you need to generate a new password hash:

```bash
cd backend
node generate-admin-hash.js
```

This will output:
- The bcrypt hash
- Complete SQL command
- Verification that hash is valid

---

## Production Deployment

For production deployments, add this to your deployment script:

### Option A: Run as part of deployment

```bash
# After migrations
npm run prisma:migrate deploy
npm run prisma:seed
```

### Option B: Run SQL directly

Execute the SQL command from Method 1 on your production database.

### Option C: Environment variable approach

Some platforms (Heroku, Railway, etc.) allow running scripts after deployment.

---

## Security Notes

### Password Strength

The password `Kolawolelekan@21` is strong:
- ✅ 18 characters long
- ✅ Contains uppercase letters
- ✅ Contains lowercase letters
- ✅ Contains numbers
- ✅ Contains special characters (@)

### Best Practices

1. **Change password after first login** (recommended)
2. **Don't commit production passwords** to git
3. **Use environment variables** for sensitive data
4. **Enable 2FA** (when implemented)

### Bcrypt Hash

The hash `$2b$10$0OZMzwBasa/5QC5XI33C3epP3szorsxRx0LxnsSj6sTAs3gxTcbBm` is:
- Generated with bcrypt
- Salt rounds: 10
- Secure for production use
- One-way hashing (can't be reversed)

---

## Quick Reference

### Connection String Format

```
postgresql://username:password@host:port/database
```

### Default Local Database

```
postgresql://afrifund:afrifund_password@localhost:5432/afrifund
```

### Test Login

After setup, test with:
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lekankolawolejohn@gmail.com",
    "password": "Kolawolelekan@21"
  }'
```

Should return a JWT token.

---

## Need Help?

If still having issues:

1. Check backend logs for specific errors
2. Verify database connection works
3. Ensure all migrations have run
4. Try the SQL method (most reliable)

The SQL command in Method 1 is the most straightforward way and works with any database tool.
