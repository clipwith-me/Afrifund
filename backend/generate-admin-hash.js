#!/usr/bin/env node

/**
 * Generate bcrypt hash for admin password
 * This script can be run without database connection
 */

const bcrypt = require('bcrypt');

const email = 'lekankolawolejohn@gmail.com';
const password = 'Kolawolelekan@21';
const saltRounds = 10;

async function generateHash() {
  console.log('\n🔐 Generating Admin Password Hash...\n');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Salt Rounds:', saltRounds);
  console.log('\n' + '='.repeat(60) + '\n');

  try {
    const hash = await bcrypt.hash(password, saltRounds);

    console.log('✅ Bcrypt Hash Generated:\n');
    console.log(hash);
    console.log('\n' + '='.repeat(60) + '\n');

    console.log('📋 SQL Command to create admin user:\n');
    console.log(`INSERT INTO users (
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
  '${email}',
  '${hash}',
  'Lekan',
  'Kolawole',
  'ADMIN',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password = '${hash}',
  role = 'ADMIN',
  "isVerified" = true,
  "updatedAt" = NOW();`);

    console.log('\n' + '='.repeat(60) + '\n');

    // Test the hash
    const isValid = await bcrypt.compare(password, hash);
    console.log('✅ Hash Verification:', isValid ? 'PASSED ✓' : 'FAILED ✗');
    console.log('\n');

  } catch (error) {
    console.error('❌ Error generating hash:', error.message);
    process.exit(1);
  }
}

generateHash();
