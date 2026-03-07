import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { Colors, Fonts } from '../constants/Constants';

const JoinActivityModal = ({
  visible,
  onClose,
  onConfirm,
  price,
  isPrivate,
  loading,
  maxGuests,
  joinedCount,
}) => {
  const [selectedSeats, setSelectedSeats] = useState(1);

  const remaining = maxGuests ? maxGuests - (joinedCount || 0) : 5;
  const maxSeats = Math.max(1, Math.min(5, remaining));

  const handleClose = () => {
    setSelectedSeats(1);
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(selectedSeats);
  };

  const numericPrice = price ? parseFloat(price) : 0;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select number of seats</Text>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
              <Text style={styles.modalClose}>&#x2715;</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.seatsRow}>
              <Text style={styles.seatsLabel}>Seats:</Text>
              <View style={styles.seatsSelector}>
                {Array.from({ length: maxSeats }, (_, i) => i + 1).map(num => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.seatOption,
                      selectedSeats === num && styles.seatOptionSelected,
                    ]}
                    onPress={() => setSelectedSeats(num)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.seatOptionText,
                        selectedSeats === num && styles.seatOptionTextSelected,
                      ]}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalPriceRow}>
              <Text style={styles.modalPriceLabel}>Price per person</Text>
              <Text style={styles.modalPriceValue}>
                {numericPrice > 0 ? `\u20AC${numericPrice.toFixed(2)}` : 'Free'}
              </Text>
            </View>

            <View style={styles.modalDivider} />

            <View style={styles.modalPriceRow}>
              <Text style={styles.modalTotalLabel}>Total</Text>
              <Text style={styles.modalTotalValue}>
                {numericPrice > 0
                  ? `\u20AC${(numericPrice * selectedSeats).toFixed(2)}`
                  : 'Free'}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.modalConfirmButton, loading && { opacity: 0.6 }]}
              activeOpacity={0.8}
              disabled={loading}
              onPress={handleConfirm}
            >
              <Text style={styles.modalConfirmText}>
                {loading
                  ? 'Sending...'
                  : isPrivate
                  ? 'Request to Join'
                  : 'Confirm & Join'}
              </Text>
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
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 18,
    color: Colors.primary,
  },
  modalClose: {
    fontSize: 20,
    color: Colors.textGray,
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 36,
  },
  seatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  seatsLabel: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.textGray,
    marginRight: 12,
  },
  seatsSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  seatOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatOptionSelected: {
    backgroundColor: Colors.primary,
  },
  seatOptionText: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.textGray,
  },
  seatOptionTextSelected: {
    color: Colors.white,
  },
  modalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  modalPriceLabel: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
  },
  modalPriceValue: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.textGray,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginTop: 16,
  },
  modalTotalLabel: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 16,
    color: Colors.primary,
  },
  modalTotalValue: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 20,
    color: Colors.primary,
  },
  modalConfirmButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 24,
  },
  modalConfirmText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 14,
    color: Colors.white,
    textTransform: 'lowercase',
  },
});

export default JoinActivityModal;
