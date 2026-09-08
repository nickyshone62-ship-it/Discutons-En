"use client";

import React from "react";
import Link from "next/link";

export type LogoVariant = "full" | "horizontal" | "icon";
export type LogoMode = "dark" | "light" | "monochrome";
export type LogoSize = "sm" | "md" | "lg" | "xl";

interface LogoProps {
  variant?: LogoVariant;
  mode?: LogoMode;
  size?: LogoSize;
  showText?: boolean;
  className?: string;
  href?: string;
}

const sizeDimensions: Record<LogoSize, { icon: number; textSize: string; gap: string }> = {
  sm: { icon: 32, textSize: "text-lg", gap: "gap-2" },
  md: { icon: 42, textSize: "text-2xl", gap: "gap-2.5" },
  lg: { icon: 56, textSize: "text-3xl", gap: "gap-3.5" },
  xl: { icon: 72, textSize: "text-4xl sm:text-5xl", gap: "gap-4" },
};

export default function Logo({
  variant = "horizontal",
  mode = "dark",
  size = "md",
  showText = true,
  className = "",
  href,
}: LogoProps) {
  const dim = sizeDimensions[size];
  const isIconOnly = variant === "icon" || !showText;
  const isStacked = variant === "full";

  // Color mappings based on mode
  let primaryGradientStart = "#22d3ee";
  let primaryGradientEnd = "#38bdf8";
  let secondaryGradient = "#6366f1";
  let textColorDis = mode === "light" ? "text-cyan-600" : "text-cyan-400";
  let textColorEn = mode === "light" ? "text-slate-900" : "text-white";

  if (mode === "monochrome") {
    primaryGradientStart = "#ffffff";
    primaryGradientEnd = "#e2e8f0";
    secondaryGradient = "#94a3b8";
    textColorDis = "text-white";
    textColorEn = "text-slate-200";
  }

  const symbolSvg = (
    <svg
      width={dim.icon}
      height={dim.icon}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      aria-hidden="true"
    >
      <defs>
        {/* Main Cyan Gradient */}
        <linearGradient id={`logoCyanGrad-${mode}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primaryGradientStart} />
          <stop offset="100%" stopColor={primaryGradientEnd} />
        </linearGradient>

        {/* Secondary Indigo/Accent Gradient */}
        <linearGradient id={`logoIndigoGrad-${mode}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={secondaryGradient} />
          <stop offset="100%" stopColor={primaryGradientStart} />
        </linearGradient>

        {/* Soft Glow Effect */}
        <filter id={`logoGlow-${mode}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Circle Container (Subtle Background Glow Ring) */}
      {mode === "dark" && (
        <circle cx="50" cy="50" r="46" fill="#0f172a" fillOpacity="0.6" stroke="url(#logoCyanGrad-dark)" strokeWidth="1.5" strokeOpacity="0.25" />
      )}

      {/* Main Symbol: Interlocking 'D' and 'E' Speech Loops */}
      {/* Loop 'D' - Primary Left-to-Right Chat Arc */}
      <path
        d="M 26 30 C 26 21 35 16 48 16 C 68 16 82 28 82 44 C 82 60 67 70 48 70 L 36 70 L 24 82 L 28 68 C 22 62 18 53 18 44 C 18 38 21 33 26 30 Z"
        fill={`url(#logoCyanGrad-${mode})`}
        filter={mode === "dark" ? `url(#logoGlow-${mode})` : undefined}
      />

      {/* Inner Interlocking Loop 'E' - Connected Dialogue Core */}
      <path
        d="M 44 32 C 55 32 64 38 64 47 C 64 54 57 60 46 60 C 40 60 34 58 30 54 L 30 46 L 54 46 C 56 46 57 44 57 42 C 57 40 56 38 54 38 L 30 38 C 34 34 39 32 44 32 Z"
        fill={mode === "dark" ? "#090d16" : mode === "light" ? "#ffffff" : "#0f172a"}
      />

      {/* Accent Pulse Dot - Connection Indicator */}
      <circle cx="68" cy="30" r="6" fill={`url(#logoIndigoGrad-${mode})`} />
    </svg>
  );

  const textContent = !isIconOnly && (
    <div className={`flex items-center tracking-tight font-black font-display ${dim.textSize}`}>
      <span className={`${textColorDis} drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]`}>DIS</span>
      <span className={textColorEn}>cutons-En</span>
    </div>
  );

  const containerClasses = `group inline-flex items-center ${
    isStacked ? "flex-col text-center gap-2" : `flex-row ${dim.gap}`
  } ${className}`;

  if (href) {
    return (
      <Link href={href} className={containerClasses}>
        {symbolSvg}
        {textContent}
      </Link>
    );
  }

  return (
    <div className={containerClasses}>
      {symbolSvg}
      {textContent}
    </div>
  );
}
