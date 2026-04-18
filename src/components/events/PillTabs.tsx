"use client";

import React from "react";

type Pill = { id: string; label: string };

type Props = {
  pills: Pill[];
  activeId: string;
  onChange: (id: string) => void;
};

export default function PillTabs({ pills, activeId, onChange }: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        marginTop: "8px",
      }}
    >
      {pills.map((pill) => {
        const active = pill.id === activeId;
        return (
          <button
            key={pill.id}
            onClick={() => onChange(pill.id)}
            style={{
              padding: "9px 12px",
              borderRadius: "999px",
              border: active ? "2px solid #0f9d7a" : "1px solid #e5e7eb",
              background: active ? "rgba(15,157,122,0.1)" : "#fff",
              fontWeight: 700,
              color: active ? "#0f172a" : "#0f172a",
              boxShadow: "0 8px 18px rgba(16,36,42,0.04)",
              cursor: "pointer",
              transition: "all 120ms ease",
              fontSize: "0.92rem",
            }}
          >
            {pill.label}
          </button>
        );
      })}
    </div>
  );
}
