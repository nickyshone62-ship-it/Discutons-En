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
  sm: { icon: 34, textSize: "text-lg", gap: "gap-2" },
  md: { icon: 44, textSize: "text-2xl", gap: "gap-2.5" },
  lg: { icon: 58, textSize: "text-3xl", gap: "gap-3.5" },
  xl: { icon: 76, textSize: "text-4xl sm:text-5xl", gap: "gap-4" },
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

  // Color theme parameters
  let mainGradStart = "#ffffff";
  let mainGradMid = "#60a5fa";
  let mainGradEnd = "#1d4ed8";
  let textColorDis = mode === "light" ? "text-blue-700" : "text-white";
  let textColorEn = mode === "light" ? "text-slate-900" : "text-sky-200";
  let cutoutColor = mode === "dark" ? "#071738" : mode === "light" ? "#ffffff" : "#0f2b5c";

  if (mode === "monochrome") {
    mainGradStart = "#ffffff";
    mainGradMid = "#f1f5f9";
    mainGradEnd = "#cbd5e1";
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
        {/* Main Ribbon Fluid Gradient */}
        <linearGradient id={`negRibbonGrad-${mode}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={mainGradStart} />
          <stop offset="50%" stopColor={mainGradMid} />
          <stop offset="100%" stopColor={mainGradEnd} />
        </linearGradient>

        {/* Secondary Ribbon Overlay Gradient for 3D Depth */}
        <linearGradient id={`negRibbonOverlay-${mode}`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={mainGradMid} stopOpacity="0.9" />
          <stop offset="100%" stopColor={mainGradEnd} stopOpacity="0.95" />
        </linearGradient>

        {/* Soft Glow Effect */}
        <filter id={`negGlow-${mode}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Dark background ring glow for dark mode */}
      {mode === "dark" && (
        <circle cx="50" cy="50" r="46" fill="#0f172a" fillOpacity="0.5" stroke="url(#negRibbonGrad-dark)" strokeWidth="1" strokeOpacity="0.2" />
      )}

      {/* Fluid Outer "D" Ribbon Body */}
      <path
        d="M 22 15 L 50 15 C 72 15 88 28 88 50 C 88 72 72 85 50 85 L 22 85 C 18 85 15 82 15 78 L 15 22 C 15 18 18 15 22 15 Z"
        fill={`url(#negRibbonGrad-${mode})`}
        filter={mode === "dark" ? `url(#negGlow-${mode})` : undefined}
      />

      {/* Top Fold Ribbon Curve giving 3D overlapping depth like the reference plane logo */}
      <path
        d="M 22 15 C 38 15 54 20 66 30 C 50 32 34 38 22 50 Z"
        fill={`url(#negRibbonOverlay-${mode})`}
        opacity="0.5"
      />

      {/* NEGATIVE SPACE CUTOUT: Sculpted Speech Bubble + Chat Tail inside the "D" Loop */}
      <path
        d="M 32 32 L 56 32 C 64 32 70 38 70 46 C 70 54 64 60 56 60 L 44 60 L 36 68 L 38 60 L 32 60 C 28 60 26 57 26 53 L 26 38 C 26 34 28 32 32 32 Z"
        fill={cutoutColor}
      />

      {/* Small Chat Dot in Negative Space */}
      <circle cx="43" cy="46" r="3" fill={`url(#negRibbonGrad-${mode})`} />
      <circle cx="53" cy="46" r="3" fill={`url(#negRibbonGrad-${mode})`} />
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
