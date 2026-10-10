"use client";

import Link from "next/link";
import type { MouseEventHandler } from "react";
import { ArrowRight } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type MotionButtonProps = {
  label: string;
  href?: string;
  classes?: string;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export default function MotionButton({
  label,
  href,
  classes,
  className,
  type = "button",
  disabled,
  onClick,
}: MotionButtonProps) {
  const styles = cn("motion-button", classes, className);
  const content = (
    <>
      <span className="motion-button-fill" aria-hidden="true" />
      <span className="motion-button-icon" aria-hidden="true">
        <ArrowRight size={20} strokeWidth={2.25} />
      </span>
      <span className="motion-button-label">
        {label}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={styles}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={styles}
    >
      {content}
    </button>
  );
}
