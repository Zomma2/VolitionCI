"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight, GitBranch, Menu, Terminal, X } from "lucide-react";
import logoImg from "../../../public/logo.png";

const NAV_ITEMS = [
  { label: "Studio", href: "/" },
  { label: "Examples", href: "/examples" },
  { label: "Documentation", href: "/docs" },
  { label: "Changelog", href: "/changelog" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#09090b]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-7">
            <div className="flex items-center gap-2.5">
              <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
                <div className="relative flex items-center justify-center w-7 h-7 rounded-md bg-zinc-900 border border-white/[0.08] group-hover:border-cyan-400/40 transition-colors">
                  <Image
                    src={logoImg}
                    alt="VolitionCI"
                    width={20}
                    height={20}
                    className="object-contain"
                    priority
                  />
                </div>
                <span className="font-semibold text-sm tracking-tight text-zinc-100">
                  Volition<span className="text-cyan-400">CI</span>
                </span>
              </Link>
              <Link
                href="/changelog"
                className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-white/[0.08] hover:border-cyan-400/30 hover:text-cyan-300 transition-colors"
                title="View release changelog"
              >
                v0.4.2
              </Link>
            </div>

            <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-white/[0.07] text-white"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-2.5">
            <Link
              href="/docs#model-routing"
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900/90 border border-white/[0.07] hover:border-white/[0.14] text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="font-mono">4 LLM Engines Active</span>
            </Link>

            <a
              href="https://github.com/Zomma2/VolitionCI"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-300 border border-white/[0.08] bg-zinc-900/80 hover:bg-zinc-800/80 hover:text-white hover:border-white/[0.16] transition-colors"
            >
              <GitBranch size={13} className="text-zinc-400" />
              <span>GitHub</span>
              <ArrowUpRight size={12} className="text-zinc-500" />
            </a>

            {pathname !== "/" ? (
              <Link
                href="/#studio"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
              >
                <Terminal size={13} />
                <span>Open Studio</span>
              </Link>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.08] transition-colors"
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="md:hidden border-t border-white/[0.08] bg-[#09090b] px-4 py-3 space-y-2">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-white/[0.08] text-white"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
            <Link
              href="/docs#model-routing"
              className="inline-flex items-center gap-2 text-[11px] font-mono text-zinc-400"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              4 LLM Engines Active
            </Link>
            <a
              href="https://github.com/Zomma2/VolitionCI"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-200 border border-white/[0.1] bg-zinc-900"
            >
              <GitBranch size={12} />
              GitHub
              <ArrowUpRight size={11} />
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
