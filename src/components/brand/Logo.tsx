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
  sm: { icon: 38, textSize: "text-xl", gap: "gap-2.5" },
  md: { icon: 48, textSize: "text-2xl sm:text-3xl", gap: "gap-3" },
  lg: { icon: 62, textSize: "text-3xl sm:text-4xl", gap: "gap-3.5" },
  xl: { icon: 82, textSize: "text-4xl sm:text-5xl", gap: "gap-4" },
};

export default function Logo({
  variant = "horizontal",
  mode = "light",
  size = "md",
  showText = true,
  className = "",
  href,
}: LogoProps) {
  const dim = sizeDimensions[size];
  const isIconOnly = variant === "icon" || !showText;
  const isStacked = variant === "full";

  // Hot Pink / Rose Fluid Ribbon Gradient
  const mainGradStart = "#ff2a6d";
  const mainGradMid = "#ff4b7d";
  const mainGradEnd = "#ff6699";
  const cutoutColor = mode === "dark" ? "#18030a" : "#ffffff";

  const symbolSvg = (
    <svg
      width={dim.icon}
      height={dim.icon}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_4px_12px_rgba(255,42,109,0.35)]"
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

      {/* Outer Glow Ring */}
      <circle cx="50" cy="50" r="46" fill="#ff2a6d" fillOpacity="0.08" stroke="url(#negRibbonGrad-light)" strokeWidth="1.5" strokeOpacity="0.3" />

      {/* Fluid Outer "D" Ribbon Body */}
      <path
        d="M 22 15 L 50 15 C 72 15 88 28 88 50 C 88 72 72 85 50 85 L 22 85 C 18 85 15 82 15 78 L 15 22 C 15 18 18 15 22 15 Z"
        fill={`url(#negRibbonGrad-${mode})`}
        filter={`url(#negGlow-${mode})`}
      />

      {/* Top Fold Ribbon Curve giving 3D overlapping depth */}
      <path
        d="M 22 15 C 38 15 54 20 66 30 C 50 32 34 38 22 50 Z"
        fill={`url(#negRibbonOverlay-${mode})`}
        opacity="0.6"
      />

      {/* NEGATIVE SPACE CUTOUT: Sculpted Speech Bubble + Chat Tail inside the "D" Loop */}
      <path
        d="M 32 32 L 56 32 C 64 32 70 38 70 46 C 70 54 64 60 56 60 L 44 60 L 36 68 L 38 60 L 32 60 C 28 60 26 57 26 53 L 26 38 C 26 34 28 32 32 32 Z"
        fill={cutoutColor}
      />

      {/* Small Chat Dots in Negative Space */}
      <circle cx="43" cy="46" r="3.5" fill={`url(#negRibbonGrad-${mode})`} />
      <circle cx="53" cy="46" r="3.5" fill={`url(#negRibbonGrad-${mode})`} />
    </svg>
  );

  const textContent = !isIconOnly && (
    <div className={`flex items-center tracking-tight font-black font-display ${dim.textSize}`}>
      <span className="bg-gradient-to-r from-[#ff2a6d] via-[#ff4b7d] to-[#ff6699] bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(255,42,109,0.3)]">
        DIS
      </span>
      <span className={mode === "dark" ? "text-white" : "text-slate-900"}>
        cutons-En
      </span>
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
