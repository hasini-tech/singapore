'use client';

import React from 'react';

// SimpleBar placeholder - simplebar-react dependency removed
const SimpleBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props} style={{ overflow: 'auto', ...props.style }}>
    {children}
  </div>
));

SimpleBar.displayName = 'SimpleBar';

export default SimpleBar;
