import type { ButtonHTMLAttributes } from "react";
import { Link } from "react-router-dom";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
  to?: string;
};

export function Button({ variant = "primary", to, className = "", children, ...props }: Props) {
  const classes = `inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 ${variant === "primary" ? "bg-teal text-deep shadow-soft hover:bg-teal-dark hover:!text-white" : "border border-line bg-white text-ink hover:border-teal hover:!text-white"} ${className}`;
  return to ? <Link className={classes} to={to}>{children}</Link> : <button className={classes} {...props}>{children}</button>;
}