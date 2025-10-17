import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions, ActivityIndicator } from 'react-native';
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
  
  const [viewMode, setViewMode] = useState<ViewMode>('collections');
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentHadithIndex, setCurrentHadithIndex] = useState(0);
  const [bookmarkedHadiths, setBookmarkedHadiths] = useState<number[]>([]);
  const [fetchedHadiths, setFetchedHadiths] = useState<Hadith[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get collection color based on name
  const getCollectionColor = (index: number): string[] => {
    const colorPalette = [
      ['#667eea', '#764ba2'],
      ['#f093fb', '#f5576c'],
      ['#4facfe', '#00f2fe'],
      ['#43e97b', '#38f9d7'],
      ['#fa709a', '#fee140'],
      ['#30cfd0', '#330867'],
      ['#a8edea', '#fed6e3'],
      ['#ff9a9e', '#fecfef'],
      ['#ffecd2', '#fcb69f']
    ];
    return colorPalette[index % colorPalette.length];
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

  // Render Collections Grid
  const renderCollections = () => (
    <FlatList
      data={hadithCollections}
      numColumns={2}
      contentContainerStyle={styles.collectionsGrid}
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
            <View style={styles.collectionBadge}>
              <Text style={styles.collectionBadgeText}>
                {item.subcategories.length} Categories
              </Text>
            </View>
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
      <ScrollView style={styles.categoriesContainer}>
        {collection.subcategories.map((category, index) => {
          const hadithCount = getHadithsBySubcategory(selectedCollection, category.name).length;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.categoryCard, { 
                backgroundColor: '#000000',
                borderColor: '#1F2937'
              }]}
              onPress={() => handleCategoryPress(category.name)}
              activeOpacity={0.7}
            >
              <View style={styles.categoryLeft}>
                <View style={[styles.categoryIconCircle, { backgroundColor: colors.tint + '30' }]}>
                  <IconSymbol 
                    name="text.alignleft" 
                    size={24} 
                    color={colors.tint} 
                  />
                </View>
                <View style={styles.categoryTextContainer}>
                  <Text style={[styles.categoryName, { color: '#FFFFFF' }]}>
                    {category.name}
                  </Text>
                  <Text style={[styles.categoryCount, { color: '#D1D5DB' }]}>
                    {hadithCount} {hadithCount === 1 ? 'Hadith' : 'Hadiths'}
                  </Text>
                </View>
              </View>
              <IconSymbol 
                name="chevron.right" 
                size={20} 
                color="#9CA3AF" 
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: theme === 'dark' ? '#FFFFFF' : '#1F2937' }]}>
            Loading hadiths...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={colors.tint} />
          <Text style={[styles.emptyText, { color: theme === 'dark' ? '#FFFFFF' : '#1F2937' }]}>
            {error}
          </Text>
        </View>
      );
    }

    const currentHadiths = getCurrentHadiths();
    if (currentHadiths.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme === 'dark' ? '#FFFFFF' : '#1F2937' }]}>
            No hadiths available in this category
          </Text>
        </View>
      );
    }

    const currentHadith = currentHadiths[currentHadithIndex];
    const isBookmarked = bookmarkedHadiths.includes(currentHadith.id);

    return (
      <ScrollView style={styles.hadithContainer}>
        <View style={[styles.hadithCard, { 
          backgroundColor: colors.cardBackground,
          borderColor: colors.border 
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
                color={isBookmarked ? "#F59E0B" : colors.text} 
              />
            </TouchableOpacity>
          </View>

          {/* Arabic Text */}
          {currentHadith.arabic && (
            <View style={[styles.arabicContainer, { backgroundColor: theme === 'dark' ? '#374151' : '#F9FAFB' }]}>
              <Text style={[styles.hadithArabic, { color: theme === 'dark' ? '#FFFFFF' : '#1F2937' }]}>
                {currentHadith.arabic}
              </Text>
            </View>
          )}

          {/* English Translation */}
          <View style={styles.translationContainer}>
            <Text style={[styles.hadithText, { color: theme === 'dark' ? '#FFFFFF' : '#1F2937' }]}>
              "{currentHadith.text}"
            </Text>
          </View>

          {/* Hadith Meta */}
          <View style={[styles.hadithMeta, { borderTopColor: colors.border }]}>
            <View style={styles.metaRow}>
              <IconSymbol name="person.fill" size={16} color={theme === 'dark' ? '#D1D5DB' : '#6B7280'} />
              <Text style={[styles.narrator, { color: theme === 'dark' ? '#FFFFFF' : '#1F2937' }]}>
                {currentHadith.narrator}
              </Text>
            </View>
            {currentHadith.bookNumber && currentHadith.hadithNumber && (
              <View style={styles.metaRow}>
                <IconSymbol name="number" size={16} color={theme === 'dark' ? '#D1D5DB' : '#6B7280'} />
                <Text style={[styles.reference, { color: theme === 'dark' ? '#D1D5DB' : '#6B7280' }]}>
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
            <Text style={[styles.pageIndicator, { color: theme === 'dark' ? '#FFFFFF' : '#1F2937' }]}>
              {currentHadithIndex + 1} / {currentHadiths.length}
            </Text>
            <Text style={[styles.pageIndicatorLabel, { color: theme === 'dark' ? '#D1D5DB' : '#6B7280' }]}>
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#EBF4F5', '#B5C6E0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 2 }]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <IconSymbol name="chevron.left" size={20} color="#2C3E50" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
          <Text style={styles.headerSubtitle}>{getHeaderSubtitle()}</Text>
        </View>
      </LinearGradient>

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
    color: '#2C3E50',
    marginLeft: 3,
  },
  headerTitleContainer: {
    alignItems: 'center',
    marginTop: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#34495E',
    opacity: 0.9,
    fontFamily: Fonts.primary,
  },

  // Collections Grid
  collectionsGrid: {
    padding: 12,
  },
  collectionCard: {
    flex: 1,
    margin: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    maxWidth: (width - 48) / 2,
  },
  collectionGradient: {
    padding: 20,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  collectionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 26,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  collectionBadge: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  collectionBadgeText: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '600',
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    opacity: 0.6,
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
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
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

