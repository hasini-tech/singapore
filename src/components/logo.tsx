'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import cn from '@/utils/class-names';

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  iconOnly?: boolean;
  forceDark?: boolean;
}

export default function Logo({
  iconOnly = false,
  forceDark = false,
  className,
  ...props
}: LogoProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with same dimensions to avoid layout shift
    return (
      <div
        className={className}
        style={{
          height: iconOnly ? '26px' : '28px',
          width: 'auto',
          ...props.style,
        }}
      />
    );
  }

  // Determine the actual theme being used
  // const currentTheme = theme === 'system' ? systemTheme : theme;
  // const logoSrc =
  //   forceDark || currentTheme === 'dark'
  //     ? '/logo/desktop-dark.png'
  //     : '/logo/desktop-logo.png';

  return (
    <p
      className={cn(
        'text-3xl font-bold bg-clip-text text-transparent transition-opacity duration-200 whitespace-nowrap overflow-visible leading-normal',
        forceDark
          ? 'bg-gradient-to-r from-white to-white/80'
          : 'bg-gradient-to-r from-[#0F7377] to-[#1E293B]',
        className
      )}
    >
      GrowthLab
    </p>
  );
  // return (
  //   <img
  //     src={logoSrc}
  //     alt="Logo"
  //     className={className}
  //     style={{
  //       height: iconOnly ? '26px' : '28px',
  //       width: 'auto',
  //       ...props.style,
  //     }}
  //     {...props}
  //   />
  // );
}
