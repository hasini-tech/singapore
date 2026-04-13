import { routes } from '@/config/routes';
import { PiHouse, PiInfo, PiLayout, PiBriefcase, PiUsers, PiCalendarBlank } from 'react-icons/pi';

// Note: do not add href in the label object, it is rendering as label
export const berylliumSidebarMenuItems = [
  {
    name: 'Home',
    href: '/',
    icon: <PiHouse />,
  },
  {
    name: 'Feed',
    href: routes.feed,
    icon: <PiLayout />,
  },
  {
    name: 'Events',
    href: routes.events,
    icon: <PiCalendarBlank />,
  },
  {
    name: 'My Business',
    href: routes.business,
    icon: <PiBriefcase />,
  },
  {
    name: 'Connections',
    href: routes.connect,
    icon: <PiUsers />,
  },
  {
    name: 'About Growthlab'
  },
  {
    name: 'What Happens',
    href: routes.about.whatHappens,
    icon: <PiInfo />,
  },
  {
    name: 'FAQ',
    href: routes.about.faq,
    icon: <PiInfo />,
  }
];
