"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { subscribeAction } from "@/app/actions/purchase";

const TIERS = [
  {
    id: "basic",
    name: "Basic",
    price: "₱99/mo",
    description: "Access to all free-preview and subscription-access items.",
  },
  {
    id: "premium",
    name: "Premium",
    price: "₱199/mo",
    description:
      "Everything in Basic, plus early access to new releases.",
  },
];

export default function SubscribePage() {
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-2">Subscribe</h1>
      <p className="text-foreground/60 text-sm mb-6">
        A subscription unlocks all subscription-access items. Payment is
        currently simulated — no real charge is made.
      </p>
      <TierSelector />
    </div>
  );
}

function TierSelector() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>(TIERS[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    setError(null);
    const result = await subscribeAction(selected);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/account"), 1500);
    }
  }

  if (success) {
    return (
      <div className="text-green-600 font-medium">
        ✓ Subscription activated! Redirecting to your account…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {TIERS.map((tier) => (
        <label
          key={tier.id}
          className={`flex items-start gap-4 border rounded-lg p-4 cursor-pointer transition-colors ${
            selected === tier.id
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
              : "border-foreground/20 hover:border-foreground/40"
          }`}
        >
          <input
            type="radio"
            name="tier"
            value={tier.id}
            checked={selected === tier.id}
            onChange={() => setSelected(tier.id)}
            className="mt-1"
          />
          <div>
            <p className="font-semibold">
              {tier.name}{" "}
              <span className="text-foreground/60 text-sm font-normal">
                {tier.price}
              </span>
            </p>
            <p className="text-sm text-foreground/60">{tier.description}</p>
          </div>
        </label>
      ))}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full bg-blue-600 text-white font-medium py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing…" : "Subscribe (Simulated)"}
      </button>
    </div>
  );
}
