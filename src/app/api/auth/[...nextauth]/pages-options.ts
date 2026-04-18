import { routes } from '@/config/routes';
import type { PagesOptions } from 'next-auth';

export const pagesOptions: Partial<PagesOptions> = {
  signIn: routes.signIn,
  error: routes.signIn,
};
