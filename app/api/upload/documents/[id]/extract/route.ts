import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractInvoice } from "@/lib/extract";
// The extract API route
// this route is for loading a document and running the extraction

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }// params is a Promise in Next 15+

){
    const { id } = await params;
    const document = await prisma.document.findUnique({
        where: { id },
    });
    
    if (!document) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    try {
        const data = await extractInvoice(document.filePath);
        console.log("Extracted invoice data:\n", JSON.stringify(data, null, 2));
        return NextResponse.json({ message: "Invoice data extracted successfully", data }, { status: 200 });

} catch (error) {
        console.error("Error extracting invoice data:", error);
        return NextResponse.json(
            { error: "Failed to extract invoice data" },
            { status: 500 },
        );
    }
}
