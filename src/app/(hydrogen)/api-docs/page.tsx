import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import ApiDocsPage from '@/app/shared/api-docs';

export const metadata = {
  ...metaObject('API Documentation'),
};

const pageHeader = {
  title: 'API Documentation',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'API Documentation',
    },
  ],
};

export default function ApiDocumentationPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <ApiDocsPage />
    </>
  );
}
