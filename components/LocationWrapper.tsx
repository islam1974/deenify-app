import React, { ReactNode } from 'react';
import { LocationProvider } from '@/contexts/LocationContext';

interface LocationWrapperProps {
  children: ReactNode;
}

export default function LocationWrapper({ children }: LocationWrapperProps) {
  return (
    <LocationProvider>
      {children}
    </LocationProvider>
  );
}
