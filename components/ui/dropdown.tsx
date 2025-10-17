import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Dimensions, Platform, Pressable } from 'react-native';
import { IconSymbol } from './icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const scaleFactor = screenWidth / 375;

// Global state to track which dropdown is open
let openDropdownId: string | null = null;
const dropdownCallbacks: Map<string, () => void> = new Map();

interface DropdownItem {
  id: number;
  label: string;
  value: string;
}

interface DropdownProps {
  items: DropdownItem[];
  selectedItem: DropdownItem | null;
  onSelect: (item: DropdownItem) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function Dropdown({ 
  items, 
  selectedItem, 
  onSelect, 
  placeholder = "Select an option",
  disabled = false 
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownId = useRef(`dropdown_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`).current;
  const colorScheme = useColorScheme();
  const colors = Colors[((colorScheme ?? 'light' as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Register close callback
    dropdownCallbacks.set(dropdownId, () => {
      setIsOpen(false);
    });

    return () => {
      // Cleanup on unmount
      dropdownCallbacks.delete(dropdownId);
      if (openDropdownId === dropdownId) {
        openDropdownId = null;
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [dropdownId]);

  const handleOpen = useCallback(() => {
    if (disabled || isOpen) return;
    
    // Clear any pending close timeouts
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    
    // Use requestAnimationFrame for smoother opening
    requestAnimationFrame(() => {
      // Close any other open dropdown immediately
      if (openDropdownId && openDropdownId !== dropdownId) {
        const closeCallback = dropdownCallbacks.get(openDropdownId);
        if (closeCallback) {
          closeCallback();
        }
      }
      
      openDropdownId = dropdownId;
      setIsOpen(true);
    });
  }, [disabled, isOpen, dropdownId]);

  const handleClose = useCallback(() => {
    if (openDropdownId === dropdownId) {
      openDropdownId = null;
    }
    setIsOpen(false);
  }, [dropdownId]);

  const handleSelect = useCallback((item: DropdownItem) => {
    // Immediate selection feedback
    onSelect(item);
    
    // Delay close slightly to show selection
    closeTimeoutRef.current = setTimeout(() => {
      handleClose();
    }, 100);
  }, [onSelect, handleClose]);

  const renderItem = useCallback(({ item }: { item: DropdownItem }) => {
    const isSelected = selectedItem?.id === item.id;
    return (
      <Pressable
        style={({ pressed }) => [
          styles.dropdownItem,
          { 
            backgroundColor: isSelected 
              ? colors.tint 
              : pressed 
                ? colors.border + '40'
                : 'transparent'
          }
        ]}
        onPress={() => handleSelect(item)}
      >
        <Text style={[
          styles.itemText,
          { 
            color: isSelected ? colors.background : colors.text,
            fontFamily: Fonts.roboto
          }
        ]}>
          {item.label}
        </Text>
        {isSelected && (
          <IconSymbol name="checkmark" size={16} color={colors.background} />
        )}
      </Pressable>
    );
  }, [selectedItem, colors, handleSelect]);

  const keyExtractor = useCallback((item: DropdownItem) => item.id.toString(), []);

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.dropdownButton,
          { 
            backgroundColor: colors.background,
            borderColor: colors.border,
            opacity: disabled ? 0.6 : pressed ? 0.8 : 1
          }
        ]}
        onPress={handleOpen}
        disabled={disabled}
      >
        <Text style={[
          styles.selectedText,
          { 
            color: selectedItem ? colors.text : colors.icon,
            fontFamily: selectedItem ? Fonts.roboto : Fonts.secondary
          }
        ]}>
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <IconSymbol 
          name={isOpen ? "chevron.up" : "chevron.down"} 
          size={16} 
          color={colors.text} 
        />
      </Pressable>

      {isOpen && (
        <Modal
          visible={true}
          transparent
          animationType="none"
          onRequestClose={handleClose}
          statusBarTranslucent
          hardwareAccelerated
          presentationStyle="overFullScreen"
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={handleClose}
          >
            <Pressable 
              style={[
                styles.dropdownList,
                { 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  shadowColor: colors.text
                }
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                bounces={false}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={10}
                getItemLayout={(data, index) => ({
                  length: Math.max(56, 60 * scaleFactor),
                  offset: Math.max(56, 60 * scaleFactor) * index,
                  index,
                })}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Math.max(16, 18 * scaleFactor),
    paddingVertical: Math.max(12, 14 * scaleFactor),
    borderRadius: Math.max(8, 10 * scaleFactor),
    borderWidth: 1,
    minHeight: Math.max(48, 52 * scaleFactor),
  },
  selectedText: {
    fontSize: Math.max(16, 18 * scaleFactor),
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownList: {
    maxHeight: Math.max(300, 350 * scaleFactor),
    width: '100%',
    maxWidth: 500,
    borderRadius: Math.max(8, 10 * scaleFactor),
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  scrollView: {
    maxHeight: Math.max(300, 350 * scaleFactor),
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Math.max(16, 18 * scaleFactor),
    paddingVertical: Math.max(12, 14 * scaleFactor),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  itemText: {
    fontSize: Math.max(16, 18 * scaleFactor),
    flex: 1,
  },
});
