'use client';

import type { CSSProperties, Dispatch, ReactNode, SetStateAction } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import {
  PiClockCounterClockwise,
  PiGlobe,
  PiMapPin,
  PiSpinnerGap,
  PiVideoCamera,
} from 'react-icons/pi';

const RECENT_LOCATION_STORAGE_KEY = 'growthlab.manage.recent-locations';
const MAX_RECENT_LOCATIONS = 4;

type CreateEventLocationFieldColors = {
  inputBg: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  light: string;
  accent: string;
  optionHover: string;
  chipBg: string;
  chipBorder: string;
  divider: string;
};

type CreateEventLocationFieldProps = {
  value: string;
  isOnline: boolean;
  onChange: (value: string) => void;
  onOnlineChange: (value: boolean) => void;
  colors: CreateEventLocationFieldColors;
};

type LocationSuggestion = {
  key: string;
  title: string;
  meta: string;
  value: string;
};

function normalizeRecentLocations(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, MAX_RECENT_LOCATIONS);
}

function readRecentLocations() {
  if (typeof window === 'undefined') {
    return [] as string[];
  }

  try {
    const raw = window.localStorage.getItem(RECENT_LOCATION_STORAGE_KEY);
    return raw ? normalizeRecentLocations(JSON.parse(raw)) : [];
  } catch {
    return [] as string[];
  }
}

function writeRecentLocations(locations: string[]) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      RECENT_LOCATION_STORAGE_KEY,
      JSON.stringify(locations.slice(0, MAX_RECENT_LOCATIONS))
    );
  } catch {
    // Ignore storage failures and keep the field usable.
  }
}

