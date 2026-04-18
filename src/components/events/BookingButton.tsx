'use client';

import { useRouter } from 'next/navigation';
import { Button } from 'rizzui';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/auth-context';
import { routes } from '@/config/routes';

type BookingButtonProps = {
  eventSlug: string;
  eventTitle: string;
  className?: string;
};

export default function BookingButton({
  eventSlug,
  eventTitle,
  className,
}: BookingButtonProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push(
        `${routes.signIn}?callbackUrl=${encodeURIComponent(`/events/${eventSlug}`)}`
      );
      return;
    }

    toast.success(`Reserved your seat for ${eventTitle}.`);
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? 'Loading...' : isAuthenticated ? 'Reserve a seat' : 'Sign in to reserve'}
    </Button>
  );
}
