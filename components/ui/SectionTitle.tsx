import type { ReactNode } from "react";

export default function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-2xl font-bold glow-text tracking-widest uppercase">
      {children}
    </h2>
  );
}
