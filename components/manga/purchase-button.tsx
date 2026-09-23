"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { purchaseItemAction } from "@/app/actions/purchase";

interface Props {
  itemId: string;
  price: number;
}

export function PurchaseButton({ itemId, price }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handlePurchase() {
    setLoading(true);
    setError(null);
    const result = await purchaseItemAction(itemId);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      setDone(true);
      router.refresh(); // re-render server component to show "Read" button
    }
  }

  if (done) {
    return (
      <p className="text-green-600 text-sm font-medium">
        ✓ Purchase successful! Refresh to read.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handlePurchase}
        disabled={loading}
        className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing…" : `Buy — ₱${Number(price).toFixed(2)}`}
      </button>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
