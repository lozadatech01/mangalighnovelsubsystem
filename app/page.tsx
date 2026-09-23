import { redirect } from "next/navigation";

/**
 * Root page — redirect immediately to the titles browse page.
 * All customer-facing content lives under /titles.
 */
export default function Home() {
  redirect("/titles");
}
