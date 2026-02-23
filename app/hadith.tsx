import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { hadithCollections, getHadithsBySubcategory, Hadith } from '@/data/hadithData';
import { HadithService } from '@/services/HadithService';

const { width } = Dimensions.get('window');

type ViewMode = 'collections' | 'categories' | 'hadiths';

export default function HadithScreen() {
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
  
  const [viewMode, setViewMode] = useState<ViewMode>('collections');
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentHadithIndex, setCurrentHadithIndex] = useState(0);
  const [bookmarkedHadiths, setBookmarkedHadiths] = useState<number[]>([]);
  const [fetchedHadiths, setFetchedHadiths] = useState<Hadith[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get collection color - all use same color like duas
  const getCollectionColor = (index: number): string[] => {
    return ['#c6ca53', '#c6ca53'];
  };

  const handleCollectionPress = (collectionName: string) => {
    setSelectedCollection(collectionName);
    setViewMode('categories');
  };

  const handleCategoryPress = async (categoryName: string) => {
    setSelectedCategory(categoryName);
    setCurrentHadithIndex(0);
    setViewMode('hadiths');
    setIsLoading(true);
    setError(null);

    try {
      // First try to get from local data as fallback
      const localHadiths = getHadithsBySubcategory(selectedCollection, categoryName);
      
      if (localHadiths.length > 0) {
        setFetchedHadiths(localHadiths);
        setIsLoading(false);
      } else {
        // If no local data, try fetching from API
        const apiHadith = await HadithService.getRandomHadithFromCategory(
          selectedCollection,
          categoryName
        );
        
        if (apiHadith) {
          setFetchedHadiths([apiHadith]);
        } else {
          setError('No hadiths available for this category');
          setFetchedHadiths([]);
        }
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error loading hadiths:', err);
      setError('Failed to load hadiths');
      setIsLoading(false);
      
      // Try local data as ultimate fallback
      const localHadiths = getHadithsBySubcategory(selectedCollection, categoryName);
      if (localHadiths.length > 0) {
        setFetchedHadiths(localHadiths);
        setError(null);
      }
    }
  };

  const handleBackPress = () => {
    if (viewMode === 'hadiths') {
      setViewMode('categories');
    } else if (viewMode === 'categories') {
      setViewMode('collections');
    } else {
      router.back();
    }
  };

  const toggleBookmark = (hadithId: number) => {
    setBookmarkedHadiths(prev => 
      prev.includes(hadithId) 
        ? prev.filter(id => id !== hadithId)
        : [...prev, hadithId]
    );
  };

  const getCurrentHadiths = () => {
    return fetchedHadiths;
  };

  const getHeaderTitle = () => {
    if (viewMode === 'collections') return 'Hadith Collections';
    if (viewMode === 'categories') return selectedCollection;
    return selectedCategory;
  };

  const getHeaderSubtitle = () => {
    if (viewMode === 'collections') return 'مجموعات الحديث';
    if (viewMode === 'categories') return 'Choose a Category';
    return selectedCollection;
  };

  // Footer for collections: hadith snippet + hint
  const renderCollectionsFooter = () => (
    <View style={[styles.collectionsFooter, { marginBottom: insets.bottom + 16 }]}>
      <View style={[
        styles.collectionsFooterCard,
        { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }
      ]}>
        <Text style={[styles.collectionsFooterQuote, { color: secondaryTextColor }]}>
          "Seeking knowledge is an obligation upon every Muslim."
        </Text>
        <Text style={[styles.collectionsFooterSource, { color: mutedTextColor }]}>
          — Sunan Ibn Majah
        </Text>
      </View>
      <Text style={[styles.collectionsFooterHint, { color: mutedTextColor }]}>
        Tap a collection to browse categories and hadiths
      </Text>
    </View>
  );

  // Render Collections Grid (3 columns for 9 items = balanced 3x3 grid)
  const renderCollections = () => (
    <FlatList
      data={hadithCollections}
      numColumns={3}
      contentContainerStyle={styles.collectionsGrid}
      ListFooterComponent={renderCollectionsFooter}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          style={styles.collectionCard}
          onPress={() => handleCollectionPress(item.collection)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={getCollectionColor(index)}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.collectionGradient}
          >
            <Text style={styles.collectionName} numberOfLines={2}>
              {item.collection}
            </Text>
            <Text style={styles.collectionBadgeText}>
              {item.subcategories.length} {item.subcategories.length === 1 ? 'Category' : 'Categories'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    />
  );

  // Render Categories List
  const renderCategories = () => {
    const collection = hadithCollections.find(c => c.collection === selectedCollection);
    if (!collection) return null;

    return (
      <ScrollView style={[styles.categoriesContainer, { backgroundColor: screenBackground }]}>
        {collection.subcategories.map((category, index) => {
          const hadithCount = getHadithsBySubcategory(selectedCollection, category.name).length;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.categoryCard, { 
                backgroundColor: cardBackground,
                borderColor: isDarkMode ? '#223248' : '#E5E7EB'
              }]}
              onPress={() => handleCategoryPress(category.name)}
              activeOpacity={0.7}
            >
              <View style={styles.categoryLeft}>
                <View style={styles.categoryTextContainer}>
                  <Text style={[styles.categoryName, { color: primaryTextColor }]}>
                    {category.name}
                  </Text>
                  <Text style={[styles.categoryCount, { color: secondaryTextColor }]}>
                    {hadithCount} {hadithCount === 1 ? 'Hadith' : 'Hadiths'}
                  </Text>
                </View>
              </View>
              <IconSymbol 
                name="chevron.right" 
                size={20} 
                color={mutedTextColor} 
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  // Render Hadiths Viewer
  const renderHadiths = () => {
    if (isLoading) {
      return (
        <View style={[styles.loadingContainer, { backgroundColor: screenBackground }]}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: primaryTextColor }]}>
            Loading hadiths...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={[styles.emptyContainer, { backgroundColor: screenBackground }]}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={colors.tint} />
          <Text style={[styles.emptyText, { color: primaryTextColor }]}>
            {error}
          </Text>
        </View>
      );
    }

    const currentHadiths = getCurrentHadiths();
    if (currentHadiths.length === 0) {
      return (
        <View style={[styles.emptyContainer, { backgroundColor: screenBackground }]}>
          <Text style={[styles.emptyText, { color: primaryTextColor }]}>
            No hadiths available in this category
          </Text>
        </View>
      );
    }

    const currentHadith = currentHadiths[currentHadithIndex];
    const isBookmarked = bookmarkedHadiths.includes(currentHadith.id);

    return (
      <ScrollView style={[styles.hadithContainer, { backgroundColor: screenBackground }]}>
        <View style={[styles.hadithCard, { 
          backgroundColor: cardBackground,
          borderColor: isDarkMode ? '#223248' : '#E5E7EB'
        }]}>
          {/* Hadith Header */}
          <View style={styles.hadithHeader}>
            <View style={styles.hadithSourceBadge}>
              <Text style={styles.hadithSourceText}>
                {currentHadith.source}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => toggleBookmark(currentHadith.id)}
              style={styles.bookmarkButton}
            >
              <IconSymbol 
                name={isBookmarked ? "bookmark.fill" : "bookmark"} 
                size={24} 
                color={isBookmarked ? "#F59E0B" : primaryTextColor} 
              />
            </TouchableOpacity>
          </View>

          {/* Arabic Text */}
          {currentHadith.arabic && (
            <View style={[styles.arabicContainer, { backgroundColor: isDarkMode ? '#101c2b' : '#F8FAFC' }]}>
              <Text style={[styles.hadithArabic, { color: primaryTextColor }]}>
                {currentHadith.arabic}
              </Text>
            </View>
          )}

          {/* English Translation */}
          <View style={styles.translationContainer}>
            <Text style={[styles.hadithText, { color: primaryTextColor }]}>
              "{currentHadith.text}"
            </Text>
          </View>

          {/* Hadith Meta */}
          <View style={[styles.hadithMeta, { borderTopColor: isDarkMode ? '#223248' : '#E5E7EB' }]}>
            <View style={styles.metaRow}>
              <IconSymbol name="person.fill" size={16} color={mutedTextColor} />
              <Text style={[styles.narrator, { color: primaryTextColor }]}>
                {currentHadith.narrator}
              </Text>
            </View>
            {currentHadith.bookNumber && currentHadith.hadithNumber && (
              <View style={styles.metaRow}>
                <IconSymbol name="number" size={16} color={mutedTextColor} />
                <Text style={[styles.reference, { color: secondaryTextColor }]}>
                  Book {currentHadith.bookNumber}, Hadith {currentHadith.hadithNumber}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Navigation */}
        <View style={styles.hadithNavigation}>
          <TouchableOpacity
            style={[styles.navButton, { 
              backgroundColor: currentHadithIndex === 0 ? colors.border : colors.tint,
              opacity: currentHadithIndex === 0 ? 0.5 : 1
            }]}
            onPress={() => setCurrentHadithIndex(prev => Math.max(0, prev - 1))}
            disabled={currentHadithIndex === 0}
          >
            <IconSymbol name="chevron.left" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={styles.pageIndicatorContainer}>
            <Text style={[styles.pageIndicator, { color: primaryTextColor }]}>
              {currentHadithIndex + 1} / {currentHadiths.length}
            </Text>
            <Text style={[styles.pageIndicatorLabel, { color: secondaryTextColor }]}>
              Hadith
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.navButton, { 
              backgroundColor: currentHadithIndex === currentHadiths.length - 1 ? colors.border : colors.tint,
              opacity: currentHadithIndex === currentHadiths.length - 1 ? 0.5 : 1
            }]}
            onPress={() => setCurrentHadithIndex(prev => Math.min(currentHadiths.length - 1, prev + 1))}
            disabled={currentHadithIndex === currentHadiths.length - 1}
          >
            <IconSymbol name="chevron.right" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: screenBackground }]}>
      {/* Header */}
      {viewMode === 'collections' && (
        <View
          style={[styles.headerGradient, { backgroundColor: screenBackground, paddingTop: insets.top + 2 }]}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <IconSymbol name="chevron.left.circle.fill" size={42} color={isDarkMode ? '#FFFFFF' : '#1F2937'} />
            <Text style={[styles.backText, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>{getHeaderTitle()}</Text>
            <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#D9E3F5' : '#1F2937' }]}>{getHeaderSubtitle()}</Text>
          </View>
        </View>
      )}
      
      {viewMode !== 'collections' && (
        <View
          style={[styles.headerGradient, { backgroundColor: screenBackground, paddingTop: insets.top + 2 }]}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <IconSymbol name="chevron.left" size={24} color={isDarkMode ? '#FFFFFF' : '#1F2937'} />
            <Text style={[styles.backText, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#1F2937' }]}>{getHeaderTitle()}</Text>
            <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#D9E3F5' : '#1F2937' }]}>{getHeaderSubtitle()}</Text>
          </View>
        </View>
      )}

      {/* Content */}
      {viewMode === 'collections' && renderCollections()}
      {viewMode === 'categories' && renderCategories()}
      {viewMode === 'hadiths' && renderHadiths()}
    </View>
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
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 3,
  },
  headerTitleContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: Fonts.secondary,
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.12)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 20,
    opacity: 0.9,
    fontFamily: Fonts.primary,
    fontWeight: '700',
    letterSpacing: 1.0,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Collections Grid
  collectionsGrid: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  collectionsFooter: {
    marginTop: 24,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  collectionsFooterCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#c6ca53',
  },
  collectionsFooterQuote: {
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
  },
  collectionsFooterSource: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  collectionsFooterHint: {
    fontSize: 13,
  },
  collectionCard: {
    flex: 1,
    margin: 10,
    borderRadius: 16,
    overflow: 'hidden',
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
    maxWidth: (width - 24 - 60) / 3,
  },
  collectionGradient: {
    padding: 12,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  collectionName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: 0.4,
  },
  collectionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.2,
  },

  // Categories List
  categoriesContainer: {
    flex: 1,
    padding: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
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
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 13,
  },

  // Hadiths Viewer
  hadithContainer: {
    flex: 1,
    padding: 16,
  },
  hadithCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  hadithHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  hadithSourceBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  hadithSourceText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bookmarkButton: {
    padding: 4,
  },
  arabicContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  hadithArabic: {
    fontSize: 22,
    lineHeight: 38,
    textAlign: 'right',
    fontFamily: Fonts.primary,
  },
  translationContainer: {
    marginBottom: 16,
  },
  hadithText: {
    fontSize: 17,
    lineHeight: 28,
    fontStyle: 'italic',
  },
  hadithMeta: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  narrator: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  reference: {
    fontSize: 14,
    opacity: 0.7,
    marginLeft: 8,
  },
  hadithNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  pageIndicatorContainer: {
    alignItems: 'center',
  },
  pageIndicator: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pageIndicatorLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
});

