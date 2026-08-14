// Fetch and display the data
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ExtractButton from "@/app/components/ExtractButton";
import ExtractionEditor from "@/app/components/ExtractionEditor";
import StatusBadge from "@/app/components/StatusBadge";
import { formatDate } from "@/lib/format";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic"; // this page is dynamic, because we want to show the latest uploaded files.

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth.protect();

  const document = await prisma.document.findFirst({
    where: {
      id,
      userId, // Ensure the document belongs to the authenticated user
    },
    include: {
      extraction: {
        include: {
          lineItems: true,
        },
      },
    },
  });
  if (!document || document.userId !== userId) {
    notFound();
  }
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
        <ExtractionEditor documentId={document.id} extraction={extraction} />
      )}

      {document.status === "extracted" && (
        <div className="flex gap-2">
          <a
            href={`/api/upload/documents/${document.id}/export`}
            className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
          >
            Download CSV
          </a>
          <a
            href={`/api/upload/documents/${document.id}/export-xlsx`}
            className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
          >
            Download XLSX
          </a>
        </div>
      )}
    </main>
  );
}
