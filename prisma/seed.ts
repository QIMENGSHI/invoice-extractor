import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    await prisma.document.create({
        data: {
            fileName: "sample_invoice.pdf",
            // The sample is already extracted and has no uploaded Blob.
            filePath: "seed://sample_invoice.pdf",
            status: "extracted",
            extraction: {
                create: {
                    vendor: "Kahvila Oy",
                    invoiceNumber: "INV-001",
                    invoiceDate: "2026-7-20",
                    currency: "EUR",
                    subtotal: 100.00,
                    tax: 20.00,
                    total: 120.00,
                    lineItems: {
                        create: [
                            {
                                description: "Coffee Beans",
                                quantity: 2,
                                unitPrice: 50.00,
                                total: 100.00,
                            },
                            {
                                description: "Oat Milk",
                                quantity: 1,
                                unitPrice: 20.00,
                                total: 20.00,
                            }
                        ],
                    },
                },
            },
        },
    });
    console.log("Sample invoice data seeded successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
