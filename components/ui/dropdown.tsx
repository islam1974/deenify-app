import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Dimensions, Platform, Pressable, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { IconSymbol } from './icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

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
  leftIcon?: React.ReactNode;
  buttonStyle?: StyleProp<ViewStyle>;
  triggerTextColor?: string;
  triggerPlaceholderColor?: string;
  triggerChevronColor?: string;
  /** Optional: override list/modal colors to match parent (e.g. Quran paper theme) */
  listBackgroundColor?: string;
  listBorderColor?: string;
  itemTextColor?: string;
  itemSelectedBackgroundColor?: string;
  itemSelectedTextColor?: string;
  itemBorderColor?: string;
}

export default function Dropdown({ 
  items, 
  selectedItem, 
  onSelect, 
  placeholder = "Select an option",
  disabled = false,
  leftIcon,
  buttonStyle,
  triggerTextColor,
  triggerPlaceholderColor,
  triggerChevronColor,
  listBackgroundColor,
  listBorderColor,
  itemTextColor,
  itemSelectedBackgroundColor,
  itemSelectedTextColor,
  itemBorderColor,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownId = useRef(`dropdown_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`).current;
  const colorScheme = useColorScheme();
  const colors = Colors[((colorScheme ?? 'light' as 'light' | 'dark') ?? 'light' as 'light' | 'dark') ?? 'light'];
  
  // Use reactive dimensions for orientation changes
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isLandscape = screenWidth > screenHeight;
  const scaleFactor = Math.min(screenWidth, screenHeight) / 375;

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
    };
  }, [dropdownId]);

  const handleOpen = useCallback(() => {
    if (disabled || isOpen) return;
    
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
    // Close first for instant visual feedback
    handleClose();
    
    // Then trigger selection callback
    // Using setTimeout 0 to let the modal close animation start first
    setTimeout(() => {
      onSelect(item);
    }, 0);
  }, [onSelect, handleClose]);

  const renderItem = useCallback(({ item }: { item: DropdownItem }) => {
    const isSelected = selectedItem?.id === item.id;
    return (
      <Pressable
        style={({ pressed }) => [
          styles.dropdownItem,
          { 
            backgroundColor: isSelected 
              ? (itemSelectedBackgroundColor ?? colors.tint) 
              : pressed ? (colors.border + '40') : 'transparent',
            paddingVertical: isLandscape ? 10 : Math.max(12, 14 * scaleFactor),
            borderBottomColor: itemBorderColor ?? 'rgba(0, 0, 0, 0.1)',
          }
        ]}
        onPress={() => handleSelect(item)}
      >
        <Text style={[
          styles.itemText,
          { 
            color: isSelected ? (itemSelectedTextColor ?? colors.background) : (itemTextColor ?? colors.text),
            fontFamily: Fonts.roboto,
            fontSize: isLandscape ? 15 : Math.max(16, 18 * scaleFactor),
          }
        ]}>
          {item.label}
        </Text>
        {isSelected && (
          <IconSymbol name="checkmark" size={16} color={itemSelectedTextColor ?? colors.background} />
        )}
      </Pressable>
    );
  }, [selectedItem, colors, handleSelect, isLandscape, scaleFactor, itemTextColor, itemSelectedBackgroundColor, itemSelectedTextColor, itemBorderColor]);

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
          },
          buttonStyle
        ]}
        onPress={handleOpen}
        disabled={disabled}
      >
        {leftIcon ? <View style={styles.dropdownLeftIcon}>{leftIcon}</View> : null}
        <Text style={[
          styles.selectedText,
          { 
            color: selectedItem 
              ? (triggerTextColor ?? colors.text) 
              : (triggerPlaceholderColor ?? colors.icon),
            fontFamily: selectedItem ? Fonts.roboto : Fonts.secondary
          }
        ]}>
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <IconSymbol 
          name={isOpen ? "chevron.up" : "chevron.down"} 
          size={16} 
          color={triggerChevronColor ?? triggerTextColor ?? colors.text} 
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
          supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
        >
          <Pressable
            style={[
              styles.modalOverlay,
              isLandscape && { paddingHorizontal: 40 }
            ]}
            onPress={handleClose}
          >
            <Pressable 
              style={[
                styles.dropdownList,
                { 
                  backgroundColor: listBackgroundColor ?? colors.background,
                  borderColor: listBorderColor ?? colors.border,
                  shadowColor: colors.text,
                  maxHeight: isLandscape ? screenHeight * 0.7 : Math.max(300, 350 * scaleFactor),
                  maxWidth: isLandscape ? screenWidth * 0.7 : 500,
                }
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                style={{ maxHeight: isLandscape ? screenHeight * 0.65 : Math.max(300, 350 * scaleFactor) }}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                bounces={false}
                removeClippedSubviews={true}
                maxToRenderPerBatch={20}
                windowSize={10}
                initialNumToRender={20}
                updateCellsBatchingPeriod={30}
                getItemLayout={(data, index) => ({
                  length: isLandscape ? 48 : Math.max(56, 60 * scaleFactor),
                  offset: (isLandscape ? 48 : Math.max(56, 60 * scaleFactor)) * index,
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
    borderWidth: 1,
    minHeight: 48,
  },
  dropdownLeftIcon: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 998,
    elevation: 998,
  },
  dropdownList: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 999,
    zIndex: 999,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  itemText: {
    flex: 1,
  },
});
