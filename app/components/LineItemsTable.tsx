import type { LineItem } from "@prisma/client";
import { formatMoney } from "@/lib/format";

export default function LineItemsTable({
  items,
  currency,
}: {
  items: LineItem[];
  currency: string | null | undefined;
}) {
    if (items.length === 0) {
        return <p className="text-sm text-gray-500">No line items extracted.</p>;
    }
    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Total
                    </th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
                {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {item.description}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {item.quantity ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {formatMoney(item.unitPrice, currency) ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {formatMoney(item.total, currency) ?? "—"}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
    