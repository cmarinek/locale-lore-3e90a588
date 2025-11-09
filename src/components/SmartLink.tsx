/**
 * SmartLink - Link component with integrated prefetching
 */

import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useRoutePrefetch } from '@/hooks/useSmartPrefetch';
import { networkAdapter } from '@/utils/networkAdapter';

interface SmartLinkProps extends LinkProps {
  prefetch?: boolean;
  prefetchDelay?: number;
}

export const SmartLink: React.FC<SmartLinkProps> = ({
  to,
  prefetch = true,
  prefetchDelay = 300,
  onMouseEnter,
  onFocus,
  ...props
}) => {
  const routePath = typeof to === 'string' ? to : to.pathname || '';
  const shouldPrefetch = prefetch && networkAdapter.shouldPrefetch();
  
  const { onMouseEnter: prefetchOnHover, onFocus: prefetchOnFocus } = useRoutePrefetch(
    routePath,
    shouldPrefetch
  );

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (shouldPrefetch) {
      prefetchOnHover();
    }
    onMouseEnter?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLAnchorElement>) => {
    if (shouldPrefetch) {
      prefetchOnFocus();
    }
    onFocus?.(e);
  };

  return (
    <Link
      to={to}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      {...props}
    />
  );
};
