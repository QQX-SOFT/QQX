import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const superAdminEmail = "office@qqxsoft.com";
    const superAdminPassword = "Turkei.1453"; // Consider hashing this if authRoutes starts using hashed passwords. Right now authRoutes checks `user.password !== password` (plain text)

    const existingUser = await prisma.user.findUnique({
        where: { email: superAdminEmail }
    });

    if (existingUser) {
        await prisma.user.update({
            where: { email: superAdminEmail },
            data: { 
                password: superAdminPassword,
                role: 'SUPER_ADMIN'
            }
        });
        console.log("Superadmin updated");
    } else {
        await prisma.user.create({
            data: {
                clerkId: "superadmin_clerk_" + Date.now().toString(),
                email: superAdminEmail,
                password: superAdminPassword,
                role: 'SUPER_ADMIN'
            }
        });
        console.log("Superadmin created");
    }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
