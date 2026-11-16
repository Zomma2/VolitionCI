import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import logoImg from "../../../public/logo.png";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.07] bg-[#09090b] text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-6 h-6 rounded bg-zinc-900 border border-white/[0.08]">
                <Image
                  src={logoImg}
                  alt="VolitionCI"
                  width={15}
                  height={15}
                  className="object-contain"
                />
              </div>
              <span className="font-semibold text-sm text-zinc-100 tracking-tight">
                VolitionCI
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-white/[0.07] text-zinc-400">
                v0.4.2-beta
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Configuration studio for generating and validating CI/CD workflows, Terraform HCL
              modules, Kubernetes manifests, and Docker Compose files.
            </p>
          </div>

          {/* Navigation */}
          <div className="md:col-span-2 space-y-2.5">
            <h3 className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              Product
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#studio" className="hover:text-white transition-colors">
                  Studio
                </Link>
              </li>
              <li>
                <Link href="/examples" className="hover:text-white transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="hover:text-white transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Targets */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              Targets
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/?archetype=pipeline#studio"
                  className="hover:text-white transition-colors"
                >
                  CI/CD Workflows
                </Link>
              </li>
              <li>
                <Link
                  href="/?archetype=terraform#studio"
                  className="hover:text-white transition-colors"
                >
                  Terraform HCL
                </Link>
              </li>
              <li>
                <Link
                  href="/?archetype=kubernetes#studio"
                  className="hover:text-white transition-colors"
                >
                  Kubernetes Manifests
                </Link>
              </li>
              <li>
                <Link
                  href="/?archetype=docker#studio"
                  className="hover:text-white transition-colors"
                >
                  Docker Compose
                </Link>
              </li>
            </ul>
          </div>

          {/* Reference */}
          <div className="md:col-span-3 space-y-2.5">
            <h3 className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              Documentation
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/docs#architecture" className="hover:text-white transition-colors">
                  Pipeline Architecture
                </Link>
              </li>
              <li>
                <Link href="/docs#validation" className="hover:text-white transition-colors">
                  YAML &amp; HCL Validation
                </Link>
              </li>
              <li>
                <Link href="/docs#model-routing" className="hover:text-white transition-colors">
                  Model Routing
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/Zomma2/VolitionCI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>GitHub Repository</span>
                  <ArrowUpRight size={11} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-500">
          <div>&copy; {new Date().getFullYear()} VolitionCI · Public Beta</div>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="text-zinc-300">Designed by Omar Hazem</span>
            <span className="text-zinc-700">·</span>
            <a
              href="https://meetomarhazem.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-200 hover:text-white transition-colors"
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
