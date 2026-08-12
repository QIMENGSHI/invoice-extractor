"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function SearchBar() {
    const router = useRouter();
    const params = useSearchParams();
    const [q, setQ] = useState(params.get("q") || "");

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const next = new URLSearchParams(params.toString());
        if (q.trim()) next.set("q", q.trim());
        else next.delete("q");
        next.delete("page"); // reset to first page when searching
        router.push(`/?${next.toString()}`);
    }
    
    return (
        <form onSubmit={onSubmit} className="flex items-center gap-2">
            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="border rounded px-2 py-1"
                placeholder="Search..."
            />
            <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
                Search
            </button>
        </form>
    );
}