"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "HOME" },
  { href: "/catalog", label: "CATALOG" },
  { href: "/artists", label: "ARTISTS" },
  { href: "/about", label: "ABOUT" },
];

export default function MainNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="메인 메뉴">
      {links.map(({ href, label }) => {
        const active =
          pathname === href ||
          (href !== "/" && pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
