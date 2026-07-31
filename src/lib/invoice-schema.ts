import { z } from "zod";//zod is a runtime validation library. Unlike a normal TypeScript interface, it can 
//check incoming data while your program is running. 

export const invoiceSchema = z.object({
  vendor: z
    .string()
    .nullable()
    .describe("Name of the company that issued the invoice"),
  invoiceNumber: z.string().nullable().describe("Invoice number or ID"),
  invoiceDate: z
    .string()
    .nullable()
    .describe("Invoice date in YYYY-MM-DD format"),
  currency: z.string().nullable().describe("ISO currency code, e.g. EUR, USD"),
  subtotal: z.number().nullable().describe("Total before tax"),
  tax: z.number().nullable().describe("Total tax/VAT amount"),
  total: z.number().nullable().describe("Grand total including tax"),
  lineItems: z
    .array(
      z.object({
        description: z.string().describe("What the line is for"),
        quantity: z.number().nullable(),
        unitPrice: z.number().nullable(),
        amount: z
          .number()
          .nullable()
          .describe("Line total = quantity × unitPrice"),
      }),
    )
    .describe("Every product/service row on the invoice"),
});

export type InvoiceData = z.infer<typeof invoiceSchema>;
