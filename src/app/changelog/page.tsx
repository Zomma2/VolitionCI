import type { Metadata } from "next";
import Link from "next/link";
import { CHANGELOG_ENTRIES } from "@/lib/changelogData";
import { ArrowRight, ArrowUpRight, GitCommit } from "lucide-react";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Engineering release history, architecture upgrades, and multi-provider LLM routing updates for VolitionCI.",
};

const CATEGORY_STYLES: Record<string, string> = {
  Architecture: "bg-cyan-400/10 text-cyan-300 border-cyan-400/25",
  "AI Routing": "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
  Security: "bg-amber-500/10 text-amber-300 border-amber-500/25",
  "Studio UX": "bg-sky-500/10 text-sky-300 border-sky-500/25",
  Infrastructure: "bg-zinc-800 text-zinc-300 border-white/[0.12]",
  Platform: "bg-teal-500/10 text-teal-300 border-teal-500/25",
};

export default function ChangelogPage() {
  return (
    <div className="bg-grid-surface flex-1">
      <section className="border-b border-white/[0.07] bg-[#09090b]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="font-mono text-[11px] uppercase tracking-wider text-cyan-400">
              Release Notes
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
              Engineering Changelog
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Architectural milestones, synthesis engine improvements, validation gates, and model
              routing updates shipped to VolitionCI.
            </p>
          </div>
          <a
            href="https://github.com/Zomma2/VolitionCI/commits/dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.09] shrink-0"
          >
            <GitCommit size={13} className="text-zinc-400" />
            <span>Commit Log</span>
            <ArrowUpRight size={12} className="text-zinc-500" />
          </a>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="relative border-l border-white/[0.09] ml-3 sm:ml-4 space-y-10">
          {CHANGELOG_ENTRIES.map((entry, idx) => (
            <article
              key={entry.version}
              id={entry.version}
              className="relative pl-6 sm:pl-8 scroll-mt-20"
            >
              <span
                className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border ${
                  idx === 0
                    ? "bg-cyan-400 border-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.6)]"
                    : "bg-zinc-800 border-zinc-600"
                }`}
              />

              <div className="p-6 rounded-xl bg-[#0d0f14] border border-white/[0.08] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-bold text-zinc-100">
                      {entry.version}
                    </span>
                    <span
                      className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded border ${
                        idx === 0
                          ? "bg-cyan-400/10 text-cyan-300 border-cyan-400/30"
                          : "bg-zinc-900 text-zinc-400 border-white/[0.08]"
                      }`}
                    >
                      {entry.tag}
                    </span>
                  </div>
                  <time className="font-mono text-xs text-zinc-500">{entry.date}</time>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-base font-semibold text-zinc-100">{entry.title}</h2>
                  <p className="text-xs text-zinc-400 leading-relaxed">{entry.summary}</p>
                </div>

                <ul className="space-y-2.5 pt-1">
                  {entry.changes.map((item, i) => (
                    <li
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 text-xs"
                    >
                      <span
                        className={`inline-flex self-start font-mono text-[10px] px-2 py-0.5 rounded border shrink-0 sm:w-28 justify-center ${
                          CATEGORY_STYLES[item.category] ||
                          "bg-zinc-900 text-zinc-300 border-white/[0.1]"
                        }`}
                      >
                        {item.category}
                      </span>
                      <span className="text-zinc-300 leading-relaxed">{item.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-xl bg-[#0d0f14] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-100">
              Test the latest v0.4.2 synthesis capabilities
            </h3>
            <p className="text-xs text-zinc-400">
              Launch the Studio or load one of the 6 verified production blueprints.
            </p>
          </div>
          <Link
            href="/#studio"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shrink-0"
          >
            <span>Open Synthesis Studio</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </main>
    </div>
  );
}
