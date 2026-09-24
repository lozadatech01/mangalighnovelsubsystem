import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CatalogCardProps = {
  titleId: string;
  titleName: string;
  originType: string | null;
  itemCount: number;
  itemTypes: string[];
  formats: string[];
  minPrice: number | null;
};

export function CatalogCard({
  titleId,
  titleName,
  originType,
  itemCount,
  itemTypes,
  formats,
  minPrice,
}: CatalogCardProps) {
  return (
    <Link href={`/titles/${titleId}`}>
      <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <span className="rounded-full border px-2 py-1 text-xs text-muted-foreground">
              {originType ?? "catalog"}
            </span>
            <span className="text-xs text-muted-foreground">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </div>
          <CardTitle>{titleName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 text-xs">
            {itemTypes.map((type) => (
              <span key={type} className="rounded bg-secondary px-2 py-1">
                {type === "light_novel" ? "Light Novel" : "Manga"}
              </span>
            ))}
            {formats.map((format) => (
              <span key={format} className="rounded border px-2 py-1">
                {format}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            From{" "}
            <span className="font-medium text-foreground">
              {minPrice == null ? "Free" : `₱${minPrice.toFixed(2)}`}
            </span>
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
