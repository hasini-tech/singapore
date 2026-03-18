import { Suspense } from 'react';
import { metaObject } from '@/config/site.config';
import MultiStepFormTwo from '@/app/shared/multi-step/multi-step-2';

export const metadata = {
  ...metaObject('Multi Step Two'),
};

export default function MultiStepFormPageTwo() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MultiStepFormTwo />
    </Suspense>
  );
}
