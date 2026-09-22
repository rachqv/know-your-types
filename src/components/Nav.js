"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Nav.module.css";

const TABS = [
  { href: "/", icon: "🗺️", label: "Map" },
  { href: "/lab", icon: "🧪", label: "Combos" },
  { href: "/journal", icon: "📖", label: "Journal" },
  { href: "/arena", icon: "⚔️", label: "Arena" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className={styles.nav}>
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={styles.link}
          aria-current={pathname === t.href ? "page" : undefined}
        >
          <span className={styles.icon} aria-hidden="true">
            {t.icon}
          </span>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
