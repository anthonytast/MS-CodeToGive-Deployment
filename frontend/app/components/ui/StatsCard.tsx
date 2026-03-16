"use client";

interface StatsCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  colorClass: string; // e.g. "lt-stat-card__icon--yellow"
  hint?: string;
}

export default function StatsCard({ icon, value, label, colorClass, hint }: StatsCardProps) {
  return (
    <div className="lt-stat-card">
      <div className={`lt-stat-card__icon ${colorClass}`}>{icon}</div>
      <div>
        <div className="lt-stat-card__value">{value.toLocaleString()}</div>
        <div className="lt-stat-card__label">{label}</div>
        {hint && (
          <div style={{ fontSize: 11, color: "var(--lt-text-secondary)", marginTop: 2, fontStyle: "italic" }}>
            {hint}
          </div>
        )}
      </div>
    </div>
  );
}
