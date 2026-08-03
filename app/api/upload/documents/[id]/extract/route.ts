import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractInvoice } from "@/lib/extract";
// The extract API route
// this route is for loading a document and running the extraction
// New knowledge learned:
// Dynamic route. the [id] folder makes id a URL parameter. Next 15+ passes the params as a Promise, so we need to await it before using it.

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }, // params is a Promise in Next 15+
) {
  const { id } = await params;
  const document = await prisma.document.findUnique({
    where: { id },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }
  if (!document.filePath) {
    return NextResponse.json(
      { error: "Document file path not found" },
      { status: 404 },
    );
  }
  if (document.status === "processing") {
    return NextResponse.json(
      { error: "Document is already being processed" },
      { status: 409 },
    );
  }
  await prisma.document.update({
    where: { id },
    data: { status: "processing", error: null }, // reset error field when starting processing
  });

  try {
    const data = await extractInvoice(document.filePath);

    await prisma.$transaction([
      prisma.extraction.deleteMany({
        where: { documentId: id },
      }),
      prisma.extraction.create({
        data: {
          documentId: id,
          vendor: data.vendor,
          invoiceNumber: data.invoiceNumber,
          invoiceDate: data.invoiceDate,
          currency: data.currency,
          subtotal: data.subtotal,
          tax: data.tax,
          total: data.total,
          lineItems: {
            create: data.lineItems.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.amount,
            })),
          },
        },
      }),
      prisma.document.update({
        where: { id },
        data: { status: "extracted" },
      }),
    ]);
    return NextResponse.json({ status: "extracted" });
  } catch (error) {
    // 4. Graceful failure: record the reason, land on "error"
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Extraction failed:", message);
    await prisma.document.update({
      where: { id },
      data: { status: "error", error: message.slice(0, 500) },
    });
    return NextResponse.json({ error: "Extraction failed." }, { status: 500 });
  }
}
