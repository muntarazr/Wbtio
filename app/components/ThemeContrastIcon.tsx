import React from "react";

interface ThemeContrastIconProps {
  className?: string;
  size?: number;
}

export default function ThemeContrastIcon({
  className = "w-4 h-4",
  size = 18,
}: ThemeContrastIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer circle */}
      <circle
        cx="12"
        cy="12"
        r="9.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Center vertical dividing line */}
      <line
        x1="12"
        y1="2.5"
        x2="12"
        y2="21.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* 4 diagonal parallel stripes on the right side */}
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <line x1="12" y1="4.5" x2="16.5" y2="9" />
        <line x1="12" y1="8.5" x2="20" y2="16.5" />
        <line x1="12" y1="13" x2="19" y2="20" />
        <line x1="12" y1="17.5" x2="15.5" y2="21" />
      </g>
    </svg>
  );
}
