
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
    const name = process.env.SUPER_ADMIN_NAME;
    const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!name || !email || !password) {
        throw new Error(
            'Missing SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, or SUPER_ADMIN_PASSWORD in .env',
        );
    }

    if (password.length < 12) {
        throw new Error('Super Admin password must be at least 12 characters.');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.adminUser.upsert({
        where: { email },
        update: {
            name,
            passwordHash,
            role: Role.SUPER_ADMIN,
            active: true,
        },
        create: {
            name,
            email,
            passwordHash,
            role: Role.SUPER_ADMIN,
            active: true,
        },
    });

    console.log(`Super Admin account ready: ${admin.email}`);
}

main()
    .catch((error) => {
        console.error('Super Admin seeding failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
