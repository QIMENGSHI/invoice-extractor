import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";


export async function GET(
  _request: Request,
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
  if (!document?.extraction) {
    return new Response("Extraction not found", { status: 404 });
  }
  const extraction = document.extraction;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Invoice Data");
  worksheet.columns = [
    { header: "Vendor", key: "vendor", width: 30 },
    { header: "Invoice Number", key: "invoiceNumber", width: 20 },
    { header: "Invoice Date", key: "invoiceDate", width: 15 },
    { header: "Currency", key: "currency", width: 10 },
    { header: "Description", key: "description", width: 15 },
    { header: "Quantity", key: "quantity", width: 15 },
    { header: "Unit Price", key: "unitPrice", width: 15 },
    { header: "Amount", key: "amount", width: 15 },
  ];
  const base = {
    vendor: extraction.vendor,
    invoiceNumber: extraction.invoiceNumber,
    invoiceDate: extraction.invoiceDate,
    currency: extraction.currency,
  };
  if (extraction.lineItems.length === 0) {
    worksheet.addRow({ ...base, amount: extraction.total });
  } else {
    extraction.lineItems.forEach((item) => {
      worksheet.addRow({
        ...base,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.total,
      });
    });
  }
  worksheet.getRow(1).font = { bold: true };
  const buffer = await workbook.xlsx.writeBuffer();
  const safeName = (extraction.invoiceNumber ?? document.id)
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();
  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="invoice-${safeName}.xlsx"`,
    },
  });
}
