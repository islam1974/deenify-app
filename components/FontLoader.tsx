import {
    Amiri_400Regular,
    Amiri_400Regular_Italic,
    Amiri_700Bold,
    Amiri_700Bold_Italic
} from '@expo-google-fonts/amiri';
import {
    CormorantGaramond_300Light,
    CormorantGaramond_300Light_Italic,
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_500Medium,
    CormorantGaramond_500Medium_Italic,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_600SemiBold_Italic,
    CormorantGaramond_700Bold,
    CormorantGaramond_700Bold_Italic,
} from '@expo-google-fonts/cormorant-garamond';
import {
    NotoNaskhArabic_400Regular,
    NotoNaskhArabic_700Bold
} from '@expo-google-fonts/noto-naskh-arabic';
import {
    NotoSansArabic_100Thin,
    NotoSansArabic_200ExtraLight,
    NotoSansArabic_300Light,
    NotoSansArabic_400Regular,
    NotoSansArabic_500Medium,
    NotoSansArabic_600SemiBold,
    NotoSansArabic_700Bold,
    NotoSansArabic_800ExtraBold,
    NotoSansArabic_900Black
} from '@expo-google-fonts/noto-sans-arabic';
import {
    ScheherazadeNew_400Regular,
    ScheherazadeNew_700Bold
} from '@expo-google-fonts/scheherazade-new';
import { useFonts } from 'expo-font';
// Removed expo-splash-screen to disable native splash handling
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface FontLoaderProps {
  children: React.ReactNode;
}

export default function FontLoader({ children }: FontLoaderProps) {
  const [fontsLoaded] = useFonts({
    // Noto Naskh Arabic (Primary Quran font)
    'NotoNaskhArabic-Regular': NotoNaskhArabic_400Regular,
    'NotoNaskhArabic-Bold': NotoNaskhArabic_700Bold,
    
    // Amiri (Classic Arabic font)
    'Amiri-Regular': Amiri_400Regular,
    'Amiri-Bold': Amiri_700Bold,
    'Amiri-Italic': Amiri_400Regular_Italic,
    'Amiri-BoldItalic': Amiri_700Bold_Italic,
    
    // Scheherazade New (Great Unicode coverage)
    'ScheherazadeNew-Regular': ScheherazadeNew_400Regular,
    'ScheherazadeNew-Bold': ScheherazadeNew_700Bold,
    
    // Noto Sans Arabic (Modern sans-serif)
    'NotoSansArabic-Thin': NotoSansArabic_100Thin,
    'NotoSansArabic-ExtraLight': NotoSansArabic_200ExtraLight,
    'NotoSansArabic-Light': NotoSansArabic_300Light,
    'NotoSansArabic-Regular': NotoSansArabic_400Regular,
    'NotoSansArabic-Medium': NotoSansArabic_500Medium,
    'NotoSansArabic-SemiBold': NotoSansArabic_600SemiBold,
    'NotoSansArabic-Bold': NotoSansArabic_700Bold,
    'NotoSansArabic-ExtraBold': NotoSansArabic_800ExtraBold,
    'NotoSansArabic-Black': NotoSansArabic_900Black,
    
    // Cormorant Garamond (Elegant serif font)
    'CormorantGaramond-Light': CormorantGaramond_300Light,
    'CormorantGaramond-LightItalic': CormorantGaramond_300Light_Italic,
    'CormorantGaramond-Regular': CormorantGaramond_400Regular,
    'CormorantGaramond-Italic': CormorantGaramond_400Regular_Italic,
    'CormorantGaramond-Medium': CormorantGaramond_500Medium,
    'CormorantGaramond-MediumItalic': CormorantGaramond_500Medium_Italic,
    'CormorantGaramond-SemiBold': CormorantGaramond_600SemiBold,
    'CormorantGaramond-SemiBoldItalic': CormorantGaramond_600SemiBold_Italic,
    'CormorantGaramond-Bold': CormorantGaramond_700Bold,
    'CormorantGaramond-BoldItalic': CormorantGaramond_700Bold_Italic,
  });

  useEffect(() => {
    // No splash screen to hide; render fallback until fonts load
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ color: '#fff', marginTop: 16, fontSize: 16 }}>
          Loading Arabic fonts...
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}
