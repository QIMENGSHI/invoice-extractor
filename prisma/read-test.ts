import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const docs = await prisma.document.findMany({
        include: {
            extraction: {
                include: {
                    lineItems: true,
                },
            },
        },
    });
    
    console.log(docs);
}

main().finally(() => prisma.$disconnect());
    