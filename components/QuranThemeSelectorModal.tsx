import PaperTextureOverlay from '@/components/PaperTextureOverlay';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
    QURAN_THEMES,
    QuranThemeId,
} from '@/contexts/QuranThemeContext';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_IPAD = Platform.isPad;
const IS_PRO_MAX = SCREEN_WIDTH >= 430;
const RUB_EL_HIZB = '\u06DE';

const THEME_DESCRIPTIONS: Record<QuranThemeId, string> = {
  'night-manuscript': 'Gold ink against the quiet of night.',
  'parchment-classic': 'Ink on aged paper, timeless and scholarly.',
  'emerald-garden': 'Calm, reflective, and dignified.',
};

interface QuranThemeSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  themeId: QuranThemeId;
  onSelectTheme: (id: QuranThemeId) => void;
}

function ThemePreviewCard({
  themeId,
  isSelected,
  onSelect,
  isIpad,
}: {
  themeId: QuranThemeId;
  isSelected: boolean;
  onSelect: () => void;
  isIpad: boolean;
}) {
  const theme = QURAN_THEMES[themeId];
  const accent = theme.verseBadgeGold;

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect();
      }}
      style={({ pressed }) => [
        styles.previewCard,
        isIpad && styles.previewCardIpad,
        {
          backgroundColor: theme.card,
          borderColor: isSelected ? accent : 'rgba(200, 164, 77, 0.12)',
          borderWidth: isSelected ? 1.5 : 1,
          borderRadius: 13,
          opacity: pressed ? 0.92 : 1,
          ...(isSelected && {
            shadowColor: accent,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
          }),
        },
      ]}
    >
      {/* Miniature preview: background + ayah badge + Arabic text */}
      <View
        style={[
          styles.previewSwatch,
          isIpad && styles.previewSwatchIpad,
          {
            backgroundColor: theme.background,
            borderRadius: 8,
            position: 'relative',
            overflow: 'hidden',
          },
        ]}
      >
        {themeId === 'parchment-classic' && (
          <PaperTextureOverlay fillParent />
        )}
        <View style={[styles.previewAyahRow, isIpad && styles.previewAyahRowIpad, { zIndex: 1 }]}>
          <Text style={[styles.previewBadge, isIpad && styles.previewBadgeIpad, { color: accent }]}>{RUB_EL_HIZB}</Text>
          <Text
            style={[styles.previewArabic, isIpad && styles.previewArabicIpad, { color: theme.arabicText }]}
            numberOfLines={1}
          >
            ٱلۡحَمۡدُ لِلَّهِ
          </Text>
        </View>
      </View>

      <Text style={[styles.themeName, isIpad && styles.themeNameIpad, { color: theme.label }]}>
        {theme.name}
      </Text>
      <Text style={[styles.themeDesc, isIpad && styles.themeDescIpad, { color: theme.translationText }]}>
        {THEME_DESCRIPTIONS[themeId]}
      </Text>

      {isSelected && (
        <View style={[styles.checkMark, isIpad && styles.checkMarkIpad]}>
          <IconSymbol name="checkmark" size={isIpad ? 16 : 12} color={accent} />
        </View>
      )}
    </Pressable>
  );
}

export default function QuranThemeSelectorModal({
  visible,
  onClose,
  themeId,
  onSelectTheme,
}: QuranThemeSelectorModalProps) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(12);
    }
  }, [visible]);

  const handleSelect = (id: QuranThemeId) => {
    onSelectTheme(id);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[
            styles.content,
            IS_IPAD && styles.contentIpad,
            {
              paddingTop: insets.top + 28,
              paddingBottom: insets.bottom + 28,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {/* Close — minimal, top-right */}
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.6 : 1 }]}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>

            {/* Title & Subtitle */}
            <Text style={styles.title}>Choose Your Reading Experience</Text>
            <Text style={styles.subtitle}>
              Select the atmosphere in which you read.
            </Text>

            {/* Theme cards — vertically stacked */}
            <View style={[styles.cards, IS_IPAD && styles.cardsIpad]}>
              {(Object.keys(QURAN_THEMES) as QuranThemeId[]).map((id) => (
                <ThemePreviewCard
                  key={id}
                  themeId={id}
                  isSelected={themeId === id}
                  onSelect={() => handleSelect(id)}
                  isIpad={IS_IPAD}
                />
              ))}
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: IS_PRO_MAX ? 480 : 420,
    backgroundColor: '#1A1B18',
    borderRadius: 14,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(200, 164, 77, 0.15)',
  },
  contentIpad: {
    maxWidth: 520,
  },
  closeBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  closeText: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 28,
    color: 'rgba(241,239,231,0.6)',
    lineHeight: 28,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 22,
    color: '#F1EFE7',
    letterSpacing: 0.4,
    textAlign: 'center',
    marginBottom: 8,
    paddingTop: 4,
  },
  subtitle: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 14,
    color: 'rgba(241,239,231,0.65)',
    letterSpacing: 0.3,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  cards: {
    gap: 20,
    width: '100%',
  },
  cardsIpad: {
    gap: 24,
  },
  previewCard: {
    width: '100%',
    alignSelf: 'stretch',
    padding: IS_PRO_MAX ? 18 : 14,
    position: 'relative',
    elevation: 0,
  },
  previewCardIpad: {
    padding: 24,
  },
  previewSwatch: {
    height: IS_PRO_MAX ? 60 : 52,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  previewSwatchIpad: {
    height: 76,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  previewAyahRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewAyahRowIpad: {
    gap: 12,
  },
  previewBadge: {
    fontFamily: 'ScheherazadeNew-Bold',
    fontSize: 22,
  },
  previewBadgeIpad: {
    fontSize: 26,
  },
  previewArabic: {
    fontFamily: 'ScheherazadeNew-Bold',
    fontSize: 18,
    flex: 1,
  },
  previewArabicIpad: {
    fontSize: 22,
  },
  themeName: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 16,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  themeNameIpad: {
    fontSize: 19,
    marginBottom: 4,
  },
  themeDesc: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 13,
    opacity: 0.85,
    lineHeight: 18,
  },
  themeDescIpad: {
    fontSize: 15,
    lineHeight: 21,
  },
  checkMark: {
    position: 'absolute',
    top: 14,
    right: 14,
    opacity: 0.9,
  },
  checkMarkIpad: {
    top: 18,
    right: 18,
  },
});
