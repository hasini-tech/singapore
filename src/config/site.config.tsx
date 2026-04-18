import { LAYOUT_OPTIONS } from '@/config/enums';
import { Metadata } from 'next';
import { OpenGraph } from 'next/dist/lib/metadata/types/opengraph-types';

enum MODE {
  DARK = 'dark',
  LIGHT = 'light',
}

export const siteConfig = {
  title: 'Growthlab - The premium startup accelerator of asia',
  description: `GrowthLab is a global startup ecosystem that empowers founders, investors, students, and innovators to connect, launch, and grow.`,
  logo: '/growthlab/GrowthLab-Icon.png',
  icon: '/logo-short.svg',
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
    title: title ? `${title} - Perfomax API Dashboard` : siteConfig.title,
    description,
    openGraph: openGraph ?? {
      title: title ? `${title} - Perfomax API Dashboard` : title,
      description,
      url: 'https://isomorphic-furyroad.vercel.app',
      siteName: 'Perfomax API Dashboard', // https://developers.google.com/search/docs/appearance/site-names
      images: {
        url: 'https://s3.amazonaws.com/redqteam.com/isomorphic-furyroad/itemdep/isobanner.png',
        width: 1200,
        height: 630,
      },
      locale: 'en_US',
      type: 'website',
    },
  };
};
