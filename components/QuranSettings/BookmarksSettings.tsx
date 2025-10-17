import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useQuranSettings } from '@/contexts/QuranSettingsContext';

// Mock bookmarks data - in a real app, this would come from your Quran service
const mockBookmarks = [
  {
    id: '1:1',
    chapterName: 'Al-Fatihah',
    verseNumber: 1,
    text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
    dateAdded: '2024-01-15',
  },
  {
    id: '2:255',
    chapterName: 'Al-Baqarah',
    verseNumber: 255,
    text: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
    translation: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence.',
    dateAdded: '2024-01-14',
  },
  {
    id: '112:1',
    chapterName: 'Al-Ikhlas',
    verseNumber: 1,
    text: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
    translation: 'Say, "He is Allah, [who is] One,',
    dateAdded: '2024-01-13',
  },
];

export default function BookmarksSettings() {
  const colorScheme = useColorScheme();
  const colors = Colors[((colorScheme ?? 'light' as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const { bookmarks, removeBookmark } = useQuranSettings();
  const [displayBookmarks] = useState(mockBookmarks); // Using mock data for demo

  const handleRemoveBookmark = (bookmarkId: string) => {
    Alert.alert(
      'Remove Bookmark',
      'Are you sure you want to remove this bookmark?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            removeBookmark(bookmarkId);
            Alert.alert('Bookmark Removed', 'The bookmark has been removed successfully.');
          }
        }
      ]
    );
  };

  const handleClearAllBookmarks = () => {
    Alert.alert(
      'Clear All Bookmarks',
      'Are you sure you want to remove all bookmarks? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => {
            // In a real implementation, you would clear all bookmarks
            Alert.alert('Bookmarks Cleared', 'All bookmarks have been removed successfully.');
          }
        }
      ]
    );
  };

  const renderBookmarkItem = ({ item }: { item: any }) => (
    <View style={[styles.bookmarkItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={styles.bookmarkHeader}>
        <View style={[styles.chapterBadge, { backgroundColor: colors.tint }]}>
          <Text style={[styles.chapterText, { color: colors.background }]}>
            {item.chapterName}
          </Text>
        </View>
        <Text style={[styles.verseNumber, { color: colors.text }]}>
          Verse {item.verseNumber}
        </Text>
      </View>
      
      <Text style={[styles.arabicText, { color: colors.text }]}>
        {item.text}
      </Text>
      
      <Text style={[styles.translationText, { color: colors.text }]}>
        {item.translation}
      </Text>
      
      <View style={styles.bookmarkFooter}>
        <Text style={[styles.dateText, { color: colors.text }]}>
          Added {item.dateAdded}
        </Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveBookmark(item.id)}
          activeOpacity={0.7}
        >
          <IconSymbol name="trash" size={16} color="#ff4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Bookmarks
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Manage your saved verses
        </Text>
      </View>

      {displayBookmarks.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="bookmark" size={64} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Bookmarks Yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.text }]}>
            Bookmark verses while reading the Quran to easily find them later.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.tint + '20', borderColor: colors.tint }]}>
              <Text style={[styles.statNumber, { color: colors.tint }]}>
                {displayBookmarks.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>
                Total Bookmarks
              </Text>
            </View>
          </View>

          <View style={styles.bookmarksList}>
            <FlatList
              data={displayBookmarks}
              renderItem={renderBookmarkItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            />
          </View>

          {displayBookmarks.length > 0 && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.clearAllButton, { backgroundColor: '#ff4444' }]}
                onPress={handleClearAllBookmarks}
                activeOpacity={0.7}
              >
                <IconSymbol name="trash" size={16} color="#ffffff" />
                <Text style={styles.clearAllText}>Clear All Bookmarks</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 24,
  },
  statsContainer: {
    padding: 20,
  },
  statCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 16,
    opacity: 0.8,
  },
  bookmarksList: {
    padding: 20,
    paddingTop: 0,
  },
  bookmarkItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  bookmarkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chapterBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  chapterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  verseNumber: {
    fontSize: 14,
    opacity: 0.7,
  },
  arabicText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 8,
    lineHeight: 28,
  },
  translationText: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
    lineHeight: 20,
  },
  bookmarkFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 12,
    opacity: 0.6,
  },
  removeButton: {
    padding: 8,
  },
  actionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  clearAllText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
