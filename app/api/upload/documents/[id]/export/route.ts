// The export API route
// this route is for exporting the extraction data to CSV

import { prisma } from "@/lib/prisma";
import { extractionToCsv } from "@/lib/csv";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }, // params is a Promise in Next 15+
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
    if (!document?.extraction) {
        return new Response("Extraction not found", { status: 404 });
    }
    const csv = extractionToCsv(document.extraction);
    
    const rawName = document.extraction.invoiceNumber ?? document.id;
    const safeName = rawName.replace(/[^a-z0-9]/gi, "_").toLowerCase();

    return new Response(csv, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="invoice-${safeName}.csv"`,
        },
    });
}

