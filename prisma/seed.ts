import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user1 = await prisma.user.upsert({
        where: { email: 'john@example.com' },
        update: {},
        create: {
            email: 'john@example.com',
            name: 'John Doe',
            password: hashedPassword,
            subdomain: 'john',
        },
    });

    const user2 = await prisma.user.upsert({
        where: { email: 'jane@example.com' },
        update: {},
        create: {
            email: 'jane@example.com',
            name: 'Jane Smith',
            password: hashedPassword,
            subdomain: 'jane',
        },
    });

    console.log('✅ Created users:', { user1: user1.email, user2: user2.email });

    // Create test domains for user1
    await prisma.domain.createMany({
        data: [
            {
                name: 'techstartup.com',
                price: 15000,
                status: 'available',
                description: 'Perfect for tech startups',
                userId: user1.id,
            },
            {
                name: 'cloudify.io',
                price: 25000,
                status: 'available',
                description: 'Premium cloud services domain',
                userId: user1.id,
            },
            {
                name: 'aitools.ai',
                price: 50000,
                status: 'sold',
                description: 'AI tools marketplace',
                userId: user1.id,
            },
        ],
    });

    // Create test domains for user2
    await prisma.domain.createMany({
        data: [
            {
                name: 'fashionhub.com',
                price: 12000,
                status: 'available',
                description: 'Fashion e-commerce platform',
                userId: user2.id,
            },
            {
                name: 'fitnesstracker.app',
                price: 8000,
                status: 'available',
                description: 'Health and fitness tracking',
                userId: user2.id,
            },
            {
                name: 'fooddelivery.co',
                price: 30000,
                status: 'sold',
                description: 'Food delivery service',
                userId: user2.id,
            },
            {
                name: 'travelguide.net',
                price: 18000,
                status: 'available',
                description: 'Travel and tourism guide',
                userId: user2.id,
            },
        ],
    });

    console.log('✅ Created domains for both users');
    console.log('\n📝 Test Credentials:');
    console.log('   Email: john@example.com or jane@example.com');
    console.log('   Password: password123');
    console.log('\n🌐 Subdomains:');
    console.log('   john.domainliq.com - John\'s domains');
    console.log('   jane.domainliq.com - Jane\'s domains');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
