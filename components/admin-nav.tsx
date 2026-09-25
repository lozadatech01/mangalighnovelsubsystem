import Link from "next/link";

export function AdminNav() {
  return (
    <nav className="border-b bg-secondary/30">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-3 text-sm">
        <Link href="/admin" className="font-medium hover:underline">
          Dashboard
        </Link>
        <Link href="/admin/titles" className="hover:underline">
          Titles
        </Link>
      </div>
    </nav>
  );
}
