'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

type AnimatedCountUpProps = {
  end: number;
  start?: number;
  duration?: number;
  separator?: string;
  suffix?: string;
  enableScrollSpy?: boolean;
  scrollSpyOnce?: boolean;
  className?: string;
};

function formatValue(value: number, separator: string) {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? '-' : '';
  const absoluteValue = Math.abs(rounded).toString();
  const grouped = absoluteValue.replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  return `${sign}${grouped}`;
}

export default function AnimatedCountUp({
  end,
  start = 0,
  duration = 2,
  separator = ',',
  suffix = '',
  enableScrollSpy = false,
  scrollSpyOnce = false,
  className,
}: AnimatedCountUpProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(spanRef, { amount: 0.2 });
  const prefersReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(start);
  const [animationSeed, setAnimationSeed] = useState(enableScrollSpy ? 0 : 1);
  const hasPlayedOnceRef = useRef(false);

  useEffect(() => {
    if (!enableScrollSpy || !isInView) {
      return;
    }

    if (scrollSpyOnce && hasPlayedOnceRef.current) {
      return;
    }

    hasPlayedOnceRef.current = true;
    setAnimationSeed((seed) => seed + 1);
  }, [enableScrollSpy, isInView, scrollSpyOnce]);

  useEffect(() => {
    if (animationSeed === 0) {
      return;
    }

    setDisplayValue(start);

    if (prefersReducedMotion || duration <= 0 || start === end) {
      setDisplayValue(end);
      return;
    }

    const totalDuration = Math.max(duration, 0) * 1000;
    let frameId = 0;
    let startedAt: number | null = null;

    const animate = (timestamp: number) => {
      if (startedAt === null) {
        startedAt = timestamp;
      }

      const elapsed = timestamp - startedAt;
      const progress = Math.min(elapsed / totalDuration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextValue = start + (end - start) * easedProgress;

      setDisplayValue(nextValue);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
        return;
      }

      setDisplayValue(end);
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [animationSeed, duration, end, prefersReducedMotion, start]);

  return (
    <span
      ref={spanRef}
      className={className}
      aria-label={`${formatValue(end, separator)}${suffix}`}
    >
      {formatValue(displayValue, separator)}
      {suffix}
    </span>
  );
}
