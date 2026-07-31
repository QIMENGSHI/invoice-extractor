"use client";

import { useState } from "react";

export default function ExtractButton({ documentId }: { documentId: string }) {
  const [loading, setLoading] = useState(false);
  async function onClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/upload/documents/${documentId}/extract`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to extract invoice data");
      }
      console.log("Extraction successful:", data);
      setLoading(false);
      alert(
        "Invoice data extracted successfully. Check the console for JSON details.",
      );
    } catch (error) {
      console.error("Error extracting invoice data:", error);
      setLoading(false);
      alert("Failed to extract invoice data. Check the console for details.");
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="rounded border px-3 py-1 text-xs disabled:opacity-50"
    >
      {loading ? "Extracting…" : "Extract"}
    </button>
  );
}
