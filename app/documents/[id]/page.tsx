// Fetch and display the data
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function DocumentPage(
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const document = await prisma.document.findUnique({
        where: { id },
        include: {
            extraction: {
                include: {
                    lineItems: true,
                },
            },
        },
    });
    if (!document) notFound();
    
    return <pre className="whitespace-pre-wrap">{JSON.stringify(document, null, 2)}</pre>;
}
