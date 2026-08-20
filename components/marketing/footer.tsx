import Link from "next/link";

import { Logo } from "@/components/shared/logo";

const productLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

const accountLinks = [
  { href: "/signup", label: "Create account" },
  { href: "/signin", label: "Sign in" },
];

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col justify-between gap-10 sm:flex-row">
          <div className="max-w-xs">
            <Logo tagline="Uptime & server monitoring" />
            <p className="mt-4 text-sm text-muted-foreground">
              Real-time HTTP checks, incident tracking, and duration-based uptime for the
              services you can&apos;t afford to have go dark.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            <div>
              <p className="text-sm font-semibold">Product</p>
              <ul className="mt-3 space-y-2">
                {productLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold">Account</p>
              <ul className="mt-3 space-y-2">
                {accountLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Ping. All rights reserved.</p>
          <p>Built with Spring Boot, PostgreSQL, and Next.js.</p>
        </div>
      </div>
    </footer>
  );
}
