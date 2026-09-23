import Link from "next/link";
import Image from "next/image";
import type { Title } from "@/lib/types";
import { getImageUrl } from "@/lib/utils";

interface Props {
  title: Title;
}

export function TitleCard({ title }: Props) {
  // Best-effort cover: we don't have an item_id here, so we try a known path
  // or fall back to a placeholder. The convention uses item_id which isn't
  // available at browse time — show a placeholder and let the title detail
  // page handle the real cover.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const coverUrl = `${supabaseUrl}/storage/v1/object/public/manga-ln-assets/${title.title_id}/cover.jpg`;

  return (
    <Link
      href={`/titles/${title.title_id}`}
      className="group block border border-foreground/10 rounded-lg overflow-hidden hover:border-foreground/30 transition-colors"
    >
      <div className="aspect-[3/4] relative bg-foreground/5">
        <Image
          src={coverUrl}
          alt={`${title.title_name} cover`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => {}}
        />
        {/* Fallback text if image fails */}
        <div className="absolute inset-0 flex items-center justify-center text-foreground/20 text-4xl font-bold select-none pointer-events-none">
          {title.title_name.charAt(0).toUpperCase()}
        </div>
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm leading-tight line-clamp-2">
          {title.title_name}
        </p>
        <p className="text-xs text-foreground/50 mt-1 capitalize">
          {title.origin_type ?? "—"}
        </p>
      </div>
    </Link>
  );
}
