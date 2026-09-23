import Link from "next/link";
import type { Item } from "@/lib/types";

interface Props {
  item: Item;
  titleId: string;
}

export function ItemRow({ item, titleId }: Props) {
  const label = item.item_type === "manga" ? "Chapter" : "Vol.";
  const isReleased =
    !item.release_date || new Date(item.release_date) <= new Date();

  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-foreground/5 transition-colors">
      <div className="flex items-center gap-3 text-sm">
        <span className="text-foreground/50 w-16 shrink-0">
          {label} {item.chapter_or_volume_number ?? "—"}
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {item.is_free_preview && (
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-1.5 py-0.5 rounded">
              Free
            </span>
          )}
          {item.format && (
            <span className="bg-foreground/10 text-xs px-1.5 py-0.5 rounded capitalize">
              {item.format}
            </span>
          )}
          {!isReleased && item.release_date && (
            <span className="text-xs text-amber-600">
              Releases {new Date(item.release_date).toLocaleDateString()}
            </span>
          )}
          {item.format === "physical" &&
            item.stock_quantity !== null &&
            item.stock_quantity === 0 && (
              <span className="text-xs text-red-500">Out of stock</span>
            )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {item.price != null && (
          <span className="text-sm text-foreground/70">
            ₱{Number(item.price).toFixed(2)}
          </span>
        )}
        <Link
          href={`/titles/${titleId}/items/${item.item_id}`}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          View →
        </Link>
      </div>
    </div>
  );
}
