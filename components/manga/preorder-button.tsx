"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { preorderItemAction } from "@/app/actions/purchase";

interface Props {
  itemId: string;
}

export function PreorderButton({ itemId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handlePreorder() {
    setLoading(true);
    setError(null);
    const result = await preorderItemAction(itemId);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      setDone(true);
      router.refresh();
    }
  }

  if (done) {
    return (
      <p className="text-amber-600 text-sm font-medium">
        ✓ Pre-order placed! We&apos;ll notify you when it&apos;s ready.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handlePreorder}
        disabled={loading}
        className="border border-foreground/30 text-sm font-medium px-4 py-2 rounded hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Placing pre-order…" : "Pre-order"}
      </button>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
