import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // 'fade_from_bottom' = fade in while moving up. Other options: 'fade' | 'slide_from_right' | 'slide_from_bottom' | 'default'
        animation: 'fade_from_bottom',
        animationDuration: 650,
        gestureEnabled: true,
      }}
    />
  );
}
