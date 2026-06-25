# Database Seeding

This document explains how to seed the database with initial users including the admin account.

## Running the Seed Script

To create/update users in the database, run:

```bash
npm run prisma:seed
```

Or directly with Prisma:

```bash
npx prisma db seed
```

## Created Users

The seed script creates the following users:

### 1. Admin User (Full Access)

- **Email**: `lekankolawolejohn@gmail.com`
- **Password**: `Kolawolelekan@21`
- **Role**: `ADMIN`
- **Verified**: `true`
- **Access**: Admin panel, all features

### 2. Test Creator (Development)

- **Email**: `creator@afrifund.com`
- **Password**: `Test@123`
- **Role**: `CREATOR`
- **Verified**: `true`
- **Access**: Create campaigns, receive pledges

### 3. Test Backer (Development)

- **Email**: `backer@afrifund.com`
- **Password**: `Test@123`
- **Role**: `BACKER`
- **Verified**: `true`
- **Access**: Browse campaigns, make pledges

## Features

### Upsert Logic

The seed script uses `upsert` operations, meaning:
- If a user with the email already exists, it will be **updated**
- If the user doesn't exist, it will be **created**

This is safe to run multiple times without creating duplicates.

### Password Hashing

All passwords are hashed using `bcrypt` with a salt round of 10 before being stored in the database.

### Automatic Verification

All seeded users have `isVerified: true`, meaning they can:
- Access all platform features immediately
- Create campaigns (for creators)
- Make pledges
- No KYC verification required for testing

## When to Run

Run the seed script:

1. **After initial migration**: First time setting up the database
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

2. **After password reset**: If you need to reset admin password
   ```bash
   npm run prisma:seed
   ```

3. **Development environment**: When setting up local development
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   npm run start:dev
   ```

4. **Production deployment**: Run once to create admin user
   ```bash
   # In production
   npm run prisma:migrate
   npm run prisma:seed
   ```

## Testing Login

### Admin Panel Access

1. Navigate to: `http://localhost:3000/auth/login`
2. Enter credentials:
   - Email: `lekankolawolejohn@gmail.com`
   - Password: `Kolawolelekan@21`
3. After login, access admin panel: `http://localhost:3000/admin`

### Test Users

Use the test creator and backer accounts to test different user flows:

```bash
# Creator account
Email: creator@afrifund.com
Password: Test@123

# Backer account  
Email: backer@afrifund.com
Password: Test@123
```

## Customization

To change credentials, edit `prisma/seed.ts`:

```typescript
// Change admin password
const hashedPassword = await bcrypt.hash('YourNewPassword', 10);

// Change admin email
const admin = await prisma.user.upsert({
  where: { email: 'youremail@example.com' },
  // ...
});
```

After editing, run:
```bash
npm run prisma:seed
```

## Troubleshooting

### Error: Cannot find module 'bcrypt'

Install dependencies:
```bash
npm install
```

### Error: Cannot find module '@prisma/client'

Generate Prisma client:
```bash
npm run prisma:generate
```

### Error: Database connection failed

Check your `.env` file has correct `DATABASE_URL`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/afrifund
```

### Error: Table 'User' does not exist

Run migrations first:
```bash
npm run prisma:migrate
```

## Security Notes

### Development vs Production

- **Development**: Use test users for quick testing
- **Production**: 
  - Remove or disable test users
  - Use strong, unique passwords
  - Consider using environment variables for sensitive data

### Password Strength

The admin password (`Kolawolelekan@21`) includes:
- ✅ Uppercase letters
- ✅ Lowercase letters  
- ✅ Numbers
- ✅ Special characters
- ✅ Length > 12 characters

### Changing Production Password

After first login to production, change the admin password:

1. Log in as admin
2. Go to Settings/Profile
3. Change password
4. Update seed script if needed for future deployments

## Database Reset

To completely reset the database and reseed:

```bash
# WARNING: This deletes all data!
npm run prisma:migrate reset
# This will automatically run seed after reset
```

Or manually:
```bash
npx prisma migrate reset
npm run prisma:seed
```

## Integration with CI/CD

Add to your deployment pipeline:

```yaml
# Example: GitHub Actions
- name: Run database migrations
  run: npm run prisma:migrate
  
- name: Seed database
  run: npm run prisma:seed
```

## Verification

After seeding, verify users were created:

```bash
# Using Prisma Studio
npm run prisma:studio

# Or query directly
npx prisma studio
```

Navigate to the `User` table to see all created users.
