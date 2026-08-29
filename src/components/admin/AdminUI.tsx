// Port of app/admin/_components/AdminUI.tsx — shared premium UI primitives
// for the admin panel. No hooks, no Next.js dependencies, ports verbatim.
import React from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-[#111827] tracking-tight">{title}</h1>
        {subtitle && <p className="text-neutral-500 mt-1 text-sm">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-neutral-200/70 shadow-sm shadow-neutral-200/40 overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  shipped: "bg-blue-50 text-blue-700 ring-blue-600/20",
  cancelled: "bg-red-50 text-red-700 ring-red-600/20",
  razorpay: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  admin: "bg-[#111827] text-white ring-[#111827]/10",
  user: "bg-neutral-100 text-neutral-600 ring-neutral-500/20",
};

export function Badge({ value }: { value: string }) {
  const cls =
    STATUS_STYLES[(value || "").toLowerCase()] ??
    "bg-neutral-100 text-neutral-600 ring-neutral-500/20";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${cls}`}
    >
      {value}
    </span>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <div className="p-16 text-center text-neutral-400 text-sm">{text}</div>;
}

export function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-6 py-4 font-semibold text-left ${className}`}>{children}</th>
  );
}
