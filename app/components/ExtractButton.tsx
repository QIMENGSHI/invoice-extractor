"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ExtractButton({ documentId }: { documentId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/upload/documents/${documentId}/extract`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to extract invoice data");
      } else {
        console.log("Extraction successful:", data);
        router.refresh();
        setLoading(false); // Refresh the page to show the updated document status
      }
      
      
      
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
