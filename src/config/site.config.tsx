import { LAYOUT_OPTIONS } from '@/config/enums';
import logoImg from '@public/growthlab/GrowthLab-Icon.png';
import logoIconImg from '@public/logo-short.svg';
import { Metadata } from 'next';
import { OpenGraph } from 'next/dist/lib/metadata/types/opengraph-types';

enum MODE {
  DARK = 'dark',
  LIGHT = 'light',
}

export const siteConfig = {
  title: 'Growthlab - The startup ecosystem that actually launches startups',
  description: `GrowthLab is a global startup ecosystem that empowers founders, investors, students, and innovators to connect, launch, and grow.`,
  logo: logoImg,
  icon: logoIconImg,
  mode: MODE.DARK,
  layout: LAYOUT_OPTIONS.BERYLLIUM,
  // TODO: favicon
};

export const metaObject = (
  title?: string,
  openGraph?: OpenGraph,
  description: string = siteConfig.description
): Metadata => {
  return {
    title: title ? `${title} - GrowthLab` : siteConfig.title,
    description,
    openGraph: openGraph ?? {
      title: title ? `${title} - GrowthLab` : title,
      description,
      url: 'https://growthlab-web-portal.vercel.app',
      siteName: 'GrowthLab', // https://developers.google.com/search/docs/appearance/site-names
      images: {
        url: 'https://www.growthlab.sg/_next/image?url=%2Fgrowthlab-logo.png&w=64&q=75',
        width: 64,
        height: 64,
      },
      locale: 'en_US',
      type: 'website',
    },
  };
};
