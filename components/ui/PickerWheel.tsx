import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface PickerItem {
  id: string;
  label: string;
  value: string;
  fontFamily?: string;
  description?: string;
}

interface PickerWheelProps {
  items: PickerItem[];
  selectedItem: PickerItem | null;
  onSelect: (item: PickerItem) => void;
  placeholder?: string;
  disabled?: boolean;
  showFontPreview?: boolean;
}

export default function PickerWheel({ 
  items, 
  selectedItem, 
  onSelect, 
  placeholder = "Select an option",
  disabled = false,
  showFontPreview = false
}: PickerWheelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[((colorScheme ?? 'light' as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];

  const handleSelect = (item: PickerItem) => {
    onSelect(item);
    setIsOpen(false);
  };


  const renderItem = (item: PickerItem, index: number) => {
    const isSelected = selectedItem?.id === item.id;
    
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.listItem,
          {
            backgroundColor: isSelected ? colors.tint + '20' : colors.background,
            borderColor: isSelected ? colors.tint : colors.border,
          }
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.itemContent}>
          {showFontPreview && item.fontFamily ? (
            <View style={styles.fontPreview}>
              <Text style={[
                styles.previewText,
                {
                  fontFamily: item.fontFamily,
                  color: isSelected ? colors.tint : colors.text,
                }
              ]}>
                بِسْمِ اللَّهِ
              </Text>
              <View style={styles.itemInfo}>
                <Text style={[
                  styles.itemLabel,
                  {
                    color: isSelected ? colors.tint : colors.text,
                    fontWeight: isSelected ? '700' : '500',
                  }
                ]}>
                  {item.label}
                </Text>
                <Text style={[
                  styles.itemDescription,
                  { color: colors.text }
                ]}>
                  {item.description}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.itemInfo}>
              <Text style={[
                styles.itemLabel,
                {
                  color: isSelected ? colors.tint : colors.text,
                  fontWeight: isSelected ? '700' : '500',
                }
              ]}>
                {item.label}
              </Text>
              <Text style={[
                styles.itemDescription,
                { color: colors.text }
              ]}>
                {item.description}
              </Text>
            </View>
          )}
          
          {isSelected && (
            <View style={[
              styles.selectedIndicator,
              { backgroundColor: colors.tint }
            ]}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };


  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.triggerButton,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            opacity: disabled ? 0.6 : 1
          }
        ]}
        onPress={() => !disabled && setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        <View style={styles.triggerContent}>
          {showFontPreview && selectedItem?.fontFamily ? (
            <View style={styles.triggerFontPreview}>
              <Text style={[
                styles.triggerFontText,
                {
                  fontFamily: selectedItem.fontFamily,
                  color: colors.tint,
                }
              ]}>
                بِسْمِ اللَّهِ
              </Text>
              <Text style={[styles.triggerLabel, { color: colors.text }]}>
                {selectedItem?.label || placeholder}
              </Text>
            </View>
          ) : (
            <Text style={[styles.triggerLabel, { color: colors.text }]}>
              {selectedItem?.label || placeholder}
            </Text>
          )}
        </View>
        <Text style={[styles.arrowText, { color: colors.text }]}>
          {isOpen ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={[
          styles.dropdown,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          }
        ]}>
          {items.map((item, index) => renderItem(item, index))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
  },
  triggerContent: {
    flex: 1,
  },
  triggerLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  triggerFontPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  triggerFontText: {
    fontSize: 18,
    textAlign: 'right',
    direction: 'rtl',
  },
  arrowText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
    zIndex: 1000,
    maxHeight: 300,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemLabel: {
    fontSize: 16,
    flex: 1,
  },
  fontPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  previewText: {
    fontSize: 16,
    textAlign: 'right',
    direction: 'rtl',
  },
  itemInfo: {
    flex: 1,
  },
  itemDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
    lineHeight: 16,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
