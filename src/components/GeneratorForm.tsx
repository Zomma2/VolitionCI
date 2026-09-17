"use client";

import { useState } from "react";
import type { PipelineFormData, RepoType, CIProvider, Infrastructure, OutputType, BaseImage, Database, ProxyServer } from "@/types/pipeline";
import { AlertCircle, ChevronDown, Zap, FileCode, Container, Network, Workflow } from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REPO_TYPES: { value: RepoType; label: string; desc: string }[] = [
  { value: "Monorepo", label: "Monorepo", desc: "Single repo, multiple packages" },
  { value: "Polyrepo", label: "Polyrepo", desc: "Separate repos per service" },
];

const CI_PROVIDERS: { value: CIProvider; label: string }[] = [
  { value: "GitHub Actions", label: "GitHub Actions" },
  { value: "GitLab CI", label: "GitLab CI" },
  { value: "Bitbucket Pipelines", label: "Bitbucket Pipelines" },
  { value: "CircleCI", label: "CircleCI" },
  { value: "Jenkins", label: "Jenkins" },
];

const OUTPUT_TYPES: { value: OutputType; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: "ci-pipeline", label: "CI/CD Pipeline", icon: <Workflow size={16} />, desc: "Full pipeline config" },
  { value: "dockerfile", label: "Dockerfile", icon: <Container size={16} />, desc: "Multi-stage build" },
  { value: "docker-compose", label: "Compose", icon: <FileCode size={16} />, desc: "Docker Compose" },
  { value: "proxy-config", label: "Proxy", icon: <Network size={16} />, desc: "Nginx / HAProxy" },
];

const INFRA_OPTIONS: { value: Infrastructure; icon: string }[] = [
  { value: "Docker", icon: "🐳" },
  { value: "Kubernetes", icon: "☸" },
  { value: "AWS", icon: "☁" },
  { value: "GCP", icon: "🌐" },
  { value: "Azure", icon: "⚡" },
  { value: "Terraform", icon: "🔷" },
  { value: "Helm", icon: "⛵" },
  { value: "ArgoCD", icon: "🔄" },
];

const BASE_IMAGES: { value: BaseImage; icon: string }[] = [
  { value: "Node.js", icon: "🟢" },
  { value: "Python", icon: "🐍" },
  { value: "Go", icon: "🐹" },
  { value: "Java", icon: "☕" },
  { value: "Rust", icon: "🦀" },
  { value: "Ruby", icon: "♦️" },
  { value: "PHP", icon: "🐘" },
  { value: "Generic", icon: "📦" },
];

const DATABASES: { value: Database; icon: string }[] = [
  { value: "PostgreSQL", icon: "🐘" },
  { value: "MySQL", icon: "🐬" },
  { value: "MongoDB", icon: "🍃" },
  { value: "Redis", icon: "🔴" },
  { value: "Elasticsearch", icon: "🔍" },
  { value: "RabbitMQ", icon: "🐇" },
];

const PROXY_SERVERS: { value: ProxyServer; label: string }[] = [
  { value: "Nginx", label: "Nginx" },
  { value: "HAProxy", label: "HAProxy" },
  { value: "Traefik", label: "Traefik" },
  { value: "Apache", label: "Apache HTTP Server" },
  { value: "Caddy", label: "Caddy" },
];

interface FormErrors {
  repoType?: string;
  ciProvider?: string;
  customRequirements?: string;
}

