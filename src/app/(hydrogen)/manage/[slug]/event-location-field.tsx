"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Loader2, MapPin, Monitor } from "lucide-react";

const RECENT_LOCATION_STORAGE_KEY = "growthlab.manage.recent-locations";
const MAX_RECENT_LOCATIONS = 4;

type EventLocationFieldProps = {
  value: string;
  isOnline: boolean;
  onChange: (value: string) => void;
  inputStyle?: React.CSSProperties;
};

function looksLikeUrl(value: string) {
  return /^(https?:\/\/|www\.)/i.test(value.trim());
}

function normalizeRecentLocations(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, MAX_RECENT_LOCATIONS);
}

function readRecentLocations() {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  try {
    const raw = window.localStorage.getItem(RECENT_LOCATION_STORAGE_KEY);
    if (!raw) return [];
    return normalizeRecentLocations(JSON.parse(raw));
  } catch {
    return [] as string[];
  }
}

function writeRecentLocations(locations: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      RECENT_LOCATION_STORAGE_KEY,
      JSON.stringify(locations.slice(0, MAX_RECENT_LOCATIONS))
    );
  } catch {
    // Keep the input working even if local storage is unavailable.
  }
}

function saveRecentLocation(
  value: string,
  setRecentLocations: React.Dispatch<React.SetStateAction<string[]>>
) {
  const trimmed = value.trim();
  if (!trimmed || looksLikeUrl(trimmed)) {
    return;
  }

  setRecentLocations((previous) => {
    const next = [
      trimmed,
      ...previous.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()),
    ].slice(0, MAX_RECENT_LOCATIONS);

    writeRecentLocations(next);
    return next;
  });
}

function getLocationTitle(location: string) {
  const [title] = location.split(",");
  return title?.trim() || location;
}

function getLocationMeta(location: string) {
  const parts = location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length > 1 ? parts.slice(1).join(", ") : "";
}

