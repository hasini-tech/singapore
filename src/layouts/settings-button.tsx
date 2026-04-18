'use client';

import { useEffect } from 'react';
// import { useTheme } from "next-themes";
import { useDrawer } from '@/app/shared/drawer-views/use-drawer';
import CogSolidIcon from '@/components/icons/cog-solid';
import { usePresets } from '@/config/color-presets';
import { useDirection } from '@/hooks/use-direction';
import DrawerHeader from '@/layouts/drawer-header';
import {
  useApplyColorPreset,
  useColorPresets,
} from '@/layouts/settings/use-theme-color';
import cn from '@/utils/class-names';
import dynamic from 'next/dynamic';
import { ActionIcon } from 'rizzui';
const SettingsDrawer = dynamic(() => import('@/layouts/settings-drawer'), {
  ssr: false,
});

export default function SettingsButton({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const COLOR_PRESETS = usePresets();
  const { openDrawer, closeDrawer } = useDrawer();
  const { direction } = useDirection();
  const { colorPresets } = useColorPresets();
  // const { theme } = useTheme();

  useApplyColorPreset<any>(colorPresets ?? COLOR_PRESETS[0].colors);

  // to set html dir attribute on direction change
  useEffect(() => {
    document.documentElement.dir = direction ?? 'ltr';
  }, [direction]);

  return (
    <ActionIcon
      aria-label="Settings"
      variant="text"
      className={cn(
        'relative h-8 w-8 md:h-9 md:w-9',
        className
      )}
      onClick={() =>
        openDrawer({
          view: (
            <>
              <DrawerHeader onClose={closeDrawer} />
              <SettingsDrawer />
            </>
          ),
          placement: 'right',
          containerClassName: 'max-w-[420px]',
        })
      }
    >
      {children ? (
        children
      ) : (
        <CogSolidIcon
          strokeWidth={1.8}
          className="h-6 w-auto animate-spin-slow"
        />
      )}
    </ActionIcon>
  );
}
