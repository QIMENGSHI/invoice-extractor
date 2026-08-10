import UploadForm from "./components/UploadForm";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import ExtractButton from "./components/ExtractButton";
import StatusBadge from "./components/StatusBadge";
import Link from "next/link";
import ExtractionEditor from "./components/ExtractionEditor";

export const dynamic = "force-dynamic"; // this page is dynamic, because we want to show the latest uploaded files.

type DocumentListItem = {
  id: string;
  fileName: string;
  status: string;
};

export default async function Home({
  searchParams,}: {
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
            No documents yet. Upload one above.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex justify-between rounded border p-3 text-sm"
              >
                <span>{doc.fileName}</span>
                <StatusBadge status={doc.status} />
                <ExtractButton documentId={doc.id} />
                <Link
                  href={`/documents/${doc.id}`}
                  className="text-sm text-gray-500 hover:underline"
                >
                  {doc.fileName}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
// i am putting a html form in this page and let user upload PDF/PNG/JPG file.
