"use client";

import React, { useEffect, useRef } from "react";
import styles from "./ChartTypeDropdown.module.css";

export type ChartType =
  | "candlestick"
  | "bars"
  | "line"
  | "line-breaks"
  | "baseline";

interface ChartTypeDropdownProps {
  activeType: ChartType;
  onSelect: (type: ChartType) => void;
  onClose: () => void;
}

const CHART_TYPES: { id: ChartType; label: string }[] = [
  { id: "candlestick", label: "Candlestick" },
  { id: "bars", label: "Bars" },
  { id: "line", label: "Line" },
  { id: "line-breaks", label: "Line with Breaks" },
  { id: "baseline", label: "Baseline" },
];

function ChartTypeIcon({
  type,
  size = 18,
}: {
  type: ChartType;
  size?: number;
}) {
  const color = "currentColor";
  switch (type) {
    case "candlestick":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 4v4" />
          <rect
            x="7"
            y="8"
            width="4"
            height="8"
            rx="0.5"
            fill={color}
            stroke={color}
          />
          <path d="M9 16v4" />
          <path d="M17 2v5" />
          <rect x="15" y="7" width="4" height="9" rx="0.5" fill="none" />
          <path d="M17 16v6" />
        </svg>
      );
    case "bars":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M8 4v16" />
          <path d="M5 8h3" />
          <path d="M8 14h3" />
          <path d="M16 2v20" />
          <path d="M13 6h3" />
          <path d="M16 16h3" />
        </svg>
      );
    case "line":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3,17 8,11 13,14 21,6" />
        </svg>
      );
    case "line-breaks":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="4 2"
        >
          <polyline points="3,17 8,11 13,14 21,6" />
        </svg>
      );
    case "baseline":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line
            x1="2"
            y1="14"
            x2="22"
            y2="14"
            stroke={color}
            strokeOpacity="0.3"
            strokeDasharray="3 2"
          />
          <polyline
            points="3,17 7,10 11,12 15,7 19,11 22,8"
            stroke={color}
            fill="none"
          />
          <path
            d="M3,17 L7,10 L11,12 L15,7 L19,11 L22,8 L22,14 L3,14 Z"
            fill={color}
            fillOpacity="0.15"
            stroke="none"
          />
        </svg>
      );
  }
}

export default function ChartTypeDropdown({
  activeType,
  onSelect,
  onClose,
}: ChartTypeDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      {CHART_TYPES.map((ct) => (
        <button
          key={ct.id}
          className={`${styles.option} ${activeType === ct.id ? styles.active : ""}`}
          onClick={() => {
            onSelect(ct.id);
            onClose();
          }}
        >
          <ChartTypeIcon type={ct.id} />
          <span className={styles.label}>{ct.label}</span>
        </button>
      ))}
    </div>
  );
}

export { ChartTypeIcon };
