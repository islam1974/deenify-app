import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import AnimatedSplashScreen from './AnimatedSplashScreen';

interface SplashScreenManagerProps {
  children: React.ReactNode;
}

export default function SplashScreenManager({ children }: SplashScreenManagerProps) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const prepare = async () => {
      try {
        // Hide the native Expo splash screen as quickly as possible
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('Error with splash screen:', e);
      }
    };

    void prepare();
  }, []);

  const handleAnimationFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <AnimatedSplashScreen onAnimationFinish={handleAnimationFinish} />;
  }

  return <>{children}</>;
}
