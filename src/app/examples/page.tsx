import type { Metadata } from "next";
import ExamplesBrowser from "@/components/examples/ExamplesBrowser";

export const metadata: Metadata = {
  title: "Blueprints Library",
  description:
    "Production-verified CI/CD pipelines, AWS & GCP Terraform modules, Kubernetes manifests, and Docker Compose blueprints ready to inspect or customize.",
};

export default function ExamplesPage() {
  return (
    <div className="bg-grid-surface flex-1">
      <section className="border-b border-white/[0.07] bg-[#09090b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-2">
          <div className="font-mono text-[11px] uppercase tracking-wider text-cyan-400">
            Reference Architectures
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
            Production Blueprints Library
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Inspect syntax-verified DevSecOps workflows and cloud infrastructure modules. Copy raw
            specifications, open any blueprint directly inside the Studio Monaco editor, or launch
            an AI consultation pre-seeded with its architecture.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <ExamplesBrowser />
      </main>
    </div>
  );
}
