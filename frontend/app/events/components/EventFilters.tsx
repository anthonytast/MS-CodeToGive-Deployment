"use client";

import { useRef, useState, useEffect } from "react";
import type { FilterState } from "@/app/types/event";
import styles from "../events.module.css";

interface Props {
  filters: FilterState;
  onChange: (partial: Partial<FilterState>) => void;
  onClear: () => void;
}

const DATE_OPTIONS = [
  { value: "", label: "Any Date" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

export default function EventFilters({ filters, onChange, onClear }: Props) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target as Node)) {
        setDateDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange({ q: value });
    }, 200);
  }

  const hasActiveFilters =
    filters.q || filters.dateRange || filters.tab === "registered" || filters.tab === "my-events";

  const TABS = [
    { value: "", label: "All" },
    { value: "registered", label: "Registered" },
    { value: "my-events", label: "My Events" },
  ];

  return (
    <div className={styles.filters}>
      {/* Search input */}
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search events..."
          defaultValue={filters.q}
          onChange={(e) => handleSearch(e.target.value)}
          aria-label="Search events"
        />
      </div>

      {/* Date range dropdown */}
      <div ref={dateDropdownRef} style={{ position: "relative" }}>
        <button
          type="button"
          className="lt-select"
          onClick={() => setDateDropdownOpen((o) => !o)}
          aria-label="Filter by date range"
          style={{ textAlign: "left", minWidth: 120, color: filters.dateRange ? "inherit" : "var(--lt-text-muted)" }}
        >
          {DATE_OPTIONS.find((o) => o.value === (filters.dateRange || ""))?.label ?? "Any Date"}
        </button>
        {dateDropdownOpen && (
          <div className="lt-select-dropdown" style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20, background: "#fff", border: "1.5px solid var(--lt-border)", borderRadius: "var(--lt-radius-sm)", boxShadow: "0 8px 30px rgba(0,0,0,0.10)", marginTop: 4 }}>
            {DATE_OPTIONS.map((opt) => (
              <div
                key={opt.value}
                className="lt-select-option"
                onClick={() => { onChange({ dateRange: opt.value }); setDateDropdownOpen(false); }}
                style={{ padding: "10px 14px", fontSize: 14, cursor: "pointer", background: (filters.dateRange || "") === opt.value ? "var(--lt-teal-light)" : "transparent", color: (filters.dateRange || "") === opt.value ? "var(--lt-teal)" : "var(--lt-text-primary)", fontWeight: (filters.dateRange || "") === opt.value ? 600 : "normal" }}
                onMouseEnter={(e) => { if ((filters.dateRange || "") !== opt.value) e.currentTarget.style.background = "var(--lt-card-bg-muted)"; }}
                onMouseLeave={(e) => { if ((filters.dateRange || "") !== opt.value) e.currentTarget.style.background = "transparent"; }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick-filter chips */}
      <div className={styles.chips}>
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            className={`${styles.chip} ${filters.tab === value || (!filters.tab && value === "") ? styles.chipActive : ""}`}
            onClick={() => onChange({ tab: value })}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Clear button */}
      {hasActiveFilters && (
        <button className={styles.clearBtn} onClick={onClear}>
          Clear
        </button>
      )}
    </div>
  );
}
