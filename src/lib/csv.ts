import type {Prisma} from "@prisma/client";

type ExtractionWithItems = Prisma.ExtractionGetPayload<{
    include: {lineItems: true};
}>;

function escapeCsv(value: string | number | null): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

export function extractionToCsv(extraction: ExtractionWithItems): string {
    const headers = [
        'Vendor',
        'Invoice Number',
        'Invoice Date',
        'Currency',
        'Description',
        'Quantity',
        'Unit Price',
        'Amount',
    ];
    const base = [
        extraction.vendor,
        extraction.invoiceNumber,
        extraction.invoiceDate,
        extraction.currency,
    ];
    const rows: (string | number | null)[][] = extraction.lineItems.length === 0
        ? [[...base, null, null, null, extraction.total]]
        : extraction.lineItems.map(item => [
            ...base,
            item.description,
            item.quantity,
            item.unitPrice,
            item.total,
        ]);
    
    const lines = [headers, ...rows].map(row => row.map(escapeCsv).join(','));

    return "" + lines.join('\r\n');

    }

