"use client";
// Next.js APP Router components are server components by default. To use client-side features like state and effects, need to add the "use client" directive at the top of the file.

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function UploadForm() {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setStatus("uploading");
    setError(null);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "An error occurred while uploading the file.");
      setStatus("error");
      return;
    }

    form.reset();
    setStatus("idle");
    router.refresh(); // Refresh the page to show the newly uploaded document
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center space-y-4"
    >
      <input
        type="file"
        name="file"
        accept="application/pdf,image/png,image/jpeg"
        required
        className="text-sm"
      />
      <button
        type="submit"
        disabled={status === "uploading"}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {status === "uploading" ? "Uploading..." : "Upload invoice"}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
