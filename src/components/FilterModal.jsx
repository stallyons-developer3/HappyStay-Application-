import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Colors, Fonts } from '../constants/Constants';

// Filter Options
const categoryOptions = [
  { id: '1', name: 'All' },
  { id: '2', name: 'Nature & Active' },
  { id: '3', name: 'Sightseeing' },
  { id: '4', name: 'Party' },
  { id: '5', name: 'Events' },
  { id: '6', name: 'Food & Drink' },
];

const priceOptions = [
  { id: '1', name: 'All', value: 'all' },
  { id: '2', name: 'Free', value: 'free' },
  { id: '3', name: '$1 - $20', value: '1-20' },
  { id: '4', name: '$21 - $50', value: '21-50' },
  { id: '5', name: '$51 - $100', value: '51-100' },
  { id: '6', name: '$100+', value: '100+' },
];

const sortOptions = [
  { id: '1', name: 'Recommended', value: 'recommended' },
  { id: '2', name: 'Newest', value: 'newest' },
  { id: '3', name: 'Price: Low to High', value: 'price_asc' },
  { id: '4', name: 'Price: High to Low', value: 'price_desc' },
  { id: '5', name: 'Most Popular', value: 'popular' },
];

const FilterModal = ({ visible, onClose, onApply }) => {
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [selectedPrice, setSelectedPrice] = useState('1');
  const [selectedSort, setSelectedSort] = useState('1');

  // Handle Reset
  const handleReset = () => {
    setSelectedCategory('1');
    setSelectedPrice('1');
    setSelectedSort('1');
  };

  // Handle Apply
  const handleApply = () => {
    const filters = {
      category: categoryOptions.find(c => c.id === selectedCategory),
      price: priceOptions.find(p => p.id === selectedPrice),
      sort: sortOptions.find(s => s.id === selectedSort),
    };
    onApply(filters);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filter</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Category Section */}
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.optionsContainer}>
              {categoryOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionChip,
                    selectedCategory === option.id && styles.optionChipSelected,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setSelectedCategory(option.id)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedCategory === option.id &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Price Range Section */}
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.optionsContainer}>
              {priceOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionChip,
                    selectedPrice === option.id && styles.optionChipSelected,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setSelectedPrice(option.id)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedPrice === option.id && styles.optionTextSelected,
                    ]}
                  >
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort By Section */}
            <Text style={styles.sectionTitle}>Sort By</Text>
            <View style={styles.sortContainer}>
              {sortOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.sortOption}
                  activeOpacity={0.7}
                  onPress={() => setSelectedSort(option.id)}
                >
                  <Text
                    style={[
                      styles.sortText,
                      selectedSort === option.id && styles.sortTextSelected,
                    ]}
                  >
                    {option.name}
                  </Text>
                  <View
                    style={[
                      styles.radioOuter,
                      selectedSort === option.id && styles.radioOuterSelected,
                    ]}
                  >
                    {selectedSort === option.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.applyButton}
              activeOpacity={0.8}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '85%',
  },

  // Header
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  closeIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.textBlack,
  },
  modalTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 18,
    color: Colors.primary,
  },
  resetText: {
    fontFamily: Fonts.kantumruyMedium,
    fontSize: 14,
    color: Colors.primary,
  },

  // Scroll View
  scrollView: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  // Section Title
  sectionTitle: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 16,
    color: Colors.textBlack,
    marginBottom: 16,
    marginTop: 8,
  },

  // Options Container (Chips)
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  optionChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: Colors.backgroundGray,
    marginRight: 10,
    marginBottom: 10,
  },
  optionChipSelected: {
    backgroundColor: Colors.primary,
  },
  optionText: {
    fontFamily: Fonts.kantumruyMedium,
    fontSize: 14,
    color: Colors.textDark,
  },
  optionTextSelected: {
    color: Colors.white,
  },

  // Sort Container (Radio Buttons)
  sortContainer: {
    marginBottom: 20,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sortText: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 15,
    color: Colors.textDark,
  },
  sortTextSelected: {
    fontFamily: Fonts.kantumruyMedium,
    color: Colors.primary,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.textLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },

  // Button Container
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  applyButtonText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 16,
    color: Colors.white,
  },
  closeText: {
    fontSize: 24,
    color: Colors.textBlack,
  },
});

export default FilterModal;
