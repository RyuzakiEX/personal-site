import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, glow = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("glass-card p-6", glow && "animate-glow-pulse", className)}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";
export default Card;
