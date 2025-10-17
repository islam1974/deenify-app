import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import QuranReader from './QuranReader';

// Demo component showing how to use the QuranReader with different fonts
export default function QuranReaderDemo() {
  const sampleVerses = [
    {
      ayah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      verseNumber: 1,
      translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.'
    },
    {
      ayah: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      verseNumber: 2,
      translation: 'Praise be to Allah, Lord of the worlds.'
    },
    {
      ayah: 'الرَّحْمَٰنِ الرَّحِيمِ',
      verseNumber: 3,
      translation: 'The Entirely Merciful, the Especially Merciful.'
    }
  ];

  const handlePlay = (verseNumber: number) => {
    console.log(`Playing verse ${verseNumber}`);
    // Implement audio playback logic here
  };

  return (
    <ScrollView style={styles.container}>
      {sampleVerses.map((verse, index) => (
        <View key={index} style={styles.verseWrapper}>
          <QuranReader
            ayah={verse.ayah}
            verseNumber={verse.verseNumber}
            translation={verse.translation}
            onPlay={() => handlePlay(verse.verseNumber)}
            isPlaying={false}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  verseWrapper: {
    marginBottom: 20,
  },
});
