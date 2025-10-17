import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { duas, duaCategories, getDuasByCategory, getDuasBySubcategory } from '@/data/duasData';

export default function DuasScreen() {
  const { theme } = useTheme();
  const colors = Colors[((theme as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const [expandedDuas, setExpandedDuas] = useState<Set<number>>(new Set());

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubcategory = (key: string) => {
    const newExpanded = new Set(expandedSubcategories);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSubcategories(newExpanded);
  };

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
      'Daily Duas': 'sunrise',
      'Worship (ʿIbādah)': 'hands.sparkles',
      'Travel Duas': 'airplane',
      'Health & Protection': 'heart.fill',
      'Forgiveness & Repentance': 'heart.text.square',
      'Rizq (Sustenance)': 'leaf.fill',
      'Family & Relationships': 'person.2.fill',
      'Special Situations': 'exclamationmark.triangle.fill',
      'Travel & Safety': 'shield.fill',
      'Death & Afterlife': 'moon.stars.fill',
      'General Goodness': 'star.fill'
    };
    return iconMap[category] || 'book.fill';
  };

  const renderDuaCard = (dua: any, index: number) => (
    <TouchableOpacity
      key={`dua-${dua.id}-${index}`}
      style={[styles.duaCard, { 
        backgroundColor: theme === 'dark' ? '#1C2938' : '#FFFFFF',
        borderColor: expandedDuas.has(dua.id) ? '#4A90E2' : (theme === 'dark' ? '#2D3B4E' : '#E5E7EB'),
        borderLeftColor: expandedDuas.has(dua.id) ? '#4A90E2' : (theme === 'dark' ? '#2D3B4E' : '#E5E7EB'),
        borderLeftWidth: expandedDuas.has(dua.id) ? 4 : 1,
      }]}
      onPress={() => toggleDua(dua.id)}
      activeOpacity={0.7}
    >
      <View style={styles.duaHeader}>
        <View style={styles.duaTitleContainer}>
          <Text style={[styles.duaTitle, { color: colors.text }]}>{dua.title}</Text>
          {dua.times && (
            <Text style={[styles.duaTimes, { color: colors.icon }]}>
              {dua.times}
            </Text>
          )}
        </View>
        <IconSymbol
          name={expandedDuas.has(dua.id) ? 'chevron.up.circle.fill' : 'chevron.down.circle'}
          size={24}
          color={expandedDuas.has(dua.id) ? '#4A90E2' : colors.icon}
        />
      </View>
      
      {expandedDuas.has(dua.id) && (
        <View style={styles.duaContent}>
          <View style={[styles.duaSection, { 
            backgroundColor: theme === 'dark' ? '#0F1821' : '#F8FAFC'
          }]}>
            <Text style={[styles.duaArabic, { color: colors.text }]}>
              {dua.arabic}
            </Text>
          </View>
          <View style={[styles.duaSection, {
            backgroundColor: theme === 'dark' ? 'rgba(74, 144, 226, 0.1)' : 'rgba(74, 144, 226, 0.05)'
          }]}>
            <Text style={[styles.sectionLabel, { color: colors.icon }]}>Transliteration</Text>
            <Text style={[styles.duaTransliteration, { color: colors.text }]}>
              {dua.transliteration}
            </Text>
          </View>
          <View style={[styles.duaSection, {
            backgroundColor: theme === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)'
          }]}>
            <Text style={[styles.sectionLabel, { color: colors.icon }]}>Translation</Text>
            <Text style={[styles.duaTranslation, { color: colors.text }]}>
              {dua.translation}
            </Text>
          </View>
          {dua.reference && (
            <View style={[styles.referenceContainer, { 
              backgroundColor: theme === 'dark' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.05)',
              borderWidth: 1,
              borderColor: theme === 'dark' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.1)'
            }]}>
              <IconSymbol name="book.closed" size={14} color={colors.icon} />
              <Text style={[styles.duaReference, { color: colors.icon }]}>
                {dua.reference}
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderCategorizedView = () => (
    <>
      {duaCategories.map((categoryData, catIndex) => {
        const categoryDuas = getDuasByCategory(categoryData.category);
        if (categoryDuas.length === 0) return null;
        
        const isExpanded = expandedCategories.has(categoryData.category);
        
        return (
          <View key={`category-${catIndex}`} style={styles.categoryContainer}>
            <TouchableOpacity
              style={[styles.categoryHeader, { 
                backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF',
                borderColor: theme === 'dark' ? '#334155' : '#E5E7EB',
              }]}
              onPress={() => toggleCategory(categoryData.category)}
              activeOpacity={0.7}
            >
              <View style={styles.categoryTitleContainer}>
                <View style={[styles.iconContainer, { 
                  backgroundColor: isExpanded ? '#4A90E2' : (theme === 'dark' ? 'rgba(74, 144, 226, 0.15)' : 'rgba(74, 144, 226, 0.1)')
                }]}>
                  <IconSymbol 
                    name={getCategoryIcon(categoryData.category)} 
                    size={20} 
                    color={isExpanded ? '#FFFFFF' : '#4A90E2'} 
                  />
                </View>
                <View style={styles.categoryTextContainer}>
                  <Text style={[styles.categoryTitle, { color: colors.text }]}>
                    {categoryData.category}
                  </Text>
                  <Text style={[styles.categoryCount, { color: colors.icon }]}>
                    {categoryDuas.length} {categoryDuas.length === 1 ? 'dua' : 'duas'}
                  </Text>
                </View>
              </View>
              <IconSymbol
                name={isExpanded ? 'chevron.up' : 'chevron.down'}
                size={22}
                color={colors.icon}
              />
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.subcategoriesContainer}>
                {categoryData.subcategories.map((subcategory, subIndex) => {
                  const subcategoryDuas = getDuasBySubcategory(categoryData.category, subcategory.name);
                  if (subcategoryDuas.length === 0) return null;
                  
                  const subcategoryKey = `${categoryData.category}-${subcategory.name}`;
                  const isSubExpanded = expandedSubcategories.has(subcategoryKey);
                  
                  return (
                    <View key={`subcat-${subIndex}`} style={styles.subcategoryContainer}>
                      <TouchableOpacity
                        style={[styles.subcategoryHeader, { 
                          backgroundColor: theme === 'dark' ? '#1C2938' : '#F9FAFB',
                          borderColor: theme === 'dark' ? '#2D3B4E' : '#E5E7EB',
                        }]}
                        onPress={() => toggleSubcategory(subcategoryKey)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.subcategoryTitleContainer}>
                          <View style={styles.subcategoryDot} />
                          <Text style={[styles.subcategoryTitle, { color: colors.text }]}>
                            {subcategory.name}
                          </Text>
                          <Text style={[styles.subcategoryCount, { color: colors.icon }]}>
                            ({subcategoryDuas.length})
                          </Text>
                        </View>
                        <IconSymbol
                          name={isSubExpanded ? 'chevron.up' : 'chevron.down'}
                          size={18}
                          color={colors.icon}
                        />
                      </TouchableOpacity>

                      {isSubExpanded && (
                        <View style={styles.duasContainer}>
                          {subcategoryDuas.map((dua, duaIndex) => renderDuaCard(dua, duaIndex))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </>
  );

  return (
    <View style={[styles.container, { 
      backgroundColor: theme === 'dark' ? '#0F1821' : '#F3F4F6'
    }]}>
      {/* Header */}
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
          <IconSymbol name="chevron.left" size={20} color="#2C3E50" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Daily Duas</Text>
          <Text style={styles.headerSubtitle}>الأدعية اليومية</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderCategorizedView()}
      </ScrollView>
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
    marginBottom: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#34495E',
    opacity: 0.8,
    fontFamily: Fonts.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 3,
  },
  categoryCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  subcategoriesContainer: {
    marginTop: 12,
    marginLeft: 12,
    gap: 10,
  },
  subcategoryContainer: {
    marginBottom: 8,
  },
  subcategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    paddingLeft: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: '#4A90E2',
  },
  subcategoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  subcategoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
  },
  subcategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  subcategoryCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  duasContainer: {
    marginTop: 10,
    marginLeft: 12,
    gap: 10,
  },
  duaCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  duaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  duaTitleContainer: {
    flex: 1,
  },
  duaTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  duaTimes: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 2,
  },
  duaContent: {
    marginTop: 16,
    gap: 14,
  },
  duaSection: {
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  duaArabic: {
    fontSize: 22,
    lineHeight: 38,
    textAlign: 'right',
    fontFamily: Fonts.primary,
    letterSpacing: 0.5,
  },
  duaTransliteration: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  duaTranslation: {
    fontSize: 16,
    lineHeight: 26,
  },
  referenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  duaReference: {
    fontSize: 13,
    fontWeight: '500',
    fontStyle: 'italic',
  },
});

