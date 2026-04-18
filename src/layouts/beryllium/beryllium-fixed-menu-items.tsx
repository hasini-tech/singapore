import { routes } from '@/config/routes';
import { atom } from 'jotai';
import { IconType } from 'react-icons/lib';
import { PiHouse, PiInfo, PiLayout, PiBriefcase, PiUsers, PiCalendarBlank } from 'react-icons/pi';

export interface SubMenuItemType {
  name: string;
  description?: string;
  href: string;
  badge?: string;
}

export interface ItemType {
  name: string;
  icon?: IconType;
  href?: string;
  description?: string;
  badge?: string;
  subMenuItems?: SubMenuItemType[];
}

export interface MenuItemsType {
  id: string;
  name: string;
  title: string;
  icon: IconType;
  menuItems: ItemType[];
}

export const berylliumMenuItems: MenuItemsType[] = [
  {
    id: '1',
    name: 'Home',
    title: 'Main Menu',
    icon: PiHouse,
    menuItems: [
      {
        name: 'Home',
        href: '/',
        icon: PiHouse,
      },
      {
        name: 'Feed',
        href: routes.feed,
        icon: PiLayout,
      },
      {
        name: 'Events',
        href: routes.events,
        icon: PiCalendarBlank,
      },
      {
        name: 'My Business',
        href: routes.business,
        icon: PiBriefcase,
      },
      {
        name: 'Connections',
        href: routes.connect,
        icon: PiUsers,
      },
      {
        name: 'About Growthlab'
      },
      {
        name: 'What Happens',
        href: routes.about.whatHappens,
        icon: PiInfo,
      },
      {
        name: 'FAQ',
        href: routes.about.faq,
        icon: PiInfo,
      }
    ],
  },
];

export const berylliumMenuItemAtom = atom(berylliumMenuItems[0]);
