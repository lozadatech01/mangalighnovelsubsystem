import Link from "next/link";
import { AuthButton } from "@/components/auth-button";

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold">
            Loxada Manga / Light Novel
          </Link>
          <AuthButton />
        </div>
      </header>

      <section className="mx-auto flex min-h-[70vh] max-w-6xl items-center px-6 py-16">
        <div className="max-w-2xl space-y-5">
          <p className="text-sm font-medium text-muted-foreground">
            Manga / Light Novel Subsystem
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            The operational foundation for Loxada&apos;s manga and light novel business.
          </h1>
          <p className="text-lg text-muted-foreground">
            Catalog, reading, purchases, subscriptions, and preorders will be built here.
          </p>
          <div className="flex gap-3">
            <Link
              href="/auth/login"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="rounded-md border px-4 py-2 text-sm font-medium"
            >
              Create account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
