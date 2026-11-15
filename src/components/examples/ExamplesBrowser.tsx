"use client";

import { useState } from "react";
import Link from "next/link";
import { EXAMPLE_BLUEPRINTS, ExampleBlueprint } from "@/lib/examplesData";
import { Archetype } from "@/store/useWizardStore";
import {
  CheckCheck,
  CheckCircle2,
  Copy,
  Download,
  FileCode2,
  Search,
  Terminal,
} from "lucide-react";

const FILTERS: { id: "all" | Archetype; label: string }[] = [
  { id: "all", label: "All Blueprints" },
  { id: "pipeline", label: "CI/CD Pipelines" },
  { id: "terraform", label: "Terraform HCL" },
  { id: "kubernetes", label: "Kubernetes" },
  { id: "docker", label: "Docker Compose" },
];

export default function ExamplesBrowser() {
  const [activeFilter, setActiveFilter] = useState<"all" | Archetype>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(EXAMPLE_BLUEPRINTS[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = EXAMPLE_BLUEPRINTS.filter((bp) => {
    const matchesType = activeFilter === "all" || bp.archetype === activeFilter;
    const q = query.trim().toLowerCase();
    if (!q) return matchesType;
    const searchable = [bp.title, bp.summary, bp.targetPlatform, ...bp.tags]
      .join(" ")
      .toLowerCase();
    return matchesType && searchable.includes(q);
  });

  const activeBlueprint: ExampleBlueprint =
    filtered.find((b) => b.id === selectedId) || filtered[0] || EXAMPLE_BLUEPRINTS[0];

  const handleCopy = async (bp: ExampleBlueprint) => {
    await navigator.clipboard.writeText(bp.code).catch(() => {});
    setCopiedId(bp.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (bp: ExampleBlueprint) => {
    const blob = new Blob([bp.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = bp.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 rounded-xl bg-[#0d0f14] border border-white/[0.08]">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => {
            const active = activeFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  active
                    ? "bg-cyan-400/15 text-cyan-200 border border-cyan-400/40"
                    : "text-zinc-400 hover:text-zinc-100 border border-transparent hover:bg-white/[0.04]"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="search"
            aria-label="Search blueprints"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by stack, AWS, OIDC, HPA..."
            className="w-full bg-[#090b0f] border border-white/[0.08] rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-400/50"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 rounded-xl bg-[#0d0f14] border border-white/[0.08] text-center space-y-2">
          <FileCode2 size={24} className="mx-auto text-zinc-500" />
          <h3 className="text-sm font-semibold text-zinc-200">No matching blueprints</h3>
          <p className="text-xs text-zinc-400">
            Clear your search filter or generate a custom specification directly in the Studio.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveFilter("all");
              setQuery("");
            }}
            className="mt-2 inline-flex px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Blueprint Selector List */}
          <div className="lg:col-span-5 space-y-3">
            {filtered.map((bp) => {
              const isSelected = bp.id === activeBlueprint.id;
              return (
                <button
                  key={bp.id}
                  type="button"
                  onClick={() => setSelectedId(bp.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all space-y-2.5 ${
                    isSelected
                      ? "bg-[#0d0f14] border-cyan-400/50 shadow-[0_0_0_1px_rgba(34,211,238,0.15)]"
                      : "bg-[#0d0f14]/60 border-white/[0.07] hover:border-white/[0.16] hover:bg-[#0d0f14]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-zinc-900 text-cyan-300 border border-white/[0.08]">
                      {bp.archetype} · {bp.targetPlatform}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-500">{bp.fileName}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-zinc-100">{bp.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                    {bp.summary}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {bp.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-900/90 text-zinc-400 border border-white/[0.06]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Detailed Inspector & Code Viewer */}
          <div className="lg:col-span-7 rounded-xl bg-[#0d0f14] border border-white/[0.08] overflow-hidden lg:sticky lg:top-20">
            <div className="p-5 border-b border-white/[0.08] space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-mono text-[11px] text-cyan-400">
                    {activeBlueprint.filePath}
                  </div>
                  <h2 className="text-lg font-bold text-zinc-100">{activeBlueprint.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/?blueprint=${activeBlueprint.id}#studio`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
                  >
                    <Terminal size={12} />
                    <span>Open in Studio Editor</span>
                  </Link>
                  <Link
                    href={`/?blueprint=${activeBlueprint.id}&mode=customize#studio`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.1] transition-colors"
                  >
                    <span>Customize with AI</span>
                  </Link>
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">{activeBlueprint.summary}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {activeBlueprint.highlights.map((item) => (
                  <div
                    key={item}
                    className="p-2.5 rounded-lg bg-[#090b0f] border border-white/[0.06] flex items-start gap-2 text-[11px] text-zinc-300 leading-snug"
                  >
                    <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Toolbar */}
            <div className="px-4 py-2.5 bg-[#090b0f] border-b border-white/[0.07] flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
                <span>{activeBlueprint.fileName}</span>
                <span className="text-zinc-600">·</span>
                <span>{activeBlueprint.code.split("\n").length} lines</span>
                <span className="text-zinc-600">·</span>
                <span className="uppercase text-emerald-400">{activeBlueprint.language}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleCopy(activeBlueprint)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-white/[0.08]"
                >
                  {copiedId === activeBlueprint.id ? (
                    <CheckCheck size={12} className="text-emerald-400" />
                  ) : (
                    <Copy size={12} />
                  )}
                  <span>{copiedId === activeBlueprint.id ? "Copied" : "Copy"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(activeBlueprint)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-white/[0.08]"
                >
                  <Download size={12} />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Numbered Code Listing */}
            <div className="max-h-[520px] overflow-auto bg-[#07090d] p-4 font-mono text-xs leading-relaxed">
              <table className="w-full border-collapse">
                <tbody>
                  {activeBlueprint.code.split("\n").map((line, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="select-none pr-4 text-right text-zinc-600 w-8 align-top">
                        {i + 1}
                      </td>
                      <td className="text-zinc-200 whitespace-pre">{line || " "}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
