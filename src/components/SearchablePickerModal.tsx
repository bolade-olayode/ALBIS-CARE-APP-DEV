// src/components/SearchablePickerModal.tsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  SectionList,
  ActivityIndicator,
  Keyboard,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface PickerItem {
  id: string | number;
  label: string;
  sublabel?: string;
  icon?: string;
  group?: string; // Used for grouping items into sections
  data?: any; // Original data object for additional info
}

interface Section {
  title: string;
  data: PickerItem[];
}

interface SearchablePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: PickerItem) => void;
  items: PickerItem[];
  title: string;
  placeholder?: string;
  selectedId?: string | number | null;
  loading?: boolean;
  emptyMessage?: string;
  accentColor?: string;
  groupByField?: 'sublabel' | 'group'; // Enable grouping by sublabel or group field
  sectionOrder?: string[]; // Custom order for sections (items not in list appear at end alphabetically)
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SearchablePickerModal({
  visible,
  onClose,
  onSelect,
  items,
  title,
  placeholder = 'Search...',
  selectedId,
  loading = false,
  emptyMessage = 'No items found',
  accentColor = '#2563eb',
  groupByField,
  sectionOrder,
}: SearchablePickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<PickerItem[]>(items);
  const searchInputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      // Animate modal in
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
      // Focus search input after animation
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    } else {
      // Reset when closing
      setSearchQuery('');
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible]);

  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(items);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = items.filter(
        (item) =>
          item.label.toLowerCase().includes(query) ||
          (item.sublabel && item.sublabel.toLowerCase().includes(query)) ||
          (item.group && item.group.toLowerCase().includes(query))
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, items]);

  // Group items into sections when groupByField is specified
  const sections = useMemo((): Section[] => {
    if (!groupByField) return [];

    const groupMap = new Map<string, PickerItem[]>();

    filteredItems.forEach(item => {
      const groupKey = groupByField === 'group'
        ? (item.group || 'Other')
        : (item.sublabel || 'Other');

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, []);
      }
      groupMap.get(groupKey)!.push(item);
    });

    // Sort sections - use custom order if provided, otherwise alphabetical
    return Array.from(groupMap.entries())
      .sort((a, b) => {
        if (sectionOrder) {
          const indexA = sectionOrder.indexOf(a[0]);
          const indexB = sectionOrder.indexOf(b[0]);
          // Items in sectionOrder come first, in specified order
          // Items not in sectionOrder go to end, sorted alphabetically
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
        }
        return a[0].localeCompare(b[0]);
      })
      .map(([title, data]) => ({ title, data }));
  }, [filteredItems, groupByField, sectionOrder]);

  const handleSelect = (item: PickerItem) => {
    Keyboard.dismiss();
    onSelect(item);
    handleClose();
  };

  const handleClose = () => {
    Keyboard.dismiss();
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const renderItem = ({ item }: { item: PickerItem }) => {
    const isSelected = selectedId !== null && selectedId !== undefined && item.id === selectedId;

    return (
      <TouchableOpacity
        style={[styles.itemContainer, isSelected && { backgroundColor: `${accentColor}10` }]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        {item.icon && (
          <View style={[styles.iconContainer, { backgroundColor: `${accentColor}15` }]}>
            <Text style={styles.iconText}>{item.icon}</Text>
          </View>
        )}
        <View style={styles.itemContent}>
          <Text style={[styles.itemLabel, isSelected && { color: accentColor, fontWeight: '600' }]}>
            {item.label}
          </Text>
          {item.sublabel && (
            <Text style={styles.itemSublabel} numberOfLines={1}>
              {item.sublabel}
            </Text>
          )}
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={22} color={accentColor} />
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={48} color="#cbd5e1" />
      <Text style={styles.emptyText}>{emptyMessage}</Text>
      {searchQuery.length > 0 && (
        <Text style={styles.emptySubtext}>Try a different search term</Text>
      )}
    </View>
  );

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View style={[styles.sectionHeader, { borderLeftColor: accentColor }]}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
      <Text style={styles.sectionCount}>{section.data.length}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={handleClose} activeOpacity={1} />

        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerHandle} />
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>{title}</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#94a3b8" style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder={placeholder}
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Results Count */}
          {!loading && filteredItems.length > 0 && (
            <Text style={styles.resultsCount}>
              {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'}
              {searchQuery.length > 0 && ` for "${searchQuery}"`}
            </Text>
          )}

          {/* List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={accentColor} />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : groupByField ? (
            <SectionList
              sections={sections}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderItem}
              renderSectionHeader={renderSectionHeader}
              ListEmptyComponent={renderEmpty}
              contentContainerStyle={[
                styles.listContent,
                sections.length === 0 && styles.listContentEmpty,
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              stickySectionHeadersEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
            />
          ) : (
            <FlatList
              data={filteredItems}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderItem}
              ListEmptyComponent={renderEmpty}
              contentContainerStyle={[
                styles.listContent,
                filteredItems.length === 0 && styles.listContentEmpty,
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.85,
    minHeight: SCREEN_HEIGHT * 0.5,
  },
  header: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  clearButton: {
    padding: 4,
  },
  resultsCount: {
    fontSize: 12,
    color: '#94a3b8',
    marginHorizontal: 20,
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconText: {
    fontSize: 20,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  itemSublabel: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 70,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sectionSeparator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
  },
});
