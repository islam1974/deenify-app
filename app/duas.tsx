import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { duaCategories, duas, getDuasByCategory } from '@/data/duasData';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const IS_IPAD = Platform.OS === 'ios' && (Platform.isPad === true || screenWidth >= 768);
const IS_IPAD_11 = IS_IPAD && Math.min(screenWidth, screenHeight) <= 900;
const IS_IPHONE_SE = !IS_IPAD && screenWidth <= 375;

export default function DuasScreen() {
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isDarkMode = theme === 'dark';
  const screenBackground = isDarkMode ? '#070d1b' : '#F3F4F6';
  const cardBackground = isDarkMode ? '#122033' : '#FFFFFF';
  const primaryTextColor = isDarkMode ? '#F8FAFC' : '#0B1120';
  const secondaryTextColor = isDarkMode ? '#D9E3F5' : '#1F2937';
  const mutedTextColor = isDarkMode ? '#99A8C2' : '#4B5563';
  const accentTextColor = isDarkMode ? '#9CC4FF' : colors.icon;
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedDuas, setExpandedDuas] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  const getCategoryColor = (category: string): readonly [string, string] => {
    // All category cards use the same color
    return ['#c6ca53', '#c6ca53'];
  };

  // Filter duas based on search query
  const filteredDuas = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase().trim();
    return duas.filter(dua => 
      dua.title.toLowerCase().includes(query) ||
      dua.arabic.includes(query) ||
      dua.transliteration.toLowerCase().includes(query) ||
      dua.translation.toLowerCase().includes(query) ||
      dua.category.toLowerCase().includes(query) ||
      dua.subcategory.toLowerCase().includes(query) ||
      (dua.reference?.toLowerCase().includes(query) ?? false) ||
      (dua.times?.toLowerCase().includes(query) ?? false)
    );
  }, [searchQuery]);

  // Render search results
  const renderSearchResults = () => {
    if (!searchQuery.trim()) return null;

    return (
      <View style={styles.duasListContainer}>
        {/* Search Header */}
        <View style={[styles.searchHeader, IS_IPAD && styles.searchHeaderIpad, { 
          backgroundColor: cardBackground,
          borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }]}>
          <Text style={[styles.searchResultsTitle, IS_IPAD && styles.searchResultsTitleIpad, { color: primaryTextColor }]}>
            Search Results
          </Text>
          <Text style={[styles.searchResultsCount, IS_IPAD && styles.searchResultsCountIpad, { color: secondaryTextColor }]}>
            {filteredDuas.length} {filteredDuas.length === 1 ? 'dua found' : 'duas found'}
          </Text>
        </View>

        {/* Search Results List */}
        <View style={[styles.duasScrollContainer, IS_IPAD && styles.duasScrollContainerIpad, IS_IPAD_11 && styles.duasScrollContainerIpad11, IS_IPHONE_SE && styles.duasScrollContainerSE]}>
          {filteredDuas.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <IconSymbol name="magnifyingglass" size={48} color={mutedTextColor} />
              <Text style={[styles.noResultsText, { color: mutedTextColor }]}>
                No duas found
              </Text>
              <Text style={[styles.noResultsSubtext, { color: mutedTextColor }]}>
                Try searching with different keywords
              </Text>
            </View>
          ) : (
            filteredDuas.map((dua, index) => (
              <DuaCard
                key={`search-dua-${dua.id}-${index}`}
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
                isIpad={IS_IPAD}
                isIpad11={IS_IPAD_11}
                isIphoneSE={IS_IPHONE_SE}
              />
            ))
          )}
        </View>
      </View>
    );
  };

  // Render category grid - 15 cards: 5 columns (3 rows) or 3 columns (5 rows) so all rows are equal
  const renderCategoryGrid = () => {
    const categoriesWithDuas = duaCategories.filter(categoryData => {
      const categoryDuas = getDuasByCategory(categoryData.category);
      return categoryDuas.length > 0;
    });

    const cols = IS_IPAD ? 3 : 3; // iPad: 3 columns × 5 rows = 15 cards; phone: 3 × 5
    const containerPadding = IS_IPHONE_SE ? 6 : IS_IPAD_11 ? 32 : IS_IPAD ? 56 : 24;
    const gapSize = IS_IPHONE_SE ? 10 : IS_IPAD_11 ? 20 : IS_IPAD ? 32 : 8;
    const availableWidth = width - containerPadding * 2 - gapSize * (cols - 1);
    const itemWidth = availableWidth / cols;
    const numRows = Math.ceil(categoriesWithDuas.length / cols);
    const headerHeight = IS_IPAD ? 140 : 140;
    const searchHeight = IS_IPAD ? 64 : 56;
    const availableHeight = height - insets.top - insets.bottom - headerHeight - searchHeight - (IS_IPAD ? 24 : 24);
    const itemHeight = Math.floor((availableHeight - gapSize * (numRows - 1)) / numRows);
    const minItemSizeIpad = IS_IPAD_11 ? 200 : 280;
    const itemSize = IS_IPAD
      ? Math.min(Math.max(Math.min(itemWidth, itemHeight), minItemSizeIpad), itemHeight)
      : Math.min(itemWidth, itemHeight);

    const rows: typeof categoriesWithDuas[] = [];
    for (let i = 0; i < categoriesWithDuas.length; i += cols) {
      rows.push(categoriesWithDuas.slice(i, i + cols));
    }

    return (
      <View style={[styles.gridContainer, IS_IPAD && styles.gridContainerIpad, IS_IPAD_11 && styles.gridContainerIpad11, !IS_IPAD && styles.gridContainerPhone, IS_IPHONE_SE && styles.gridContainerSE]}>
        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={[styles.gridRow, IS_IPAD && styles.gridRowIpad, IS_IPAD_11 && styles.gridRowIpad11, IS_IPHONE_SE && styles.gridRowSE]}>
            {row.map((categoryData, itemIndex) => {
              const categoryDuas = getDuasByCategory(categoryData.category);
              const globalIndex = rowIndex * cols + itemIndex;
              
              return (
                <View 
                  key={`cat-${categoryData.category}-${globalIndex}`}
                  style={[
                    { 
                      width: itemSize, 
                      height: itemSize,
                      marginRight: itemIndex < row.length - 1 ? gapSize : 0,
                    }
                  ]}
                >
                  <CategorySquare
                    category={categoryData.category}
                    duasCount={categoryDuas.length}
                    itemSize={itemSize}
                    onPress={() => setSelectedCategory(categoryData.category)}
                    getCategoryColor={getCategoryColor}
                    getCategoryIcon={getCategoryIcon}
                    isIpad={IS_IPAD}
                    isIpad11={IS_IPAD_11}
                    isIphoneSE={IS_IPHONE_SE}
                  />
                </View>
              );
            })}
          </View>
        ))}
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
        <View
          style={[styles.categoryDetailHeader, IS_IPAD && styles.categoryDetailHeaderIpad, { backgroundColor: screenBackground }]}
        >
          <TouchableOpacity
            style={[styles.backToCategoriesButton, IS_IPAD && styles.backToCategoriesButtonIpad, IS_IPHONE_SE && styles.backToCategoriesButtonSE]}
            onPress={() => {
              setSelectedCategory(null);
              setExpandedDuas(new Set());
            }}
          >
            <IconSymbol name="chevron.left" size={IS_IPHONE_SE ? 20 : IS_IPAD ? 32 : 24} color={isDarkMode ? '#FFFFFF' : '#1F2937'} />
            <Text style={[styles.backToCategoriesText, IS_IPAD && styles.backToCategoriesTextIpad, IS_IPHONE_SE && styles.backToCategoriesTextSE, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>Categories</Text>
          </TouchableOpacity>
          
          <View style={[styles.categoryDetailInfo, IS_IPAD && styles.categoryDetailInfoIpad]}>
            <IconSymbol 
              name={getCategoryIcon(selectedCategory) as Parameters<typeof IconSymbol>[0]['name']} 
              size={IS_IPAD ? 64 : 48} 
              color={isDarkMode ? '#FFFFFF' : '#1F2937'} 
            />
            <Text style={[styles.categoryDetailTitle, IS_IPAD && styles.categoryDetailTitleIpad, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>{selectedCategory}</Text>
            <Text style={[styles.categoryDetailCount, IS_IPAD && styles.categoryDetailCountIpad, { color: isDarkMode ? '#D9E3F5' : '#1F2937' }]}>
              {categoryDuas.length} {categoryDuas.length === 1 ? 'dua' : 'duas'}
            </Text>
          </View>
        </View>

        {/* Duas List */}
        <View style={[styles.duasScrollContainer, IS_IPAD && styles.duasScrollContainerIpad, IS_IPAD_11 && styles.duasScrollContainerIpad11, IS_IPHONE_SE && styles.duasScrollContainerSE]}>
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
              isIpad={IS_IPAD}
              isIpad11={IS_IPAD_11}
              isIphoneSE={IS_IPHONE_SE}
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
        <View
          style={[styles.headerGradient, IS_IPAD && styles.headerGradientIpad, !IS_IPAD && styles.headerGradientPhone, { backgroundColor: screenBackground, paddingTop: insets.top + 2 }]}
        >
          <TouchableOpacity
            style={[styles.backButton, IS_IPAD && styles.backButtonIpad, IS_IPHONE_SE && styles.backButtonSE]}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left.circle.fill" size={IS_IPHONE_SE ? 36 : IS_IPAD ? 56 : 48} color={isDarkMode ? '#FFFFFF' : '#1F2937'} />
            <Text style={[styles.backText, IS_IPAD && styles.backTextIpad, IS_IPHONE_SE && styles.backTextSE, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, IS_IPAD && styles.headerTitleIpad, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>Daily Duas</Text>
            <Text style={[styles.headerSubtitle, IS_IPAD && styles.headerSubtitleIpad, { color: isDarkMode ? '#D9E3F5' : '#1F2937' }]}>الأدعية اليومية</Text>
          </View>
        </View>
      )}

      {/* Search Bar - always visible; add top padding when header is hidden (category view) */}
      <View style={[
        styles.searchContainer,
        IS_IPAD && styles.searchContainerIpad,
        !IS_IPAD && styles.searchContainerPhone,
        { backgroundColor: screenBackground, paddingTop: selectedCategory ? insets.top + 8 : undefined }
      ]}>
        <View style={[styles.searchBar, IS_IPAD && styles.searchBarIpad, { backgroundColor: cardBackground, borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]}>
          <IconSymbol name="magnifyingglass" size={IS_IPAD ? 26 : 20} color={mutedTextColor} />
          <TextInput
            style={[styles.searchInput, IS_IPAD && styles.searchInputIpad, { color: primaryTextColor }]}
            placeholder="Search duas..."
            placeholderTextColor={mutedTextColor}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text.trim()) {
                setSelectedCategory(null);
              }
            }}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
              accessibilityLabel="Clear search"
            >
              <IconSymbol name="xmark.circle.fill" size={IS_IPAD ? 26 : 20} color={mutedTextColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        style={[styles.content, { backgroundColor: screenBackground }]}
        contentContainerStyle={[
          styles.contentContainer,
          selectedCategory && styles.contentContainerPadding,
          IS_IPAD && styles.contentContainerIpad,
          !IS_IPAD && styles.contentContainerPhone,
          IS_IPHONE_SE && styles.contentContainerSE,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {searchQuery.trim() ? renderSearchResults() : (!selectedCategory ? renderCategoryGrid() : renderDuasList())}
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
  getCategoryColor: (category: string) => readonly [string, string];
  getCategoryIcon: (category: string) => string;
  isIpad?: boolean;
  isIpad11?: boolean;
  isIphoneSE?: boolean;
}

function CategorySquare({
  category,
  duasCount,
  itemSize,
  onPress,
  getCategoryColor,
  getCategoryIcon,
  isIpad = false,
  isIpad11 = false,
  isIphoneSE = false,
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
    <Animated.View style={[animatedStyle, { width: '100%', height: '100%' }]}>
      <TouchableOpacity
        style={styles.categorySquare}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={gradientColors as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.categoryGradient, isIpad && styles.categoryGradientIpad, isIpad11 && styles.categoryGradientIpad11, isIphoneSE && styles.categoryGradientSE]}
        >
          <Text style={[styles.categoryName, isIpad && styles.categoryNameIpad, isIpad11 && styles.categoryNameIpad11, isIphoneSE && styles.categoryNameSE]} numberOfLines={2}>
            {category}
          </Text>
          <Text style={[styles.categoryDuaCount, isIpad && styles.categoryDuaCountIpad, isIpad11 && styles.categoryDuaCountIpad11, isIphoneSE && styles.categoryDuaCountSE]}>
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
  isIpad?: boolean;
  isIpad11?: boolean;
  isIphoneSE?: boolean;
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
  isIpad = false,
  isIpad11 = false,
  isIphoneSE = false,
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
        style={[styles.duaCard, isIpad && styles.duaCardIpad, isIpad11 && styles.duaCardIpad11, isIphoneSE && styles.duaCardSE, { 
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
        <View style={[styles.duaHeader, isIpad && styles.duaHeaderIpad, isIpad11 && styles.duaHeaderIpad11, isIphoneSE && styles.duaHeaderSE]}>
          <View style={styles.duaTitleContainer}>
            <Text style={[styles.duaTitle, isIpad && styles.duaTitleIpad, isIpad11 && styles.duaTitleIpad11, isIphoneSE && styles.duaTitleSE, { color: primaryTextColor }]}>{dua.title}</Text>
            {dua.times && (
              <Text style={[styles.duaTimes, isIpad && styles.duaTimesIpad, isIpad11 && styles.duaTimesIpad11, isIphoneSE && styles.duaTimesSE, { color: mutedTextColor }]}>
                {dua.times}
              </Text>
            )}
          </View>
          <Animated.View style={animatedIconStyle}>
            <IconSymbol
              name={isExpanded ? 'chevron.up.circle.fill' : 'chevron.down.circle'}
              size={isIphoneSE ? 18 : isIpad11 ? 26 : isIpad ? 32 : 24}
              color={isExpanded ? '#4A90E2' : secondaryTextColor}
            />
          </Animated.View>
        </View>
        
        {isExpanded && (
          <Animated.View style={[styles.duaContent, isIpad && styles.duaContentIpad, isIpad11 && styles.duaContentIpad11, isIphoneSE && styles.duaContentSE, animatedContentStyle]}>
            <View style={[styles.duaSection, isIpad && styles.duaSectionIpad, isIpad11 && styles.duaSectionIpad11, isIphoneSE && styles.duaSectionSE, { 
              backgroundColor: isDarkMode ? '#101c2b' : '#F8FAFC',
            }]}>
              <Text style={[styles.duaArabic, isIpad && styles.duaArabicIpad, isIpad11 && styles.duaArabicIpad11, isIphoneSE && styles.duaArabicSE, { color: primaryTextColor }]}>
                {dua.arabic}
              </Text>
            </View>
            <View style={[styles.duaSection, isIpad && styles.duaSectionIpad, isIpad11 && styles.duaSectionIpad11, isIphoneSE && styles.duaSectionSE, {
              backgroundColor: isDarkMode ? 'rgba(74, 144, 226, 0.12)' : 'rgba(74, 144, 226, 0.05)',
            }]}>
              <Text style={[styles.sectionLabel, isIpad && styles.sectionLabelIpad, isIpad11 && styles.sectionLabelIpad11, isIphoneSE && styles.sectionLabelSE, { color: accentTextColor }]}>Transliteration</Text>
              <Text style={[styles.duaTransliteration, isIpad && styles.duaTransliterationIpad, isIpad11 && styles.duaTransliterationIpad11, isIphoneSE && styles.duaTransliterationSE, { color: secondaryTextColor }]}>
                {dua.transliteration}
              </Text>
            </View>
            <View style={[styles.duaSection, isIpad && styles.duaSectionIpad, isIpad11 && styles.duaSectionIpad11, isIphoneSE && styles.duaSectionSE, {
              backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.05)',
            }]}>
              <Text style={[styles.sectionLabel, isIpad && styles.sectionLabelIpad, isIpad11 && styles.sectionLabelIpad11, isIphoneSE && styles.sectionLabelSE, { color: accentTextColor }]}>Translation</Text>
              <Text style={[styles.duaTranslation, isIpad && styles.duaTranslationIpad, isIpad11 && styles.duaTranslationIpad11, isIphoneSE && styles.duaTranslationSE, { color: secondaryTextColor }]}>
                {dua.translation}
              </Text>
            </View>
            {dua.reference && (
              <View style={[styles.referenceContainer, isIpad && styles.referenceContainerIpad, isIpad11 && styles.referenceContainerIpad11, isIphoneSE && styles.referenceContainerSE, { 
                backgroundColor: isDarkMode ? 'rgba(168, 85, 247, 0.14)' : 'rgba(168, 85, 247, 0.05)',
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.1)',
              }]}>
                <IconSymbol name="book.closed" size={isIphoneSE ? 12 : isIpad11 ? 18 : isIpad ? 22 : 16} color={accentTextColor} />
                <Text style={[styles.duaReference, isIpad && styles.duaReferenceIpad, isIpad11 && styles.duaReferenceIpad11, isIphoneSE && styles.duaReferenceSE, { color: secondaryTextColor }]}>
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
    paddingBottom: IS_IPAD ? 4 : 2,
    paddingHorizontal: IS_IPAD ? 10 : 8,
  },
  headerGradientIpad: {
    paddingHorizontal: 48,
    paddingBottom: 12,
  },
  headerGradientPhone: {
    paddingLeft: 18,
    paddingRight: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 0,
    gap: 12,
  },
  backButtonIpad: {
    marginTop: 8,
    gap: 16,
  },
  backText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.4,
  },
  backTextIpad: {
    fontSize: 28,
  },
  backButtonSE: {
    gap: 8,
  },
  backTextSE: {
    fontSize: 16,
  },
  backToCategoriesButtonSE: {
    marginBottom: 12,
  },
  backToCategoriesTextSE: {
    fontSize: 14,
    marginLeft: 4,
  },
  headerTitleContainer: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 0,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: Fonts.secondary,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 0,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.12)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerTitleIpad: {
    fontSize: 38,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#1F2937',
    opacity: 0.9,
    fontFamily: Fonts.primary,
    fontWeight: '700',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitleIpad: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 0,
    paddingBottom: 40,
  },
  contentContainerPadding: {
    padding: 0,
    paddingBottom: 40,
  },
  contentContainerIpad: {
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: 48,
    paddingHorizontal: 48,
  },
  contentContainerPhone: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  contentContainerSE: {
    paddingLeft: 6,
    paddingRight: 6,
    alignItems: 'center',
  },
  // Grid Layout
  gridContainer: {
    width: '100%',
    paddingHorizontal: IS_IPAD ? 10 : 12,
    paddingTop: IS_IPAD ? 4 : 8,
  },
  gridContainerIpad: {
    paddingHorizontal: 48,
    paddingTop: 24,
    paddingBottom: 32,
  },
  gridContainerIpad11: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  gridContainerPhone: {
    paddingLeft: 18,
    paddingRight: 6,
  },
  gridContainerSE: {
    paddingHorizontal: 6,
    paddingTop: 4,
    alignSelf: 'center',
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: IS_IPAD ? 32 : 8,
    width: '100%',
  },
  gridRowIpad: {
    justifyContent: 'center',
  },
  gridRowIpad11: {
    marginBottom: 20,
  },
  gridRowSE: {
    marginBottom: 12,
    justifyContent: 'center',
  },
  categorySquare: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  categoryGradient: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  categoryGradientIpad: {
    padding: 20,
    gap: 12,
  },
  categoryGradientIpad11: {
    padding: 12,
    gap: 8,
  },
  categoryGradientSE: {
    padding: 8,
    gap: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 15,
    letterSpacing: 0.4,
  },
  categoryNameIpad: {
    fontSize: 22,
    lineHeight: 28,
  },
  categoryNameIpad11: {
    fontSize: 16,
    lineHeight: 20,
  },
  categoryNameSE: {
    fontSize: 11,
    lineHeight: 13,
  },
  categoryDuaCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.2,
  },
  categoryDuaCountIpad: {
    fontSize: 18,
  },
  categoryDuaCountIpad11: {
    fontSize: 14,
  },
  categoryDuaCountSE: {
    fontSize: 10,
  },

  // Category Detail View
  duasListContainer: {
    flex: 1,
  },
  categoryDetailHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  categoryDetailHeaderIpad: {
    paddingTop: 60,
    paddingBottom: 36,
    paddingHorizontal: 48,
  },
  backToCategoriesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backToCategoriesButtonIpad: {
    marginBottom: 28,
  },
  backToCategoriesText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  backToCategoriesTextIpad: {
    fontSize: 22,
    marginLeft: 10,
  },
  categoryDetailInfo: {
    alignItems: 'center',
    gap: 12,
  },
  categoryDetailInfoIpad: {
    gap: 16,
  },
  categoryDetailTitle: {
    fontSize: 30,
    fontFamily: Fonts.secondary,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.6,
  },
  categoryDetailTitleIpad: {
    fontSize: 40,
  },
  categoryDetailCount: {
    fontSize: 16,
    fontWeight: '700',
  },
  categoryDetailCountIpad: {
    fontSize: 22,
  },
  duasScrollContainer: {
    padding: 24,
    gap: 20,
  },
  duasScrollContainerIpad: {
    padding: 48,
    paddingTop: 32,
    gap: 28,
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },
  duasScrollContainerIpad11: {
    padding: 24,
    paddingTop: 20,
    gap: 20,
    maxWidth: 680,
  },
  duasScrollContainerSE: {
    padding: 6,
    paddingTop: 10,
    gap: 24,
    alignSelf: 'center',
    width: '100%',
  },

  // Dua Card Styles
  duaCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 24,
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
  duaCardIpad: {
    borderRadius: 20,
    padding: 32,
  },
  duaCardIpad11: {
    borderRadius: 16,
    padding: 20,
  },
  duaCardSE: {
    borderRadius: 18,
    padding: 20,
  },
  duaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 18,
  },
  duaHeaderIpad: {
    gap: 24,
  },
  duaHeaderIpad11: {
    gap: 16,
  },
  duaHeaderSE: {
    gap: 12,
  },
  duaTitleContainer: {
    flex: 1,
  },
  duaTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 0.6,
    color: '#0B1120',
  },
  duaTitleIpad: {
    fontSize: 30,
    marginBottom: 12,
  },
  duaTitleIpad11: {
    fontSize: 22,
    marginBottom: 8,
  },
  duaTitleSE: {
    fontSize: 17,
    marginBottom: 8,
  },
  duaTimes: {
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 6,
    letterSpacing: 0.3,
    color: '#1F2937',
  },
  duaTimesIpad: {
    fontSize: 20,
    marginTop: 8,
  },
  duaTimesIpad11: {
    fontSize: 15,
    marginTop: 4,
  },
  duaTimesSE: {
    fontSize: 12,
    marginTop: 4,
  },
  duaContent: {
    marginTop: 24,
    gap: 20,
  },
  duaContentIpad: {
    marginTop: 32,
    gap: 28,
  },
  duaContentIpad11: {
    marginTop: 20,
    gap: 16,
  },
  duaContentSE: {
    marginTop: 20,
    gap: 16,
  },
  duaSection: {
    padding: 20,
    borderRadius: 12,
    gap: 12,
  },
  duaSectionIpad: {
    padding: 28,
    borderRadius: 16,
    gap: 16,
  },
  duaSectionIpad11: {
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  duaSectionSE: {
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
  sectionLabelIpad: {
    fontSize: 18,
    marginBottom: 12,
  },
  sectionLabelIpad11: {
    fontSize: 14,
    marginBottom: 8,
  },
  sectionLabelSE: {
    fontSize: 11,
    marginBottom: 6,
  },
  duaArabic: {
    fontSize: 32,
    lineHeight: 48,
    textAlign: 'right',
    fontFamily: Fonts.primary,
    letterSpacing: 0.8,
    color: '#0B1120',
  },
  duaArabicIpad: {
    fontSize: 40,
    lineHeight: 58,
  },
  duaArabicIpad11: {
    fontSize: 28,
    lineHeight: 42,
  },
  duaArabicSE: {
    fontSize: 20,
    lineHeight: 32,
  },
  duaTransliteration: {
    fontSize: 20,
    lineHeight: 30,
    fontStyle: 'italic',
    color: '#0B1120',
  },
  duaTransliterationIpad: {
    fontSize: 24,
    lineHeight: 36,
  },
  duaTransliterationIpad11: {
    fontSize: 18,
    lineHeight: 28,
  },
  duaTransliterationSE: {
    fontSize: 13,
    lineHeight: 20,
  },
  duaTranslation: {
    fontSize: 20,
    lineHeight: 30,
    color: '#0B1120',
  },
  duaTranslationIpad: {
    fontSize: 24,
    lineHeight: 36,
  },
  duaTranslationIpad11: {
    fontSize: 18,
    lineHeight: 28,
  },
  duaTranslationSE: {
    fontSize: 13,
    lineHeight: 20,
  },
  referenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 10,
    marginTop: 6,
  },
  referenceContainerIpad: {
    padding: 20,
    borderRadius: 14,
    gap: 14,
    marginTop: 10,
  },
  referenceContainerIpad11: {
    padding: 14,
    borderRadius: 12,
    gap: 10,
    marginTop: 8,
  },
  referenceContainerSE: {
    padding: 12,
    borderRadius: 12,
    gap: 10,
    marginTop: 10,
  },
  duaReference: {
    fontSize: 15,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#1F2937',
  },
  duaReferenceIpad: {
    fontSize: 19,
  },
  duaReferenceIpad11: {
    fontSize: 16,
  },
  duaReferenceSE: {
    fontSize: 12,
  },
  
  // Search Bar Styles
  searchContainer: {
    paddingVertical: IS_IPAD ? 10 : 16,
    paddingHorizontal: IS_IPAD ? 10 : 20,
  },
  searchContainerIpad: {
    paddingVertical: 16,
    paddingHorizontal: 48,
  },
  searchContainerPhone: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  searchBarIpad: {
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  searchInputIpad: {
    fontSize: 20,
  },
  clearButton: {
    padding: 4,
  },
  searchHeader: {
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  searchHeaderIpad: {
    padding: 36,
    paddingBottom: 24,
  },
  searchResultsTitle: {
    fontSize: 24,
    fontFamily: Fonts.secondary,
    fontWeight: '800',
    marginBottom: 4,
  },
  searchResultsTitleIpad: {
    fontSize: 32,
    marginBottom: 8,
  },
  searchResultsCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  searchResultsCountIpad: {
    fontSize: 20,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
