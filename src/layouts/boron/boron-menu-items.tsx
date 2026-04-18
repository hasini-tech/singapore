import { routes } from '@/config/routes';
import { PiKeyDuotone, PiBookOpenTextDuotone } from 'react-icons/pi';

// Note: do not add href in the label object, it is rendering as label
export const menuItems = [
  {
    name: 'API Keys',
    href: '/',
    icon: <PiKeyDuotone />,
  },
  {
    name: 'API Docs',
    href: '/',
    icon: <PiBookOpenTextDuotone />,
  },
];
