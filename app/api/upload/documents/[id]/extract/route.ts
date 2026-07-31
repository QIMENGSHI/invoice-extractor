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
        const extractionData = await extractInvoice(document.filePath);
        console.log("Extracted data")

}