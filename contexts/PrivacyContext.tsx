import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface PrivacyContextType {
  hasAcceptedPrivacy: boolean;
  acceptPrivacyPolicy: () => Promise<void>;
  showPrivacyNotice: boolean;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export const usePrivacy = () => {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
};

interface PrivacyProviderProps {
  children: ReactNode;
}

const PRIVACY_ACCEPTED_KEY = '@deenify_privacy_accepted';

export const PrivacyProvider: React.FC<PrivacyProviderProps> = ({ children }) => {
  const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPrivacyAcceptance();
  }, []);

  const checkPrivacyAcceptance = async () => {
    try {
      const accepted = await AsyncStorage.getItem(PRIVACY_ACCEPTED_KEY);
      const hasAccepted = accepted === 'true';
      setHasAcceptedPrivacy(hasAccepted);
      
      // Show privacy notice on first launch
      if (!hasAccepted) {
        // Small delay to let the app initialize
        setTimeout(() => {
          setShowPrivacyNotice(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Error checking privacy acceptance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptPrivacyPolicy = async () => {
    try {
      await AsyncStorage.setItem(PRIVACY_ACCEPTED_KEY, 'true');
      setHasAcceptedPrivacy(true);
      setShowPrivacyNotice(false);
    } catch (error) {
      console.error('Error saving privacy acceptance:', error);
    }
  };

  const value: PrivacyContextType = {
    hasAcceptedPrivacy,
    acceptPrivacyPolicy,
    showPrivacyNotice,
  };

  // Don't render children until we've checked privacy status
  if (isLoading) {
    return null;
  }

  return (
    <PrivacyContext.Provider value={value}>
      {children}
    </PrivacyContext.Provider>
  );
};

