import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import Button from '../../components/common/Button';

const { width } = Dimensions.get('window');
const chipWidth = (width - 48 - 16) / 2;

const tripTypes = [
  { id: '1', name: 'Solo' },
  { id: '2', name: 'Digital Nomad' },
  { id: '3', name: 'Backpacker' },
  { id: '4', name: 'Business Travel' },
  { id: '5', name: 'Family Trip' },
  { id: '6', name: 'Short Escape' },
  { id: '7', name: 'Volunteer' },
  { id: '8', name: 'Road Trip' },
  { id: '9', name: 'Friends & Fun' },
  { id: '10', name: 'Couple Trip' },
  { id: '11', name: 'Studying Abroad' },
];

const Onboarding3Screen = ({ navigation }) => {
  const [selectedTrips, setSelectedTrips] = useState([]);

  const toggleTrip = id => {
    if (selectedTrips.includes(id)) {
      setSelectedTrips(selectedTrips.filter(item => item !== id));
    } else {
      if (selectedTrips.length < 3) {
        setSelectedTrips([...selectedTrips, id]);
      } else {
        Alert.alert('Limit Reached', 'You can only select up to 3 options.');
      }
    }
  };

  const isSelected = id => selectedTrips.includes(id);

  const renderChip = trip => (
    <TouchableOpacity
      key={trip.id}
      style={[styles.chip, isSelected(trip.id) && styles.chipSelected]}
      activeOpacity={0.8}
      onPress={() => toggleTrip(trip.id)}
    >
      <Text
        style={[
          styles.chipText,
          isSelected(trip.id) && styles.chipTextSelected,
        ]}
      >
        {trip.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What best describes your trips?</Text>
      <Text style={styles.subtitle}>Select 1 to 3 options. They will be visible on your profile</Text>

      <View style={styles.chipsContainer}>
        <View style={styles.row}>
          {renderChip(tripTypes[0])}
          {renderChip(tripTypes[1])}
        </View>
        <View style={styles.row}>
          {renderChip(tripTypes[2])}
          {renderChip(tripTypes[3])}
        </View>
        <View style={styles.row}>
          {renderChip(tripTypes[4])}
          {renderChip(tripTypes[5])}
        </View>
        <View style={styles.row}>
          {renderChip(tripTypes[6])}
          {renderChip(tripTypes[7])}
        </View>
        <View style={styles.row}>
          {renderChip(tripTypes[8])}
          {renderChip(tripTypes[9])}
        </View>
        <View style={styles.row}>{renderChip(tripTypes[10])}</View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Continue"
          onPress={() => navigation.navigate(Screens.Onboarding2)}
          size="full"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 20,
    color: Colors.textBlack,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textBlack,
    lineHeight: 22,
    marginBottom: 30,
  },
  chipsContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chip: {
    width: chipWidth,
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontFamily: Fonts.poppinsRegular,
    fontSize: 14,
    color: Colors.textBlack,
  },
  chipTextSelected: {
    color: Colors.white,
  },
  buttonContainer: {
    paddingBottom: 40,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 20,
    color: Colors.white,
  },
});

export default Onboarding3Screen;
