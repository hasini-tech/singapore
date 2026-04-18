import LandingPageLayout from '@/components/home';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject(),
};

export default function LandingPage() {
  return <LandingPageLayout />;
}
