import Link from "next/link";
import { AuthButton } from "@/components/auth-button";

export function SiteHeader() {
  return (
    <header className="border-b bg-background/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold">
            Loxada Manga / Light Novel
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
            <Link href="/" className="hover:text-foreground">
              Catalog
            </Link>
            <Link href="/protected" className="hover:text-foreground">
              Workspace
            </Link>
          </nav>
        </div>
        <AuthButton />
      </div>
    </header>
  );
}
