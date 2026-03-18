import { routes } from '@/config/routes';
import { PiKey, PiBookOpenText } from 'react-icons/pi';

// Note: do not add href in the label object, it is rendering as label
export const berylliumSidebarMenuItems = [
  {
    name: 'API Keys',
    href: '/',
    icon: <PiKey />,
  },
  {
    name: 'API Docs',
    href: '/',
    icon: <PiBookOpenText />,
  },
];
