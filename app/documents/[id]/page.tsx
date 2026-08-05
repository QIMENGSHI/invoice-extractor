// Fetch and display the data
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ExtractButton from "@/app/components/ExtractButton";
import StatusBadge from "@/app/components/StatusBadge";
import { formatDate, formatMoney } from "@/lib/format";
import LineItemsTable from "@/app/components/LineItemsTable";

export const dynamic = "force-dynamic"; // this page is dynamic, because we want to show the latest uploaded files.

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
  const { extraction } = document;

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        ← Back
      </Link>

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{document.fileName}</h1>
          <p className="text-sm text-gray-500">
            Uploaded {formatDate(document.createdAt.toISOString())}
          </p>
        </div>
        <StatusBadge status={document.status} />
      </header>

      {document.status === "error" && (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Extraction failed: {document.error ?? "Unknown error"}
        </p>
      )}

      {!extraction ? (
        <div className="flex flex-col items-center gap-3 rounded border p-6 text-center">
          <p className="text-sm text-gray-500">No data extracted yet.</p>
          <ExtractButton documentId={document.id} />
        </div>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-4 rounded border p-4 text-sm">
            <Field label="Vendor" value={extraction.vendor} />
            <Field label="Invoice #" value={extraction.invoiceNumber} />
            <Field label="Date" value={formatDate(extraction.invoiceDate)} />
            <Field label="Currency" value={extraction.currency} />
            <Field
              label="Subtotal"
              value={formatMoney(extraction.subtotal, extraction.currency)}
            />
            <Field
              label="Tax"
              value={formatMoney(extraction.tax, extraction.currency)}
            />
            <Field
              label="Total"
              value={formatMoney(extraction.total, extraction.currency)}
            />
          </section>
          <section>
              <h2 className="mb-2 text-lg font-semibold">Line Items</h2>
              <LineItemsTable items={extraction.lineItems} currency={extraction.currency} />
          </section>
        </>
      )}
    </main>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-medium">{value ?? "—"}</p>
    </div>
  );
}