export default function EventLocationField({
  value,
  isOnline,
  onChange,
  inputStyle,
}: EventLocationFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const onChangeRef = useRef(onChange);
  const placeListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [recentLocations, setRecentLocations] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [placesEnabled, setPlacesEnabled] = useState(
    Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY)
  );

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setRecentLocations(readRecentLocations());
  }, []);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || "";
    if (!apiKey || !inputRef.current) {
      setPlacesEnabled(false);
      return;
    }

    let cancelled = false;
    setIsLoadingPlaces(true);

    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places"],
    });

    loader
      .load()
      .then(() => {
        if (cancelled || !inputRef.current) {
          return;
        }

        // Leave the autocomplete unrestricted so venues can be searched worldwide.
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ["formatted_address", "name"],
        });

        placeListenerRef.current?.remove();
        placeListenerRef.current = autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          const nextValue =
            place.formatted_address || place.name || inputRef.current?.value || "";

          if (!nextValue) {
            return;
          }

          onChangeRef.current(nextValue);
          saveRecentLocation(nextValue, setRecentLocations);
        });

        setPlacesEnabled(true);
        setIsLoadingPlaces(false);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setPlacesEnabled(false);
        setIsLoadingPlaces(false);
      });

    return () => {
      cancelled = true;
      placeListenerRef.current?.remove();
      placeListenerRef.current = null;

      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const helperText = isOnline
    ? "Paste any Zoom, Google Meet, Teams, or livestream link."
    : placesEnabled
      ? "Search Google Maps for any venue worldwide, or paste the full address."
      : "Paste the venue address manually. Google map suggestions appear when the API key is available.";

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "grid", gap: 4 }}>
        <div style={fieldLabel}>
          <MapPin size={16} />
          Add Event Location
        </div>
        <div style={fieldHelp}>{helperText}</div>
      </div>

      <div style={{ position: "relative" }}>
        <input
          ref={inputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => {
            if (blurTimeoutRef.current) {
              clearTimeout(blurTimeoutRef.current);
            }
            setIsFocused(true);
          }}
          onBlur={() => {
            if (!isOnline) {
              saveRecentLocation(value, setRecentLocations);
            }

            blurTimeoutRef.current = setTimeout(() => {
              setIsFocused(false);
            }, 120);
          }}
          required
          style={{ ...locationInputStyle, ...inputStyle }}
          placeholder={
            isOnline
              ? "Paste your meeting or livestream link"
              : "Search any city, venue, or street address worldwide"
          }
        />

        {!isOnline && isLoadingPlaces ? (
          <div style={statusBadge}>
            <Loader2 className="animate-spin" size={14} />
            Loading map suggestions
          </div>
        ) : null}
      </div>

      {isFocused && !isOnline && recentLocations.length > 0 ? (
        <div style={panelStyle}>
          <div style={panelHeading}>Recent Locations</div>
          <div style={{ display: "grid", gap: 8 }}>
            {recentLocations.map((location) => {
              const meta = getLocationMeta(location);

              return (
                <button
                  key={location}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(location);
                    saveRecentLocation(location, setRecentLocations);
                    setIsFocused(false);
                  }}
                  style={recentLocationButton}
                >
                  <span style={recentLocationIcon}>
                    <MapPin size={14} />
                  </span>
                  <span style={recentLocationTextWrap}>
                    <span style={recentLocationTitle}>{getLocationTitle(location)}</span>
                    {meta ? <span style={recentLocationMeta}>{meta}</span> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {isFocused && isOnline ? (
        <div style={panelStyle}>
          <div style={panelHeading}>Virtual Link</div>
          <div style={virtualLinkRow}>
            <span style={recentLocationIcon}>
              <Monitor size={14} />
            </span>
            <span style={recentLocationTextWrap}>
              <span style={recentLocationTitle}>Paste the meeting URL guests should join</span>
              <span style={recentLocationMeta}>
                Supports Zoom, Google Meet, Microsoft Teams, YouTube Live, and similar platforms.
              </span>
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const fieldLabel: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  color: "var(--manage-fg)",
  fontWeight: 800,
  fontSize: "0.96rem",
};

const fieldHelp: React.CSSProperties = {
  color: "var(--manage-muted)",
  fontSize: "0.9rem",
  lineHeight: 1.5,
};

const locationInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid var(--manage-card-border)",
  background: "var(--manage-input)",
  color: "var(--manage-fg)",
  fontSize: "0.96rem",
  boxSizing: "border-box",
};

const statusBadge: React.CSSProperties = {
  position: "absolute",
  right: 12,
  top: "50%",
  transform: "translateY(-50%)",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 9px",
  borderRadius: 999,
  background: "var(--manage-card)",
  border: "1px solid var(--manage-card-border)",
  color: "var(--manage-muted)",
  fontSize: "0.76rem",
  fontWeight: 700,
  pointerEvents: "none",
};

const panelStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
  padding: "14px",
  borderRadius: 16,
  border: "1px solid var(--manage-card-border)",
  background: "var(--manage-hover)",
};

const panelHeading: React.CSSProperties = {
  color: "var(--manage-muted)",
  fontSize: "0.8rem",
  fontWeight: 800,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const recentLocationButton: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  width: "100%",
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid var(--manage-card-border)",
  background: "var(--manage-card)",
  color: "var(--manage-fg)",
  cursor: "pointer",
  textAlign: "left",
};

const recentLocationIcon: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--manage-hover)",
  color: "var(--manage-muted)",
  flexShrink: 0,
};

const recentLocationTextWrap: React.CSSProperties = {
  display: "grid",
  gap: 2,
  minWidth: 0,
  flex: 1,
};

const recentLocationTitle: React.CSSProperties = {
  color: "var(--manage-fg)",
  fontSize: "0.92rem",
  fontWeight: 700,
  lineHeight: 1.35,
};

const recentLocationMeta: React.CSSProperties = {
  color: "var(--manage-muted)",
  fontSize: "0.84rem",
  lineHeight: 1.4,
};

const virtualLinkRow: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid var(--manage-card-border)",
  background: "var(--manage-card)",
};
