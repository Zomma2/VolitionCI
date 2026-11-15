import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import logoImg from "../../../public/logo.png";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#07080a] text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand & Engine Status */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-900 border border-white/[0.08]">
                <Image
                  src={logoImg}
                  alt="VolitionCI"
                  width={18}
                  height={18}
                  className="object-contain"
                />
              </div>
              <span className="font-semibold text-sm text-zinc-100 tracking-tight">
                Volition<span className="text-cyan-400">CI</span>
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-white/[0.08] text-zinc-400">
                v0.4.2
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Autonomous DevSecOps and Infrastructure-as-Code synthesis platform. Combines repository
              tree analysis, consultative architectural interrogation, and ReAct self-healing
              validation.
            </p>

            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-zinc-900/90 border border-white/[0.07] text-[11px] text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="font-mono">Synthesis &amp; Validation Pipelines Online</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-200">
              Platform
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#studio" className="hover:text-white transition-colors">
                  Synthesis Studio
                </Link>
              </li>
              <li>
                <Link href="/examples" className="hover:text-white transition-colors">
                  Blueprints Library
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="hover:text-white transition-colors">
                  Release Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Generation Targets */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-200">
              Generation Targets
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/?archetype=pipeline#studio"
                  className="hover:text-white transition-colors"
                >
                  CI/CD Pipelines (GitHub, GitLab, Jenkins)
                </Link>
              </li>
              <li>
                <Link
                  href="/?archetype=terraform#studio"
                  className="hover:text-white transition-colors"
                >
                  Terraform HCL (AWS, GCP, Azure)
                </Link>
              </li>
              <li>
                <Link
                  href="/?archetype=kubernetes#studio"
                  className="hover:text-white transition-colors"
                >
                  Kubernetes Manifests (EKS, GKE, AKS)
                </Link>
              </li>
              <li>
                <Link
                  href="/?archetype=docker#studio"
                  className="hover:text-white transition-colors"
                >
                  Docker Compose Topologies
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture & Reference */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-200">
              Architecture &amp; Specs
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/docs#architecture" className="hover:text-white transition-colors">
                  ReAct Planner-Worker Engine
                </Link>
              </li>
              <li>
                <Link href="/docs#validation" className="hover:text-white transition-colors">
                  YAML &amp; HCL Self-Healing Gate
                </Link>
              </li>
              <li>
                <Link href="/docs#model-routing" className="hover:text-white transition-colors">
                  Multi-Provider LLM Failover
                </Link>
              </li>
              <li>
                <Link href="/docs#api-reference" className="hover:text-white transition-colors">
                  REST &amp; SSE Stream API
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/Zomma2/VolitionCI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>Source Repository</span>
                  <ArrowUpRight size={11} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.06] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span>&copy; {new Date().getFullYear()} VolitionCI. Open-source DevSecOps platform.</span>
            <span className="hidden sm:inline text-zinc-700">|</span>
            <span className="inline-flex items-center gap-1.5 text-zinc-400">
              <ShieldCheck size={12} className="text-cyan-400" />
              Zero-Trust OIDC &amp; Least-Privilege Baselines
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
            <span className="text-zinc-300 font-medium">Designed by Omar Hazem</span>
            <span className="text-zinc-700">·</span>
            <a
              href="https://meetomarhazem.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[11px] px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-white/[0.09] hover:border-cyan-400/40 text-cyan-300 hover:text-cyan-200 transition-colors"
            >
              <span>meetomarhazem.com</span>
              <ArrowUpRight size={11} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
