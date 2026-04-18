"use client";

import React from "react";

type Tab = {
  id: string;
  label: string;
};

type Props = {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
};

const SectionTabs: React.FC<Props> = ({ tabs, activeId, onChange }) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        padding: "6px 0",
      }}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              padding: "9px 12px",
              borderRadius: "999px",
              border: active ? "2px solid var(--primary-color)" : "1px solid #e5e7eb",
              background: active ? "rgba(15,115,119,0.1)" : "#fff",
              fontWeight: 700,
              color: active ? "var(--primary-strong)" : "var(--text-primary)",
              boxShadow: "0 8px 18px rgba(16,36,42,0.04)",
              cursor: "pointer",
              transition: "all 120ms ease",
              fontSize: "0.92rem",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default SectionTabs;
