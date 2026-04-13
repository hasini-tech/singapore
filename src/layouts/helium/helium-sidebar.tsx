'use client';

import Logo from '@/components/logo';
import cn from '@/utils/class-names';
import Link from 'next/link';
import { HeliumSidebarMenu } from './helium-sidebar-menu';

export default function HeliumSidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        'fixed bottom-0 start-0 z-50 h-full w-[284px] xl:p-5 2xl:w-[308px]',
        className
      )}
    >
      <div className="h-full bg-primary p-1.5 pl-0 pr-1.5 xl:rounded-2xl">
        <div className="sticky top-0 z-40 flex justify-center px-6 pb-5 pt-5 2xl:px-8 2xl:pt-6">
          <Link href={'/'} aria-label="Site Logo">
            <Logo iconOnly forceDark />
          </Link>
        </div>

        <div className="custom-scrollbar h-[calc(100%-80px)] overflow-y-auto scroll-smooth">
          <HeliumSidebarMenu />
        </div>
      </div>
    </aside>
  );
}
