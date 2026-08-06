"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Extraction, LineItem } from "@prisma/client";

type Props = {
  documentId: string;
  extraction: Extraction & { lineItems: LineItem[] };
};

type LineRow = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  total: string;
};

const s = (v: string | null) => v ?? "";
const n = (v: number | null) => (v === null ? "" : String(v));

const toText = (v: string) => (v.trim() === "" ? null : v);
const toNum = (v: string) => {
  if (v.trim() === "") return null;
  const parsed = Number(v);
  return isNaN(parsed) ? null : parsed;
};
const inputClass = "w-full rounded border px-2 py-1 text-sm";

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-gray-500">{label}</span>
      {children}
    </label>
  );
}

export default function ExtractionEditor({ documentId, extraction }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [vendor, setVendor] = useState(s(extraction.vendor));
  const [invoiceNumber, setInvoiceNumber] = useState(
    s(extraction.invoiceNumber),
  );
  const [invoiceDate, setInvoiceDate] = useState(s(extraction.invoiceDate));
  const [currency, setCurrency] = useState(s(extraction.currency));
  const [subtotal, setSubtotal] = useState(n(extraction.subtotal));
  const [tax, setTax] = useState(n(extraction.tax));
  const [total, setTotal] = useState(n(extraction.total));
  const [rows, setRows] = useState<LineRow[]>(
    extraction.lineItems.map((li) => ({
      id: li.id,
      description: s(li.description),
      quantity: n(li.quantity),
      unitPrice: n(li.unitPrice),
      total: n(li.total),
    })),
  );

  function updateRow(index: number, key: keyof LineRow, value: string) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    );
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        description: "",
        quantity: "",
        unitPrice: "",
        total: "",
      },
    ]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSave() {
    setStatus("saving");
    const payload = {
      vendor: toText(vendor),
      invoiceNumber: toText(invoiceNumber),
      invoiceDate: toText(invoiceDate),
      currency: toText(currency),
      subtotal: toNum(subtotal),
      tax: toNum(tax),
      total: toNum(total),
      lineItems: rows
        .filter((r) => r.description.trim() !== "")
        .map((r) => ({
          description: r.description,
          quantity: toNum(r.quantity),
          unitPrice: toNum(r.unitPrice),
          amount: toNum(r.total),
        })),
    };
    const res = await fetch(`/api/upload/documents/${documentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setStatus(res.ok ? "saved" : "error");
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded border p-4">
      <section className="grid grid-cols-2 gap-4 text-sm">
        <Labeled label="Vendor">
          <input
            className={inputClass}
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
          />
        </Labeled>
        <Labeled label="Invoice #">
          <input
            className={inputClass}
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
        </Labeled>
        <Labeled label="Date">
          <input
            className={inputClass}
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            placeholder="YYYY-MM-DD"
          />
        </Labeled>
        <Labeled label="Currency">
          <input
            className={inputClass}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
        </Labeled>
        <Labeled label="Subtotal">
          <input
            className={inputClass}
            value={subtotal}
            onChange={(e) => setSubtotal(e.target.value)}
            inputMode="decimal"
          />
        </Labeled>
        <Labeled label="Tax">
          <input
            className={inputClass}
            value={tax}
            onChange={(e) => setTax(e.target.value)}
            inputMode="decimal"
          />
        </Labeled>
        <Labeled label="Total">
          <input
            className={inputClass}
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            inputMode="decimal"
          />
        </Labeled>
      </section>
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Line items</h2>
          <button onClick={addRow} className="rounded border px-3 py-1 text-xs">
            + Add row
          </button>
        </div>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2">Description</th>
              <th className="py-2">Qty</th>
              <th className="py-2">Unit price</th>
              <th className="py-2">Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id} className="border-b">
                <td className="py-1 pr-2">
                  <input
                    className={inputClass}
                    value={row.description}
                    onChange={(e) =>
                      updateRow(i, "description", e.target.value)
                    }
                  />
                </td>
                <td className="py-1 pr-2">
                  <input
                    className={inputClass}
                    value={row.quantity}
                    onChange={(e) => updateRow(i, "quantity", e.target.value)}
                    inputMode="decimal"
                  />
                </td>
                <td className="py-1 pr-2">
                  <input
                    className={inputClass}
                    value={row.unitPrice}
                    onChange={(e) => updateRow(i, "unitPrice", e.target.value)}
                    inputMode="decimal"
                  />
                </td>
                <td className="py-1 pr-2">
                  <input
                    className={inputClass}
                    value={row.total}
                    onChange={(e) => updateRow(i, "total", e.target.value)}
                    inputMode="decimal"
                  />
                </td>
                <td className="py-1">
                  <button
                    onClick={() => removeRow(i)}
                    className="text-xs text-red-600"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <button
        onClick={onSave}
        disabled={status === "saving"}
        className="w-fit rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {status === "saving" ? "Saving..." : "Save"}
      </button>
      {status === "saved" && (
        <p className="text-sm text-green-600">Saved successfully!</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600">Save Failed</p>
      )}
    </div>
  );
}
