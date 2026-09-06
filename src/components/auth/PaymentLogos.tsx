"use client";

import React from "react";

export function OrangeMoneyLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background card - Official Orange Black */}
      <rect width="120" height="120" rx="24" fill="#000000" />

      {/* Main Orange Square */}
      <rect x="18" y="18" width="84" height="84" rx="14" fill="#FF7900" />

      {/* Inner Black Square */}
      <rect x="34" y="34" width="52" height="52" rx="8" fill="#000000" />

      {/* Signature Orange Corner Badge */}
      <rect x="58" y="58" width="28" height="28" rx="5" fill="#FF7900" />

      {/* Text Label */}
      <text
        x="60"
        y="112"
        textAnchor="middle"
        fill="#FF7900"
        fontSize="10"
        fontWeight="900"
        fontFamily="sans-serif"
        letterSpacing="0.8"
      >
        ORANGE MONEY
      </text>
    </svg>
  );
}

export function WaveLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Official Wave Cyan Background */}
      <rect width="120" height="120" rx="24" fill="#1DC3F4" />

      {/* Wave Penguin Body (Dark Navy) */}
      <path
        d="M60 18C44 18 34 32 34 54C34 74 44 90 60 90C76 90 86 74 86 54C86 32 76 18 60 18Z"
        fill="#0F172A"
      />

      {/* White Belly */}
      <path
        d="M60 38C50 38 43 48 43 62C43 74 50 84 60 84C70 84 77 74 77 62C77 48 70 38 60 38Z"
        fill="#FFFFFF"
      />

      {/* Penguin Eyes */}
      <circle cx="52" cy="32" r="3.5" fill="#FFFFFF" />
      <circle cx="68" cy="32" r="3.5" fill="#FFFFFF" />
      <circle cx="53" cy="32" r="1.8" fill="#0F172A" />
      <circle cx="69" cy="32" r="1.8" fill="#0F172A" />

      {/* Beak (Bright Orange) */}
      <path
        d="M54 40L60 49L66 40Z"
        fill="#FF9F1C"
      />

      {/* Feet (Bright Orange) */}
      <ellipse cx="48" cy="90" rx="7" ry="3.5" fill="#FF9F1C" />
      <ellipse cx="72" cy="90" rx="7" ry="3.5" fill="#FF9F1C" />

      {/* Wave Typography */}
      <text
        x="60"
        y="112"
        textAnchor="middle"
        fill="#0F172A"
        fontSize="11"
        fontWeight="900"
        fontFamily="sans-serif"
        letterSpacing="1"
      >
        wave
      </text>
    </svg>
  );
}

export function MoovMoneyLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background card - Moov Blue */}
      <rect width="120" height="120" rx="24" fill="#003D7C" />

      {/* Green Swirl */}
      <path
        d="M25 65C25 40 45 25 72 25C88 25 98 33 98 33L88 45C88 45 80 37 68 37C48 37 38 48 38 65C38 80 48 92 68 92C80 92 88 84 88 84L98 96C98 96 88 105 68 105C42 105 25 88 25 65Z"
        fill="#80C21C"
      />

      {/* Inner Dot Accent */}
      <circle cx="68" cy="65" r="14" fill="#005CA9" />
      <circle cx="68" cy="65" r="6" fill="#FFFFFF" />

      {/* Text Label */}
      <text
        x="60"
        y="112"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="10"
        fontWeight="900"
        fontFamily="sans-serif"
        letterSpacing="0.5"
      >
        MOOV MONEY
      </text>
    </svg>
  );
}
