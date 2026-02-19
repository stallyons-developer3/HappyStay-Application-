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

const categoryOptions = [
  { id: 'all', name: 'All' },
  { id: 'nature_active', name: 'Nature & Active' },
  { id: 'sightseeing', name: 'Sightseeing' },
  { id: 'party', name: 'Party' },
  { id: 'event', name: 'Events' },
  { id: 'food_drink', name: 'Food & Drink' },
  { id: 'transport', name: 'Transport' },
];

const priceOptions = [
  { id: 'all', name: 'All', min: null, max: null },
  { id: 'free', name: 'Free', min: 0, max: 0 },
  { id: '1-20', name: '$1 - $20', min: 1, max: 20 },
  { id: '21-50', name: '$21 - $50', min: 21, max: 50 },
  { id: '51-100', name: '$51 - $100', min: 51, max: 100 },
  { id: '100+', name: '$100+', min: 100, max: null },
];

const activitySortOptions = [
  { id: 'recommended', name: 'Recommended', value: '' },
  { id: 'newest', name: 'Newest', value: 'newest' },
  { id: 'price_asc', name: 'Price: Low to High', value: 'price_asc' },
  { id: 'price_desc', name: 'Price: High to Low', value: 'price_desc' },
  { id: 'popular', name: 'Most Popular', value: 'popular' },
];

const hangoutSortOptions = [
  { id: 'recommended', name: 'Recommended', value: '' },
  { id: 'newest', name: 'Newest', value: 'newest' },
  { id: 'popular', name: 'Most Popular', value: 'popular' },
];

const FilterModal = ({ visible, onClose, onApply, type = 'activities' }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedSort, setSelectedSort] = useState('recommended');

  const sortOptions =
    type === 'hangouts' ? hangoutSortOptions : activitySortOptions;
  const showPrice = type === 'activities';

  const handleReset = () => {
    setSelectedCategory('all');
    setSelectedPrice('all');
    setSelectedSort('recommended');
  };

  const handleApply = () => {
    const params = {};

    if (selectedCategory !== 'all') {
      params.typology = selectedCategory;
    }

    if (showPrice && selectedPrice !== 'all') {
      const priceOpt = priceOptions.find(p => p.id === selectedPrice);
      if (priceOpt) {
        if (priceOpt.id === 'free') {
          params.price_min = 0;
          params.price_max = 0;
        } else {
          if (priceOpt.min !== null) params.price_min = priceOpt.min;
          if (priceOpt.max !== null) params.price_max = priceOpt.max;
        }
      }
    }

    const sortOpt = sortOptions.find(s => s.id === selectedSort);
    if (sortOpt && sortOpt.value) {
      params.sort = sortOpt.value;
    }

    onApply(params);
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

            {showPrice && (
              <>
                <Text style={styles.sectionTitle}>Price Range</Text>
                <View style={styles.optionsContainer}>
                  {priceOptions.map(option => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionChip,
                        selectedPrice === option.id &&
                          styles.optionChipSelected,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => setSelectedPrice(option.id)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selectedPrice === option.id &&
                            styles.optionTextSelected,
                        ]}
                      >
                        {option.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* <Text style={styles.sectionTitle}>Sort By</Text>
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
            </View> */}
          </ScrollView>

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
    width: 80,
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
    width: 80,
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
});

export default FilterModal;
