import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { duas, duaCategories, getDuasByCategory } from '@/data/duasData';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function DuasScreen() {
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDarkMode = theme === 'dark';
  const screenBackground = isDarkMode ? '#070d1b' : '#F3F4F6';
  const cardBackground = isDarkMode ? '#122033' : '#FFFFFF';
  const primaryTextColor = isDarkMode ? '#F8FAFC' : '#0B1120';
  const secondaryTextColor = isDarkMode ? '#D9E3F5' : '#1F2937';
  const mutedTextColor = isDarkMode ? '#99A8C2' : '#4B5563';
  const accentTextColor = isDarkMode ? '#9CC4FF' : colors.icon;
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedDuas, setExpandedDuas] = useState<Set<number>>(new Set());

  const toggleDua = (id: number) => {
    const newExpanded = new Set(expandedDuas);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedDuas(newExpanded);
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      'Daily Duas': 'sunrise.fill',
      'Worship (ʿIbādah)': 'hands.sparkles.fill',
      'Travel & Safety': 'airplane.departure',
      'Health & Protection': 'heart.fill',
      'Forgiveness & Repentance': 'heart.text.square.fill',
      'Rizq (Sustenance)': 'leaf.fill',
      'Family & Relationships': 'person.2.fill',
      'Special Situations': 'exclamationmark.triangle.fill',
      'Death & Afterlife': 'moon.stars.fill',
      'General Goodness': 'star.fill',
      'Mosques & Adhan': 'building.columns.fill',
      'Hajj & Umrah': 'figure.walk',
      'Ramadan': 'moon.fill',
      'Jumu\'ah (Friday)': 'calendar.badge.clock',
      '40 Rabbana Duas': 'book.closed.fill'
    };
    return iconMap[category] || 'book.fill';
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string[] } = {
      'Daily Duas': ['#FF6B6B', '#FF8787'],
      'Worship (ʿIbādah)': ['#4A90E2', '#5CA8F5'],
      'Travel & Safety': ['#10B981', '#2BC897'],
      'Health & Protection': ['#FF6B9D', '#FF87B2'],
      'Forgiveness & Repentance': ['#A78BFA', '#B99FFB'],
      'Rizq (Sustenance)': ['#38BDF8', '#5CC9F9'],
      'Family & Relationships': ['#FBBF24', '#FCC944'],
      'Special Situations': ['#F97316', '#FA8B31'],
      'Death & Afterlife': ['#6366F1', '#7C7FF5'],
      'General Goodness': ['#EC4899', '#EF5FA9'],
      'Mosques & Adhan': ['#06B6D4', '#22D3EE'],
      'Hajj & Umrah': ['#14B8A6', '#2DD4BF'],
      'Ramadan': ['#7C3AED', '#8B5CF6'],
      'Jumu\'ah (Friday)': ['#0EA5E9', '#38BDF8'],
      '40 Rabbana Duas': ['#8B5CF6', '#9D6FF7']
    };
    return colorMap[category] || ['#6B7280', '#9CA3AF'];
  };

  // Render category grid (all categories in 3 columns)
  const renderCategoryGrid = () => {
    const itemSize = (width - 48) / 3; // 3 columns with spacing

    return (
      <View style={styles.gridContainer}>
        {duaCategories.map((categoryData, index) => {
          const categoryDuas = getDuasByCategory(categoryData.category);
          if (categoryDuas.length === 0) return null;

          return (
            <CategorySquare
              key={`cat-${index}`}
              category={categoryData.category}
              duasCount={categoryDuas.length}
              itemSize={itemSize}
              onPress={() => setSelectedCategory(categoryData.category)}
              getCategoryColor={getCategoryColor}
              getCategoryIcon={getCategoryIcon}
            />
          );
        })}
      </View>
    );
  };

  // Render duas list for selected category
  const renderDuasList = () => {
    if (!selectedCategory) return null;

    const categoryDuas = getDuasByCategory(selectedCategory);
    const gradientColors = getCategoryColor(selectedCategory);

    return (
      <View style={styles.duasListContainer}>
        {/* Category Header */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.categoryDetailHeader}
        >
          <TouchableOpacity
            style={styles.backToCategoriesButton}
            onPress={() => {
              setSelectedCategory(null);
              setExpandedDuas(new Set());
            }}
          >
            <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
            <Text style={styles.backToCategoriesText}>Categories</Text>
          </TouchableOpacity>
          
          <View style={styles.categoryDetailInfo}>
            <IconSymbol 
              name={getCategoryIcon(selectedCategory)} 
              size={48} 
              color="#FFFFFF" 
            />
            <Text style={styles.categoryDetailTitle}>{selectedCategory}</Text>
            <Text style={styles.categoryDetailCount}>
              {categoryDuas.length} {categoryDuas.length === 1 ? 'dua' : 'duas'}
            </Text>
          </View>
        </LinearGradient>

        {/* Duas List */}
        <View style={styles.duasScrollContainer}>
          {categoryDuas.map((dua, index) => (
            <DuaCard
              key={`dua-${dua.id}-${index}`}
              dua={dua}
              isExpanded={expandedDuas.has(dua.id)}
              onToggle={() => toggleDua(dua.id)}
              theme={theme}
              colors={colors}
              cardBackground={cardBackground}
              primaryTextColor={primaryTextColor}
              secondaryTextColor={secondaryTextColor}
              mutedTextColor={mutedTextColor}
              accentTextColor={accentTextColor}
              isDarkMode={isDarkMode}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: screenBackground }]}>
      {/* Header - Only show when on grid view */}
      {!selectedCategory && (
        <LinearGradient
          colors={['#EBF4F5', '#B5C6E0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.headerGradient, { paddingTop: insets.top + 2 }]}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left.circle.fill" size={42} color="#1F2937" />
            <Text style={[styles.backText, { color: '#1F2937' }]}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Daily Duas</Text>
            <Text style={styles.headerSubtitle}>الأدعية اليومية</Text>
          </View>
        </LinearGradient>
      )}

      <ScrollView 
        style={[styles.content, { backgroundColor: screenBackground }]}
        contentContainerStyle={[styles.contentContainer, selectedCategory && styles.contentContainerPadding]}
        showsVerticalScrollIndicator={false}
      >
        {!selectedCategory ? renderCategoryGrid() : renderDuasList()}
      </ScrollView>
    </View>
  );
}

// Animated Category Square Component
interface CategorySquareProps {
  category: string;
  duasCount: number;
  itemSize: number;
  onPress: () => void;
  getCategoryColor: (category: string) => string[];
  getCategoryIcon: (category: string) => string;
}

function CategorySquare({ 
  category, 
  duasCount, 
  itemSize, 
  onPress, 
  getCategoryColor,
  getCategoryIcon 
}: CategorySquareProps) {
  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  const handlePressIn = () => {
    scaleValue.value = withSpring(0.92, {
      damping: 15,
      stiffness: 200,
    });
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, {
      damping: 15,
      stiffness: 200,
    });
  };

  const gradientColors = getCategoryColor(category);

  return (
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity
        style={[styles.categorySquare, { width: itemSize, height: itemSize }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.categoryGradient}
        >
          <IconSymbol 
            name={getCategoryIcon(category)} 
            size={32} 
            color="#FFFFFF" 
          />
          <Text style={styles.categoryName} numberOfLines={2}>
            {category}
          </Text>
          <Text style={styles.categoryDuaCount}>
            {duasCount} {duasCount === 1 ? 'dua' : 'duas'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Animated Dua Card Component
interface DuaCardProps {
  dua: any;
  isExpanded: boolean;
  onToggle: () => void;
  theme: string;
  colors: any;
  cardBackground: string;
  primaryTextColor: string;
  secondaryTextColor: string;
  mutedTextColor: string;
  accentTextColor: string;
  isDarkMode: boolean;
}

function DuaCard({ 
  dua, 
  isExpanded, 
  onToggle, 
  theme, 
  colors,
  cardBackground,
  primaryTextColor,
  secondaryTextColor,
  mutedTextColor,
  accentTextColor,
  isDarkMode,
}: DuaCardProps) {
  const expansionProgress = useSharedValue(isExpanded ? 1 : 0);
  const scaleValue = useSharedValue(1);

  React.useEffect(() => {
    expansionProgress.value = withSpring(isExpanded ? 1 : 0, {
      damping: 20,
      stiffness: 90,
    });
  }, [isExpanded, expansionProgress]);

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(expansionProgress.value, { duration: 250 }),
      transform: [
        {
          scaleY: expansionProgress.value,
        },
      ],
    };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: withTiming(`${expansionProgress.value * 180}deg`, { duration: 250 }),
        },
      ],
    };
  });

  const handlePressIn = () => {
    scaleValue.value = withSpring(0.98, {
      damping: 15,
      stiffness: 150,
    });
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
  };

  return (
    <Animated.View style={animatedCardStyle}>
      <TouchableOpacity
        style={[styles.duaCard, { 
          backgroundColor: cardBackground,
          borderColor: isExpanded ? '#4A90E2' : (isDarkMode ? '#223248' : '#E5E7EB'),
          borderLeftColor: isExpanded ? '#4A90E2' : (isDarkMode ? '#223248' : '#E5E7EB'),
          borderLeftWidth: isExpanded ? 4 : 1,
          shadowColor: isDarkMode ? '#01060D' : '#000',
        }]}
        onPress={onToggle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.duaHeader}>
          <View style={styles.duaTitleContainer}>
            <Text style={[styles.duaTitle, { color: primaryTextColor }]}>{dua.title}</Text>
            {dua.times && (
              <Text style={[styles.duaTimes, { color: mutedTextColor }]}>
                {dua.times}
              </Text>
            )}
          </View>
          <Animated.View style={animatedIconStyle}>
            <IconSymbol
              name={isExpanded ? 'chevron.up.circle.fill' : 'chevron.down.circle'}
              size={24}
              color={isExpanded ? '#4A90E2' : secondaryTextColor}
            />
          </Animated.View>
        </View>
        
        {isExpanded && (
          <Animated.View style={[styles.duaContent, animatedContentStyle]}>
            <View style={[styles.duaSection, { 
              backgroundColor: isDarkMode ? '#101c2b' : '#F8FAFC',
            }]}>
              <Text style={[styles.duaArabic, { color: primaryTextColor }]}>
                {dua.arabic}
              </Text>
            </View>
            <View style={[styles.duaSection, {
              backgroundColor: isDarkMode ? 'rgba(74, 144, 226, 0.12)' : 'rgba(74, 144, 226, 0.05)',
            }]}>
              <Text style={[styles.sectionLabel, { color: accentTextColor }]}>Transliteration</Text>
              <Text style={[styles.duaTransliteration, { color: secondaryTextColor }]}>
                {dua.transliteration}
              </Text>
            </View>
            <View style={[styles.duaSection, {
              backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.05)',
            }]}>
              <Text style={[styles.sectionLabel, { color: accentTextColor }]}>Translation</Text>
              <Text style={[styles.duaTranslation, { color: secondaryTextColor }]}>
                {dua.translation}
              </Text>
            </View>
            {dua.reference && (
              <View style={[styles.referenceContainer, { 
                backgroundColor: isDarkMode ? 'rgba(168, 85, 247, 0.14)' : 'rgba(168, 85, 247, 0.05)',
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.1)',
              }]}>
                <IconSymbol name="book.closed" size={16} color={accentTextColor} />
                <Text style={[styles.duaReference, { color: secondaryTextColor }]}>
                  {dua.reference}
                </Text>
              </View>
            )}
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 4,
    paddingHorizontal: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 12,
  },
  backText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.4,
  },
  headerTitleContainer: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 0,
  },
  headerTitle: {
    fontSize: 34,
    fontFamily: Fonts.secondary,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.12)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 20,
    color: '#1F2937',
    opacity: 0.9,
    fontFamily: Fonts.primary,
    fontWeight: '700',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  contentContainerPadding: {
    padding: 0,
    paddingBottom: 30,
  },
  
  // Grid Layout
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  categorySquare: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  categoryGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.4,
  },
  categoryDuaCount: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.92)',
    letterSpacing: 0.2,
  },

  // Category Detail View
  duasListContainer: {
    flex: 1,
  },
  categoryDetailHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  backToCategoriesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backToCategoriesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  categoryDetailInfo: {
    alignItems: 'center',
    gap: 8,
  },
  categoryDetailTitle: {
    fontSize: 30,
    fontFamily: Fonts.secondary,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.6,
  },
  categoryDetailCount: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  duasScrollContainer: {
    padding: 18,
    gap: 16,
  },

  // Dua Card Styles
  duaCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  duaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
  },
  duaTitleContainer: {
    flex: 1,
  },
  duaTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.6,
    color: '#0B1120',
  },
  duaTimes: {
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 6,
    letterSpacing: 0.3,
    color: '#1F2937',
  },
  duaContent: {
    marginTop: 18,
    gap: 16,
  },
  duaSection: {
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    color: '#111827',
  },
  duaArabic: {
    fontSize: 32,
    lineHeight: 48,
    textAlign: 'right',
    fontFamily: Fonts.primary,
    letterSpacing: 0.8,
    color: '#0B1120',
  },
  duaTransliteration: {
    fontSize: 20,
    lineHeight: 30,
    fontStyle: 'italic',
    color: '#0B1120',
  },
  duaTranslation: {
    fontSize: 20,
    lineHeight: 30,
    color: '#0B1120',
  },
  referenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 10,
    marginTop: 6,
  },
  duaReference: {
    fontSize: 15,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#1F2937',
  },
});
