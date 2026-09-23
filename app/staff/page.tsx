import Link from "next/link";

export const metadata = { title: "Staff Dashboard — Loxada M&LN" };

export default function StaffPage() {
  const sections = [
    {
      title: "Content",
      links: [
        { href: "/staff/titles/new", label: "Add new title" },
        { href: "/staff/arcs/new", label: "Add new arc" },
        { href: "/staff/items/new", label: "Add new item (chapter/volume)" },
      ],
    },
    {
      title: "Reports",
      links: [
        { href: "/staff/reports", label: "Monthly revenue & top chapters" },
      ],
    },
    {
      title: "Customer View",
      links: [{ href: "/titles", label: "Browse titles (as customer)" }],
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Staff Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="border border-foreground/10 rounded-lg p-5"
          >
            <h2 className="font-semibold text-sm uppercase text-foreground/50 tracking-wide mb-3">
              {section.title}
            </h2>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
