interface BadgeProps {
  label: string;
}

export default function Badge({ label }: BadgeProps) {
  return <span className="electric-badge">{label}</span>;
}
