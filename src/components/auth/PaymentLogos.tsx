"use client";

import React from "react";

export function OrangeMoneyLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="22" fill="#FF7900" />
      <path
        d="M20 20H80V80H20V20Z"
        fill="#FF7900"
      />
      <circle cx="50" cy="50" r="28" fill="#000000" />
      <path
        d="M38 50C38 43.3726 43.3726 38 50 38C56.6274 38 62 43.3726 62 50C62 56.6274 56.6274 62 50 62C43.3726 62 38 56.6274 38 50Z"
        stroke="#FF7900"
        strokeWidth="6"
      />
      <text
        x="50"
        y="88"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="12"
        fontWeight="900"
        fontFamily="sans-serif"
        letterSpacing="0.5"
      >
        ORANGE
      </text>
    </svg>
  );
}

export function MoovMoneyLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="22" fill="#005B94" />
      <circle cx="50" cy="45" r="30" fill="#00A859" />
      <path
        d="M32 55L42 35L50 48L58 35L68 55"
        stroke="#FFFFFF"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="50"
        y="88"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="12"
        fontWeight="900"
        fontFamily="sans-serif"
        letterSpacing="0.5"
      >
        MOOV
      </text>
    </svg>
  );
}

export function WaveLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="22" fill="#1DC3F4" />
      <path
        d="M25 58C30 50 38 42 50 42C62 42 70 50 75 58"
        stroke="#FFFFFF"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M25 44C30 36 38 28 50 28C62 28 70 36 75 44"
        stroke="#103B5C"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx="50" cy="70" r="7" fill="#FFFFFF" />
      <text
        x="50"
        y="90"
        textAnchor="middle"
        fill="#103B5C"
        fontSize="12"
        fontWeight="900"
        fontFamily="sans-serif"
        letterSpacing="0.5"
      >
        WAVE
      </text>
    </svg>
  );
}
