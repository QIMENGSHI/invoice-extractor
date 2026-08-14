import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invoiceSchema } from "@/lib/invoice-schema";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { userId } = await auth();
  const body = await request.json();
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.format() },
      { status: 400 },
    );
  }
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized: User not authenticated" },
      { status: 401 },
    );
  }
  const data = parsed.data;
  const extraction = await prisma.extraction.findUnique({
    where: { documentId: id },
  });
  if (!extraction) {
    return NextResponse.json(
      { error: "Extraction not found for the given document ID" },
      { status: 404 },
    );
  }
  const document = await prisma.document.findUnique({
    where: { id },
  });
  if (!document || document.userId !== userId) {
    return NextResponse.json(
      { error: "Document not found or unauthorized" },
      { status: 404 },
    );
  }
  
  await prisma.$transaction([
    prisma.extraction.update({
      where: { documentId: id },
      data: {
        vendor: data.vendor,
        invoiceNumber: data.invoiceNumber,
        invoiceDate: data.invoiceDate,
        currency: data.currency,
        subtotal: data.subtotal,
        tax: data.tax,
        total: data.total,
      },
    }),
    prisma.lineItem.deleteMany({
      where: { extractionId: extraction.id },
    }),
    prisma.lineItem.createMany({
      data: data.lineItems.map((item) => ({
        extractionId: extraction.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.amount,
      })),
    }),
  ]);

  return NextResponse.json(
    { ok: true, message: "Invoice data updated successfully" },
    { status: 200 },
  );
}
