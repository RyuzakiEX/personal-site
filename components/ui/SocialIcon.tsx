import { ReactNode } from "react";

interface SocialIconProps {
  href: string;
  label: string;
  children: ReactNode;
}

export default function SocialIcon({ href, label, children }: SocialIconProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="p-3 glass-card hover:shadow-glow hover:text-cyan-glow transition-all duration-200 flex items-center justify-center"
    >
      {children}
    </a>
  );
}
