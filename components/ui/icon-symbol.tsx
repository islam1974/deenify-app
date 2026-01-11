// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.down': 'keyboard-arrow-down',
  'chevron.up': 'keyboard-arrow-up',
  'chevron.up.circle.fill': 'arrow-circle-up',
  'chevron.up.circle': 'arrow-circle-up',
  'chevron.down.circle': 'arrow-circle-down',
  'touchid': 'fingerprint',
  'book.fill': 'menu-book',
  'book': 'menu-book',
  'book.closed': 'menu-book',
  'clock.fill': 'schedule',
  'clock': 'schedule',
  'location.fill': 'location-on',
  'quote.bubble.fill': 'format-quote',
  'hands.sparkles.fill': 'auto-fix-high',
  'hands.sparkles': 'auto-fix-high',
  'circle.grid.3x3.fill': 'grid-on',
  'gear': 'settings',
  'exclamationmark.triangle': 'warning',
  'exclamationmark.triangle.fill': 'warning',
  'heart': 'favorite',
  'heart.fill': 'favorite',
  'heart.text.square': 'favorite',
  'book': 'menu-book',
  'arrow.clockwise': 'refresh',
  'xmark': 'close',
  'globe': 'language',
  'checkmark.circle.fill': 'check-circle',
  'info.circle.fill': 'info',
  'info.circle': 'info',
  'play.fill': 'play-arrow',
  'pause.fill': 'pause',
  'stop.fill': 'stop',
  'trash': 'delete',
  'bookmark': 'bookmark',
  'textformat': 'format-size',
  'checkmark': 'check',
  'speaker.wave.2.fill': 'volume-up',
  'arrow.up.right': 'north-east',
  'ruler': 'straighten',
  'calendar': 'calendar-today',
  'line.3.horizontal': 'menu',
  'sun.max.fill': 'wb-sunny',
  'moon.fill': 'nightlight',
  'moon.stars.fill': 'nights-stay',
  'person.fill': 'person',
  'number': 'numbers',
  'mappin.and.ellipse': 'place',
  'location.slash': 'location-off',
  'location.viewfinder': 'my-location',
  'map': 'map',
  'map.fill': 'map',
  'phone.fill': 'phone',
  'bell.fill': 'notifications',
  'paintbrush.fill': 'brush',
  'xmark.circle.fill': 'cancel',
  'lightbulb.fill': 'lightbulb',
  'star.fill': 'star',
  'leaf.fill': 'eco',
  'person.2.fill': 'group',
  'shield.fill': 'shield',
  'chevron.down.circle.fill': 'arrow-circle-down',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const mappedName = MAPPING[name] || 'help-outline';
  return <MaterialIcons color={color} size={size} name={mappedName} style={style} />;
}
