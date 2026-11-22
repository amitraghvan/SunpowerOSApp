import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const dbUrl =
  process.env.DATABASE_URL ||
  'postgresql://solaros_app:solaros_secret_app_pw@localhost:5432/solaros_dev?schema=public';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

async function bootstrapPlatformOwner() {
  console.log('================================================================');
  console.log('SUNPOWEROS — PLATFORM OWNER SECURE PROVISIONING BOOTSTRAP');
  console.log('================================================================');

  const email = (process.env.PLATFORM_BOOTSTRAP_EMAIL || 'superadmin@sunpowersolutions.in').toLowerCase().trim();
  const rawPassword = process.env.PLATFORM_BOOTSTRAP_PASSWORD || 'SunPowerOwner2026!#';
  const firstName = process.env.PLATFORM_BOOTSTRAP_FIRST_NAME || 'Platform';
  const lastName = process.env.PLATFORM_BOOTSTRAP_LAST_NAME || 'Owner';

  // 1. Password complexity check
  if (rawPassword.length < 10) {
    throw new Error('Bootstrap password must be at least 10 characters long.');
  }
  const hasUpper = /[A-Z]/.test(rawPassword);
  const hasLower = /[a-z]/.test(rawPassword);
  const hasDigit = /[0-9]/.test(rawPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(rawPassword);

  if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
    throw new Error(
      'Bootstrap password complexity violation: must contain uppercase, lowercase, number, and special character.'
    );
  }

  // 2. Hash password with Argon2id
  console.log(`Hashing password with Argon2id for owner: ${email}...`);
  const passwordHash = await argon2.hash(rawPassword, {
    type: argon2.argon2id,
    memoryCost: 19456, // 19 MiB
    timeCost: 2,       // 2 iterations
    parallelism: 1,
  });

  // 3. Upsert user in database
  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    console.log(`Existing user found for ${email}. Upgrading privileges to PLATFORM_OWNER...`);
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        isSuperAdmin: true,
        status: 'ACTIVE',
        isActive: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  } else {
    console.log(`Creating new superadmin user for ${email}...`);
    user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        passwordHash,
        isSuperAdmin: true,
        status: 'ACTIVE',
        isActive: true,
      },
    });
  }

  // 4. Upsert PlatformAdministrator record
  let admin = await prisma.platformAdministrator.findFirst({
    where: { userId: user.id },
  });

  if (admin) {
    console.log(`Updating PlatformAdministrator record ${admin.id}...`);
    admin = await prisma.platformAdministrator.update({
      where: { id: admin.id },
      data: {
        role: 'PLATFORM_OWNER',
        isActive: true,
        permissions: ['*'],
      },
    });
  } else {
    console.log(`Creating PlatformAdministrator record for user ${user.id}...`);
    admin = await prisma.platformAdministrator.create({
      data: {
        userId: user.id,
        role: 'PLATFORM_OWNER',
        isActive: true,
        permissions: ['*'],
      },
    });
  }

  // 5. Write immutable Platform Audit Event
  try {
    await prisma.platformAuditEvent.create({
      data: {
        actorId: user.id,
        actorEmail: user.email,
        platformRole: 'PLATFORM_OWNER',
        action: 'BOOTSTRAP_PLATFORM_OWNER',
        targetType: 'PLATFORM_ADMIN',
        targetId: admin.id,
        reason: 'Initial platform owner provisioning bootstrap',
        metadata: {
          email: user.email,
          role: 'PLATFORM_OWNER',
          permissions: ['*'],
          bootstrappedAt: new Date().toISOString(),
        },
      },
    });
    console.log('Logged immutable platform audit event.');
  } catch (err: any) {
    console.warn('Could not write platform audit event:', err.message);
  }

  console.log('----------------------------------------------------------------');
  console.log('SUCCESS: Platform Owner successfully bootstrapped into database.');
  console.log(`User ID:      ${user.id}`);
  console.log(`Email:        ${user.email}`);
  console.log(`Role:         ${admin.role}`);
  console.log(`Permissions:  ${JSON.stringify(admin.permissions)}`);
  console.log(`SuperAdmin:   ${user.isSuperAdmin}`);
  console.log('================================================================');
}

bootstrapPlatformOwner()
  .catch((err) => {
    console.error('Bootstrap failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
