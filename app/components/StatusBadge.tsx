const STYLES: Record<string, string> = {
  extracted: "bg-green-100 text-green-700",
  error: "bg-red-100 text-red-700",
  processing: "bg-amber-100 text-amber-700",
  pending: "bg-gray-100 text-gray-600",
};

export default function StatusBadge({ status }: { status: string }) {
  const className = STYLES[status] ?? STYLES.pending;
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${className}`}>
      {status}
    </span>
  );
}