function validateForm(data: PipelineFormData): FormErrors {
  const errors: FormErrors = {};
  if (data.outputType === "ci-pipeline") {
    if (!data.repoType) errors.repoType = "Select a repository type";
    if (!data.ciProvider) errors.ciProvider = "Select a CI/CD provider";
  }
  if (data.customRequirements.trim().length > 0 && data.customRequirements.trim().length < 10) {
    errors.customRequirements = "At least 10 characters required";
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GeneratorFormProps {
  onSubmit: (data: PipelineFormData) => void;
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GeneratorForm({ onSubmit, isLoading }: GeneratorFormProps) {
  const [formData, setFormData] = useState<PipelineFormData>({
    outputType: "ci-pipeline",
    customRequirements: "",
    repoType: "Monorepo",
    ciProvider: "GitHub Actions",
    infrastructure: [],
    baseImage: "Node.js",
    databases: [],
    proxyServer: "Nginx",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  function handleInfraChange(value: Infrastructure) {
    setFormData((prev) => ({
      ...prev,
      infrastructure: prev.infrastructure.includes(value)
        ? prev.infrastructure.filter((i) => i !== value)
        : [...prev.infrastructure, value],
    }));
  }

  function handleDatabaseChange(value: Database) {
    setFormData((prev) => ({
      ...prev,
      databases: prev.databases.includes(value)
        ? prev.databases.filter((d) => d !== value)
        : [...prev.databases, value],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateForm(formData);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 h-full">

      {/* ── Section label ── */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-400/80">
          Configuration
        </p>
        <h2 className="text-lg font-bold text-white">
          Pipeline Parameters
        </h2>
      </div>

      {/* ── Output Type ── */}
      <div className="space-y-2.5">
        <Label>Output Type</Label>
        <div className="grid grid-cols-4 gap-1.5">
          {OUTPUT_TYPES.map(({ value, label, icon, desc }) => {
            const active = formData.outputType === value;
            return (
              <button
                key={value}
                type="button"
                disabled={isLoading}
                onClick={() => setFormData(p => ({ ...p, outputType: value }))}
                title={desc}
                className={`flex flex-col items-center gap-1.5 py-2.5 px-1.5 rounded-xl border text-center transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                  ${active
                    ? "border-violet-500/60 bg-violet-500/10 text-violet-300 shadow-[0_0_12px_rgb(139_92_246_/_0.12)]"
                    : "border-white/[0.05] bg-white/[0.02] text-white/35 hover:border-white/10 hover:text-white/60 hover:bg-white/[0.04]"
                  }`}
              >
                <span className={active ? "text-violet-400" : "text-white/30"}>{icon}</span>
                <span className="text-[10px] font-medium leading-tight">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Dynamic Fields based on Output Type ── */}
      
      {/* CI/CD PIPELINE FIELDS */}
      {formData.outputType === "ci-pipeline" && (
        <>
          <div className="space-y-2.5">
            <Label>Repository Structure</Label>
            <div className="grid grid-cols-2 gap-2">
              {REPO_TYPES.map(({ value, label, desc }) => {
                const active = formData.repoType === value;
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={isLoading}
                    onClick={() => { setFormData(p => ({ ...p, repoType: value })); setErrors(p => ({ ...p, repoType: undefined })); }}
                    className={`relative flex flex-col items-start p-3.5 rounded-xl border text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                      ${active
                        ? "border-violet-500/70 bg-violet-500/10 shadow-[0_0_16px_rgb(139_92_246_/_0.15)]"
                        : "border-white/[0.06] bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.05]"
                      }`}
                  >
                    {active && (
                      <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_rgb(139_92_246_/_0.8)]" />
                    )}
                    <span className={`text-sm font-semibold ${active ? "text-violet-300" : "text-white/80"}`}>{label}</span>
                    <span className="text-[11px] text-white/30 mt-0.5">{desc}</span>
                  </button>
                );
              })}
            </div>
            {errors.repoType && <FieldError msg={errors.repoType} />}
          </div>

          <div className="space-y-2.5">
            <Label>CI/CD Provider</Label>
            <div className="relative">
              <select
                value={formData.ciProvider}
                disabled={isLoading}
                onChange={(e) => { setFormData(p => ({ ...p, ciProvider: e.target.value as CIProvider })); setErrors(p => ({ ...p, ciProvider: undefined })); }}
                className="w-full appearance-none bg-white/[0.04] border border-white/[0.07] text-white text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgb(139_92_246_/_0.1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ colorScheme: "dark" }}
              >
                {CI_PROVIDERS.map(({ value, label }) => (
                  <option key={value} value={value} className="bg-slate-900">{label}</option>
                ))}
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            </div>
            {errors.ciProvider && <FieldError msg={errors.ciProvider} />}
          </div>

          <div className="space-y-2.5">
            <Label>Infrastructure <span className="text-white/25 font-normal text-[11px] ml-1">optional</span></Label>
            <div className="grid grid-cols-4 gap-1.5">
              {INFRA_OPTIONS.map(({ value, icon }) => {
                const active = formData.infrastructure.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleInfraChange(value)}
                    className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-center transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                      ${active
                        ? "border-violet-500/60 bg-violet-500/10 text-violet-300"
                        : "border-white/[0.05] bg-white/[0.02] text-white/40 hover:border-white/10 hover:text-white/70 hover:bg-white/[0.04]"
                      }`}
                  >
                    <span className="text-base leading-none">{icon}</span>
                    <span className="text-[10px] font-medium leading-none">{value}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* DOCKERFILE FIELDS */}
      {formData.outputType === "dockerfile" && (
        <div className="space-y-2.5">
          <Label>Base Tech Stack</Label>
          <div className="grid grid-cols-4 gap-1.5">
            {BASE_IMAGES.map(({ value, icon }) => {
              const active = formData.baseImage === value;
              return (
                <button
                  key={value}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setFormData(p => ({ ...p, baseImage: value }))}
                  className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-center transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                    ${active
                      ? "border-violet-500/60 bg-violet-500/10 text-violet-300 shadow-[0_0_12px_rgb(139_92_246_/_0.12)]"
                      : "border-white/[0.05] bg-white/[0.02] text-white/40 hover:border-white/10 hover:text-white/70 hover:bg-white/[0.04]"
                    }`}
                >
                  <span className="text-base leading-none">{icon}</span>
                  <span className="text-[10px] font-medium leading-none">{value}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* DOCKER COMPOSE FIELDS */}
      {formData.outputType === "docker-compose" && (
        <div className="space-y-2.5">
          <Label>Included Databases / Services <span className="text-white/25 font-normal text-[11px] ml-1">optional</span></Label>
          <div className="grid grid-cols-3 gap-1.5">
            {DATABASES.map(({ value, icon }) => {
              const active = formData.databases.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleDatabaseChange(value)}
                  className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-center transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                    ${active
                      ? "border-violet-500/60 bg-violet-500/10 text-violet-300"
                      : "border-white/[0.05] bg-white/[0.02] text-white/40 hover:border-white/10 hover:text-white/70 hover:bg-white/[0.04]"
                    }`}
                >
                  <span className="text-base leading-none">{icon}</span>
                  <span className="text-[10px] font-medium leading-none">{value}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* PROXY CONFIG FIELDS */}
      {formData.outputType === "proxy-config" && (
        <div className="space-y-2.5">
          <Label>Proxy Server</Label>
          <div className="relative">
            <select
              value={formData.proxyServer}
              disabled={isLoading}
              onChange={(e) => setFormData(p => ({ ...p, proxyServer: e.target.value as ProxyServer }))}
              className="w-full appearance-none bg-white/[0.04] border border-white/[0.07] text-white text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgb(139_92_246_/_0.1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ colorScheme: "dark" }}
            >
              {PROXY_SERVERS.map(({ value, label }) => (
                <option key={value} value={value} className="bg-slate-900">{label}</option>
              ))}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          </div>
        </div>
      )}

      {/* ── Custom Requirements ── */}
      <div className="space-y-2.5 flex-1">
        <Label>Custom Requirements <span className="text-white/25 font-normal text-[11px] ml-1">optional</span></Label>
        <textarea
          value={formData.customRequirements}
          onChange={(e) => { setFormData(p => ({ ...p, customRequirements: e.target.value })); setErrors(p => ({ ...p, customRequirements: undefined })); }}
          disabled={isLoading}
          placeholder="e.g. Run actionlint before building the Docker image. Add a canary deployment stage. Use OIDC for AWS auth..."
          rows={3}
          className="w-full resize-none bg-white/[0.04] border border-white/[0.07] text-white text-sm rounded-xl px-4 py-3 placeholder-white/20 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgb(139_92_246_/_0.1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed"
        />
        {errors.customRequirements && <FieldError msg={errors.customRequirements} />}
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={isLoading}
        className="relative w-full py-3.5 rounded-xl font-semibold text-sm text-white overflow-hidden transition-all duration-200 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent group mt-auto"
        style={{
          background: isLoading
            ? "linear-gradient(135deg, #4c1d95, #3730a3)"
            : "linear-gradient(135deg, #7c3aed, #4f46e5)",
          boxShadow: isLoading ? "none" : "0 0 32px rgb(124 58 237 / 0.4), inset 0 1px 0 rgb(255 255 255 / 0.1)",
        }}
      >
        {!isLoading && (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        )}
        <span className="relative flex items-center justify-center gap-2.5">
          {isLoading ? (
            <>
              <Spinner />
              Generating&hellip;
            </>
          ) : (
            <>
              <Zap size={15} className="text-violet-200" />
              Generate Configuration
            </>
          )}
        </span>
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">{children}</p>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <p className="flex items-center gap-1.5 text-[11px] text-red-400/90">
      <AlertCircle size={11} />
      {msg}
    </p>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white/70" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
