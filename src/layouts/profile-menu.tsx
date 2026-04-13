import { useAuth } from '@/context/auth-context';
import cn from '@/utils/class-names';
import { getApiMediaUrl } from '@/utils/get-api-media-url';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PiCaretDownBold, PiCheckCircleFill, PiSignOut, PiUser } from 'react-icons/pi';
import { Avatar, Button, Popover, Text, Title } from 'rizzui';

export default function ProfileMenu({
  buttonClassName,
  avatarClassName,
}: {
  buttonClassName?: string;
  avatarClassName?: string;
}) {
  const { user, isAuthenticated } = useAuth();

  const displayName = user?.name && user.name !== 'User'
    ? user.name
    : user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email || 'User';

  const avatarSrc = user?.avatarURL
    ? getApiMediaUrl(user.avatarURL)
    : user?.image || '/avatar.webp';

  return (
    <ProfileMenuPopover>
      <Popover.Trigger>
        <button
          className={cn(
            'flex items-center gap-3 rounded-full outline-none focus-visible:ring-[1.5px] focus-visible:ring-gray-400 focus-visible:ring-offset-2 active:translate-y-px',
            buttonClassName
          )}
        >
          <Avatar
            src={avatarSrc}
            name={displayName}
            className={cn('!h-9 !w-9 sm:!h-10 sm:!w-10', avatarClassName)}
          />
          <div className="hidden text-left sm:block">
            <h6 className="text-sm font-bold leading-none text-foreground lg:text-base">
              {isAuthenticated ? displayName : 'Guest'}
            </h6>
            <p className="mt-1 text-xs text-gray-400">
              {isAuthenticated ? 'Personal Account' : 'Sign in'}
            </p>
          </div>
          <PiCaretDownBold className="hidden h-3 w-3 text-gray-400 sm:block" />
        </button>
      </Popover.Trigger>

      <Popover.Content className="z-[9999] border-none p-0 shadow-xl [&>svg]:fill-white dark:[&>svg]:fill-gray-100">
        <DropdownMenu />
      </Popover.Content>
    </ProfileMenuPopover>
  );
}

function ProfileMenuPopover({ children }: React.PropsWithChildren<{}>) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      shadow="sm"
      placement="bottom-end"
    >
      {children}
    </Popover>
  );
}

function DropdownMenu() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const displayName = user?.name && user.name !== 'User'
    ? user.name
    : user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email || 'User';

  const avatarSrc = user?.avatarURL
    ? getApiMediaUrl(user.avatarURL)
    : user?.image || '/avatar.webp';

  return (
    <div className="w-80 rounded-xl bg-white text-left dark:bg-gray-50 border border-gray-100 dark:border-gray-200">
      <div className="px-5 pb-3 pt-5">
        <Title as="h3" className="text-lg font-bold text-gray-900 dark:text-white">
          Switch Account
        </Title>
        <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Post and interact as yourself or a page
        </Text>
      </div>

      {isAuthenticated ? (
        <div className="mt-2 border-y border-gray-100 bg-gray-50/50 px-5 py-4 dark:bg-gray-100 dark:border-gray-200 cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar src={avatarSrc} name={displayName} />
              <div>
                <div className="flex items-center gap-1.5">
                  <h6 className="text-sm font-bold text-gray-900 dark:text-white">
                    {displayName}
                  </h6>
                  <PiUser className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Personal Account</p>
              </div>
            </div>
            <PiCheckCircleFill className="h-5 w-5 text-primary" />
          </div>
        </div>
      ) : (
        <div className="mt-2 border-y border-gray-100 bg-gray-50/50 px-5 py-6 text-center dark:bg-gray-100 dark:border-gray-200">
          <Text className="text-xs text-gray-500 dark:text-gray-400">No account found to switch.</Text>
        </div>
      )}

      <div className="px-5 py-5">
        <Text className="text-xs leading-5 text-gray-500 dark:text-gray-400">
          No pages available. Create a page or become an admin of a verified page to
          post as a business.
        </Text>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-200 px-5 pb-5 pt-3">
        <div className="space-y-1">
          {isAuthenticated ? (
            <>
              <Button
                onClick={() => router.push('/profile')}
                variant="text"
                className="h-auto w-full justify-start gap-3 p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-700 dark:hover:bg-gray-200/50 transition-colors"
              >
                <PiUser className="h-5 w-5 text-gray-500 dark:text-gray-500" />
                View Profile
              </Button>
              <Button
                variant="text"
                className="h-auto w-full justify-start gap-3 p-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                onClick={() => logout()}
              >
                <PiSignOut className="h-5 w-5" />
                Logout
              </Button>
            </>
          ) : (
            <Button
              onClick={() => router.push('/signin')}
              variant="text"
              className="h-auto w-full justify-start gap-3 p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-700 dark:hover:bg-gray-200/50 transition-colors"
            >
              <PiSignOut className="h-5 w-5 rotate-180 text-gray-500 dark:text-gray-500" />
              Login
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