function saveRecentLocation(
  value: string,
  setRecentLocations: Dispatch<SetStateAction<string[]>>
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

function looksLikeUrl(value: string) {
  return /^(https?:\/\/|www\.)/i.test(value.trim());
}

function looksLikeMeetingUrl(value: string) {
  return /(?:zoom\.us|meet\.google\.com|teams\.microsoft\.com|webex\.com|whereby\.com|jitsi|youtube\.com|youtu\.be)/i.test(
    value.trim()
  );
}

function getLocationTitle(location: string) {
  const [title] = location.split(',');
  return title?.trim() || location;
}

function getLocationMeta(location: string) {
  const parts = location
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length > 1 ? parts.slice(1).join(', ') : '';
}

export default function CreateEventLocationField({
  value,
  isOnline,
  onChange,
  onOnlineChange,
  colors,
}: CreateEventLocationFieldProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || '';
  const inputRef = useRef<HTMLInputElement | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaderRef = useRef<Loader | null>(null);
  const placesLibraryRef = useRef<google.maps.PlacesLibrary | null>(null);
  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const requestIdRef = useRef(0);

  const [open, setOpen] = useState(false);
  const [placesReady, setPlacesReady] = useState(false);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictions, setPredictions] = useState<LocationSuggestion[]>([]);
  const [recentLocations, setRecentLocations] = useState<string[]>([]);

  useEffect(() => {
    setRecentLocations(readRecentLocations());
  }, []);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open || isOnline || !apiKey || placesLibraryRef.current) {
      return;
    }

    let cancelled = false;
    if (!loaderRef.current) {
      loaderRef.current = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places'],
      });
    }

    setPlacesLoading(true);

    loaderRef.current
      .load()
      .then(
        () =>
          google.maps.importLibrary('places') as Promise<google.maps.PlacesLibrary>
      )
      .then((placesLibrary) => {
        if (cancelled) {
          return;
        }

        placesLibraryRef.current = placesLibrary;
        sessionTokenRef.current = new placesLibrary.AutocompleteSessionToken();
        setPlacesReady(true);
        setPlacesLoading(false);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setPlacesReady(false);
        setPlacesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey, isOnline, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const query = value.trim();
    const placesLibrary = placesLibraryRef.current;
    const AutocompleteSuggestion = placesLibrary?.AutocompleteSuggestion;

    if (!query || !placesReady || !AutocompleteSuggestion || looksLikeUrl(query)) {
      setPredictions([]);
      setPredictionLoading(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setPredictionLoading(true);

    if (!sessionTokenRef.current && placesLibrary?.AutocompleteSessionToken) {
      sessionTokenRef.current = new placesLibrary.AutocompleteSessionToken();
    }

    AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input: query,
      sessionToken: sessionTokenRef.current || undefined,
    })
      .then(({ suggestions }) => {
        if (requestId !== requestIdRef.current) {
          return;
        }

        const nextPredictions = suggestions
          .map((suggestion, index): LocationSuggestion | null => {
            const prediction = suggestion.placePrediction;
            const value = prediction?.text?.text?.trim() || '';

            if (!prediction || !value) {
              return null;
            }

            return {
              key: prediction.placeId || `${value}-${index}`,
              title: prediction.mainText?.text || value,
              meta: prediction.secondaryText?.text || '',
              value,
            };
          })
          .filter((prediction): prediction is LocationSuggestion => Boolean(prediction))
          .slice(0, 5);

        setPredictions(nextPredictions);
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setPredictions([]);
      })
      .finally(() => {
        if (requestId === requestIdRef.current) {
          setPredictionLoading(false);
        }
      });
  }, [open, placesReady, value]);

  const hasSearchQuery = value.trim().length > 0 && !looksLikeUrl(value);
  const helperText = isOnline
    ? 'Paste a Zoom, Google Meet, Teams, or livestream link.'
    : 'Offline location or virtual link';

  return (
    <div
      style={{ display: 'grid', gap: 10, position: 'relative' }}
      onClick={(event) => event.stopPropagation()}
    >
      <div
        className="luma-input-row"
        style={{
          alignItems: 'flex-start',
          position: 'relative',
          borderColor: open ? `${colors.accent}55` : 'transparent',
          boxShadow: open ? `0 0 0 3px ${colors.accent}14` : 'none',
        }}
      >
        <PiMapPin
          size={18}
          color={open ? colors.accent : colors.muted}
          style={{ flexShrink: 0, marginTop: 2 }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <input
            ref={inputRef}
            style={{
              fontSize: 14,
              fontWeight: 600,
              width: '100%',
              display: 'block',
            }}
            placeholder="Add Event Location"
            value={value}
            onFocus={() => {
              if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
              }
              setOpen(true);
            }}
            onBlur={() => {
              if (!isOnline) {
                saveRecentLocation(value, setRecentLocations);
              }

              blurTimeoutRef.current = setTimeout(() => {
                setOpen(false);
              }, 140);
            }}
            onChange={(event) => {
              const nextValue = event.target.value;
              onChange(nextValue);

              if (looksLikeMeetingUrl(nextValue)) {
                onOnlineChange(true);
              } else if (!looksLikeUrl(nextValue)) {
                onOnlineChange(false);
              }
            }}
          />

          <div
            style={{
              fontSize: 12,
              color: isOnline ? colors.accent : colors.light,
              marginTop: 2,
              fontWeight: isOnline ? 600 : 500,
            }}
          >
            {helperText}
          </div>
        </div>

        {placesLoading && !isOnline ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              color: colors.muted,
              background: colors.surface,
              border: `1px solid ${colors.chipBorder}`,
              borderRadius: 999,
              padding: '6px 8px',
              flexShrink: 0,
            }}
          >
            <PiSpinnerGap className="animate-spin" size={14} />
            Maps
          </div>
        ) : null}
      </div>

      {open ? (
        <div
          style={{
            borderRadius: 16,
            border: `1px solid ${colors.border}`,
            background: colors.surface,
            overflow: 'hidden',
            boxShadow: '0 16px 32px rgba(15, 23, 42, 0.10)',
          }}
        >
          {!isOnline && predictions.length > 0 ? (
            <Section
              title="Search Results"
              colors={colors}
              items={predictions.map((prediction) => ({
                key: prediction.key,
                title: prediction.title,
                meta: prediction.meta,
                icon: <PiMapPin size={14} />,
                onClick: () => {
                  onChange(prediction.value);
                  onOnlineChange(false);
                  saveRecentLocation(prediction.value, setRecentLocations);
                  sessionTokenRef.current = null;
                  setOpen(false);
                },
              }))}
            />
          ) : null}

          {!isOnline && predictionLoading ? (
            <div style={infoRowStyle(colors)}>
              <PiSpinnerGap className="animate-spin" size={14} />
              Searching worldwide places...
            </div>
          ) : null}

          {!isOnline &&
          hasSearchQuery &&
          !predictionLoading &&
          predictions.length === 0 &&
          placesReady ? (
            <div style={infoRowStyle(colors)}>
              <PiGlobe size={14} />
              No exact match yet. Try a venue name, city, or full address.
            </div>
          ) : null}

          {!isOnline && recentLocations.length > 0 ? (
            <Section
              title="Recent Locations"
              colors={colors}
              items={recentLocations.map((location) => ({
                key: location,
                title: getLocationTitle(location),
                meta: getLocationMeta(location),
                icon: <PiClockCounterClockwise size={14} />,
                onClick: () => {
                  onChange(location);
                  onOnlineChange(false);
                  saveRecentLocation(location, setRecentLocations);
                  setOpen(false);
                },
              }))}
            />
          ) : null}

          <Section
            title="Virtual Options"
            colors={colors}
            items={[
              {
                key: 'zoom',
                title: 'Paste Zoom link',
                meta: 'Use any Zoom meeting or webinar URL',
                icon: <PiVideoCamera size={14} />,
                onClick: () => {
                  onOnlineChange(true);
                  setPredictions([]);
                  inputRef.current?.focus();
                },
              },
              {
                key: 'meet',
                title: 'Paste Google Meet link',
                meta: 'Use any Meet or livestream URL',
                icon: <PiGlobe size={14} />,
                onClick: () => {
                  onOnlineChange(true);
                  setPredictions([]);
                  inputRef.current?.focus();
                },
              },
            ]}
          />
        </div>
      ) : null}
    </div>
  );
}

function Section({
  title,
  items,
  colors,
}: {
  title: string;
  colors: CreateEventLocationFieldColors;
  items: Array<{
    key: string;
    title: string;
    meta?: string;
    icon: ReactNode;
    onClick: () => void;
  }>;
}) {
  return (
    <div style={{ padding: '10px 0', borderTop: `1px solid ${colors.divider}` }}>
      <div
        style={{
          padding: '0 14px 8px',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.04em',
          color: colors.light,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </div>

      <div style={{ display: 'grid', gap: 2, padding: '0 8px 6px' }}>
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={item.onClick}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              width: '100%',
              padding: '10px 10px',
              borderRadius: 12,
              border: 'none',
              background: 'transparent',
              color: colors.text,
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = colors.optionHover;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = 'transparent';
            }}
          >
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: colors.chipBg,
                border: `1px solid ${colors.chipBorder}`,
                color: colors.muted,
                flexShrink: 0,
              }}
            >
              {item.icon}
            </span>

            <span style={{ display: 'grid', gap: 2, minWidth: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
                {item.title}
              </span>
              {item.meta ? (
                <span
                  style={{
                    fontSize: 12,
                    lineHeight: 1.4,
                    color: colors.muted,
                  }}
                >
                  {item.meta}
                </span>
              ) : null}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function infoRowStyle(colors: CreateEventLocationFieldColors) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 14px',
    fontSize: 12,
    color: colors.muted,
  } satisfies CSSProperties;
}
