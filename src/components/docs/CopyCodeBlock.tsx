"use client";

import { useState } from "react";
import { CheckCheck, Copy } from "lucide-react";

export default function CopyCodeBlock({
  title,
  code,
}: {
  title: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#07090d] overflow-hidden">
      <div className="px-3.5 py-2 bg-[#090b0f] border-b border-white/[0.07] flex items-center justify-between">
        <span className="font-mono text-[11px] text-zinc-400">{title}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          {copied ? (
            <CheckCheck size={12} className="text-emerald-400" />
          ) : (
            <Copy size={12} />
          )}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto font-mono text-xs text-zinc-200 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
