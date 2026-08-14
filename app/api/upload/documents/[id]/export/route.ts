// The export API route
// this route is for exporting the extraction data to CSV

import { prisma } from "@/lib/prisma";
import { extractionToCsv } from "@/lib/csv";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }, // params is a Promise in Next 15+
) {
  const { userId } = await auth();
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
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized: User not authenticated" },
      { status: 401 },
    );
  }
  if (document.userId !== userId) {
    return NextResponse.json(
      { error: "Unauthorized: User does not own this document" },
      { status: 404 },
    );
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
