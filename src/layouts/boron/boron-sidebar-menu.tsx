'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import cn from '@/utils/class-names';
import { menuItems } from '@/layouts/boron/boron-menu-items';
import { useColorPresetName } from '@/layouts/settings/use-theme-color';
import { useTheme } from 'next-themes';

export function BoronSidebarMenu() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { colorPresetName } = useColorPresetName();

  return (
    <div className="mt-4 pb-3 2xl:pt-1.5 3xl:mt-6">
      {menuItems.map((item, index) => {
        const isActive = pathname === (item?.href as string);

        return (
          <Link
            key={item.name + '-' + index}
            href={item?.href}
            className={cn(
              'group relative mx-3 my-0.5 flex items-center justify-between rounded-md px-3 py-2 font-medium lg:my-1 2xl:mx-5 2xl:my-2',
              isActive
                ? colorPresetName === 'black' && theme === 'dark'
                  ? 'bg-gray-900 text-gray-0'
                  : 'bg-primary text-gray-0'
                : 'text-gray-700 transition-colors duration-200 hover:bg-gray-100 dark:text-gray-700/90'
            )}
          >
            <div className="flex items-center truncate">
              {item.icon && (
                <span
                  className={cn(
                    'me-2 inline-flex h-5 w-5 items-center justify-center rounded-md [&>svg]:h-[20px] [&>svg]:w-[20px]',
                    isActive
                      ? 'text-gray-0'
                      : 'text-gray-800 dark:text-gray-500'
                  )}
                >
                  {item.icon}
                </span>
              )}
              <span className="truncate">{item.name}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
