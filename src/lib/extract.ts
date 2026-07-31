import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { get } from "@vercel/blob";
import { invoiceSchema, type InvoiceData } from "./invoice-schema";

// The extraction function
// Multimodal input: model text instructions+the actual file
// generateText and schema make the model produce output that maches the schema, parses it, and validates it against zod.

export async function extractInvoice(fileUrl: string): Promise<InvoiceData> {
    // Private blobs must be downloaded through the SDK so the request is authenticated.
    const result = await get(fileUrl, { access: "private" });
    if (!result) {
        throw new Error("The uploaded file no longer exists in Blob storage.");
    }
    if (result.statusCode !== 200) {
        throw new Error(`Unable to download the uploaded file (status ${result.statusCode}).`);
    }

    const bytes = new Uint8Array(await new Response(result.stream).arrayBuffer());
    const contentType = result.blob.contentType.toLowerCase();
    const isPdf =
        bytes.length >= 5 &&
        bytes[0] === 0x25 && // %
        bytes[1] === 0x50 && // P
        bytes[2] === 0x44 && // D
        bytes[3] === 0x46 && // F
        bytes[4] === 0x2d; // -

    if (contentType.includes("pdf") && !isPdf) {
        throw new Error("The downloaded file is not a valid PDF (missing %PDF- header).");
    }
    if (!isPdf && !contentType.startsWith("image/")) {
        throw new Error(`Unsupported downloaded file type: ${contentType || "unknown"}.`);
    }

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
                ? {
                    type: "file",
                    data: bytes,
                    mediaType: "application/pdf",
                    filename: result.blob.pathname,
                }
                : { type: "image", image: bytes },
        ],
        },
    ],
    });

    return object;
}
