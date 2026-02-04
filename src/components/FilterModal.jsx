import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Colors, Fonts } from '../constants/Constants';
import Button from './common/Button';

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
  // Arrays for multiple selection
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [selectedSort, setSelectedSort] = useState('1');

  // Toggle Category - Multiple Selection
  const toggleCategory = id => {
    if (selectedCategories.includes(id)) {
      // Already selected - remove it
      setSelectedCategories(selectedCategories.filter(item => item !== id));
    } else {
      // Not selected - add it
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  // Toggle Price - Multiple Selection
  const togglePrice = id => {
    if (selectedPrices.includes(id)) {
      // Already selected - remove it
      setSelectedPrices(selectedPrices.filter(item => item !== id));
    } else {
      // Not selected - add it
      setSelectedPrices([...selectedPrices, id]);
    }
  };

  // Handle Reset
  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedPrices([]);
    setSelectedSort('1');
  };

  // Handle Apply
  const handleApply = () => {
    const filters = {
      categories: selectedCategories.map(id =>
        categoryOptions.find(c => c.id === id),
      ),
      prices: selectedPrices.map(id => priceOptions.find(p => p.id === id)),
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
            <View style={styles.closeButton}>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>Filter</Text>

            <View style={styles.resetButton}>
              <TouchableOpacity onPress={handleReset}>
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Category Section - Multiple Selection */}
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.optionsContainer}>
              {categoryOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionChip,
                    selectedCategories.includes(option.id) &&
                      styles.optionChipSelected,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => toggleCategory(option.id)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedCategories.includes(option.id) &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Price Range Section - Multiple Selection */}
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.optionsContainer}>
              {priceOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionChip,
                    selectedPrices.includes(option.id) &&
                      styles.optionChipSelected,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => togglePrice(option.id)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedPrices.includes(option.id) &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort By Section - Single Selection (Radio) */}
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
            <Button title="Apply Filters" onPress={handleApply} size="full" />
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  closeButton: {
    width: 80, // Fixed width
    alignItems: 'flex-start',
  },
  closeText: {
    fontSize: 24,
    color: Colors.textBlack,
  },
  modalTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 18,
    color: Colors.primary,
  },
  resetButton: {
    width: 80, // Same fixed width as close
    alignItems: 'flex-end',
  },
  resetText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 14,
    color: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    textTransform: 'lowercase',
  },
  closeText: {
    fontSize: 24,
    color: Colors.textBlack,
  },
  scrollView: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  sectionTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 16,
    color: Colors.textBlack,
    marginBottom: 16,
    marginTop: 8,
  },
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
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.textDark,
  },
  optionTextSelected: {
    color: Colors.white,
  },
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
    fontFamily: Fonts.RobotoRegular,
    fontSize: 15,
    color: Colors.textDark,
  },
  sortTextSelected: {
    fontFamily: Fonts.RobotoBold,
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
    borderRadius: 50,
    alignItems: 'center',
  },
  applyButtonText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 20,
    color: Colors.white,
  },
});

export default FilterModal;
