import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { invoiceSchema, type InvoiceData } from "./invoice-schema";

// The extraction function
// Multimodal input: model text instructions+the actual file
// generateText and schema make the model produce output that maches the schema, parses it, and validates it against zod.

export async function extractInvoice(fileUrl: string): Promise<InvoiceData> {
  //1. download the file from its Blob URL as bytes
  const res = await fetch(fileUrl); // fetch method returns a Promise that resolves to the Response object representing the response to the request.
  const contentType = res.headers.get("content-type") || "";
  const bytes = new Uint8Array(await res.arrayBuffer());
  const isPdf =
    contentType.includes("pdf") || fileUrl.toLowerCase().endsWith(".pdf");
  //2. ask the model for data matching the schema
  const { object } = await generateObject({
    model: anthropic("claude-haiku-4-5-20251001"),
    schema: invoiceSchema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "Extract the invoice data from this document. Read carefully. " +
              "Return null for any field you cannot find. " +
              "Amounts must be plain numbers, without currency symbols.",
          },
          // PDFs go in a "file" part, images go in an "image" part
          isPdf
            ? { type: "file", data: bytes, mediaType: "application/pdf" }
            : { type: "image", image: bytes },
        ],
      },
    ],
  });

  return object;
}
