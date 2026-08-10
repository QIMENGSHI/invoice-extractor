import UploadForm from "./components/UploadForm";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import ExtractButton from "./components/ExtractButton";
import StatusBadge from "./components/StatusBadge";
import Link from "next/link";
import { formatMoney, formatDate } from "@/lib/format";
import ExtractionEditor from "./components/ExtractionEditor";

export const dynamic = "force-dynamic"; // this page is dynamic, because we want to show the latest uploaded files.

type DocumentListItem = {
  id: string;
  fileName: string;
  status: string;
  extraction?: {
    vendor?: string | null;
    total?: number | null;
    currency?: string | null;
  } | null;
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
  // it is equivalent to
  // type HomeProps = {
  //   searchParams: Promise<{
  //     q?: string;
  //     status?: string;
  //     page?: string;
  //   }>;
  // };

  // export default async function Home(props: HomeProps) {
  //   const searchParams = props.searchParams;
  // }
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const status = sp.status || "all";
  const page = Math.max(1, Number(sp.page || 1) || 1);
  const PAGE_SIZE = 5;
  const where: Prisma.DocumentWhereInput = {};
  // Here the imported {Prisma} It describes the types of the Prisma client, including the types of the models and their fields.
  if (status !== "all") {
    where.status = status;
  }

  if (q) {
    // checks whether q contains a non empty value
    where.OR = [
      { fileName: { contains: q, mode: "insensitive" } },
      { extraction: { vendor: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      select: {
        id: true,
        fileName: true,
        status: true,
        createdAt: true,
        extraction: {
          select: {
            vendor: true,
            total: true,
            currency: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.document.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Invoice Extractor</h1>
      <p className="text-grey-500">
        Upload an invoice, get structured data. Build in progress.
      </p>
      <UploadForm />
      <section>
        <h2 className="mb-2 text-lg font-semibold">Documents</h2>
        {documents.length === 0 ? (
          <p className="text-sm text-gray-500">
            {q || status !== "all"
              ? "No documents found."
              : "No documents yet. Upload one above."}
          </p>
        ) : (
          <table className="w-full border-collspse text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2">File</th>
                <th className="py-2">Vendor</th>
                <th className="py-2">Total</th>
                <th className="py-2">Uploaded</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b">
                  <td className="py-2">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="text-sm text-gray-500 hover:underline"
                    >
                      {doc.fileName}
                    </Link>
                  </td>
                  <td className="py-2">{doc.extraction?.vendor ?? "-"}</td>
                  <td className="py-2 text-right">
                    {formatMoney(
                      doc.extraction?.total ?? null,
                      doc.extraction?.currency ?? null,
                    ) ?? "—"}
                  </td>
                  <td className="py-2">
                    {formatDate(doc.createdAt.toISOString())}
                  </td>
                  <td className="py-2">
                    <StatusBadge status={doc.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          // <ul className="flex flex-col gap-2">
          //   {documents.map((doc) => (
          //     <li
          //       key={doc.id}
          //       className="flex justify-between rounded border p-3 text-sm"
          //     >
          //       <span>{doc.fileName}</span>
          //       <StatusBadge status={doc.status} />
          //       <ExtractButton documentId={doc.id} />
          //       <Link
          //         href={`/documents/${doc.id}`}
          //         className="text-sm text-gray-500 hover:underline"
          //       >
          //         {doc.fileName}
          //       </Link>
          //     </li>
          //   ))}
          // </ul>
        )}
      </section>
    </main>
  );
}
// i am putting a html form in this page and let user upload PDF/PNG/JPG file.
