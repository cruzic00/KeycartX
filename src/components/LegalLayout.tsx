// Shared shell for the policy pages, so /privacy and /terms stay visually
// consistent and neither has to re-invent the typography.
import type { ReactNode } from "react";

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-[#111827] mb-2">{title}</h2>
      <div className="space-y-3 text-neutral-600 leading-relaxed">{children}</div>
    </section>
  );
}

export default function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-3xl font-extrabold text-[#111827]">{title}</h1>
      <p className="mt-2 text-sm text-neutral-500">Last updated: {updated}</p>
      <div className="mt-2 h-px bg-neutral-200" />
      {children}
      <p className="mt-12 text-sm text-neutral-500">
        Questions about this page? Write to{" "}
        <a href="mailto:mynonlineshop@gmail.com" className="underline text-[#111827]">
          mynonlineshop@gmail.com
        </a>
        .
      </p>
    </div>
  );
}
