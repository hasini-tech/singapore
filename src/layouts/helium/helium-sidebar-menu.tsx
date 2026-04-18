'use client';

import { useAuth } from '@/context/auth-context';
import { menuItems } from '@/layouts/helium/helium-menu-items';
import cn from '@/utils/class-names';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function HeliumSidebarMenu() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const filteredMenuItems = isAuthenticated
    ? menuItems
    : menuItems.filter(item => ['Home', 'About Growthlab', 'What Happens', 'FAQ'].includes(item.name));

  return (
    <div className="mt-4 pb-3 3xl:mt-6">
      {filteredMenuItems.map((item, index) => {
        const isActive = pathname === (item?.href as string);

        if (!item?.href) {
          return (
            <div
              key={item.name + '-' + index}
              className="mx-3 mb-2 mt-4 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/50 2xl:mx-5 2xl:mt-7"
            >
              {item.name}
            </div>
          );
        }

        return (
          <Link
            key={item.name + '-' + index}
            href={item?.href}
            className={cn(
              'group relative mx-3 my-0.5 flex items-center justify-between rounded-md px-3 py-2 font-medium capitalize lg:my-1 2xl:mx-5 2xl:my-2',
              isActive
                ? 'before:top-2/5 text-white before:absolute before:-start-3 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-white 2xl:before:-start-5'
                : 'text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white'
            )}
          >
            <div className="flex items-center truncate">
              {item?.icon && (
                <span
                  className={cn(
                    'me-2 inline-flex h-5 w-5 items-center justify-center rounded-md transition-colors duration-200 [&>svg]:h-[20px] [&>svg]:w-[20px]',
                    isActive
                      ? 'text-white'
                      : 'text-white/70 group-hover:text-white'
                  )}
                >
                  {item?.icon}
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
