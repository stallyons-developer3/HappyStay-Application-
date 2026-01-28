import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Colors, Fonts, Screens } from '../../constants/Constants';

const { width } = Dimensions.get('window');
const cardWidth = (width - 24 - 24 - 16) / 2;

// Activities Data
const activities = [
  {
    id: '1',
    name: 'Nature & Active',
    image: require('../../assets/images/mountain.png'),
  },
  {
    id: '2',
    name: 'Sightseeing',
    image: require('../../assets/images/sightseeing.png'),
  },
  {
    id: '3',
    name: 'Party',
    image: require('../../assets/images/party.png'),
  },
  {
    id: '4',
    name: 'Events',
    image: require('../../assets/images/events.png'),
  },
  {
    id: '5',
    name: 'Food & Drink',
    image: require('../../assets/images/foods.png'),
  },
  {
    id: '6',
    name: 'Transport',
    image: require('../../assets/images/transport.png'),
  },
];

const Onboarding2Screen = ({ navigation }) => {
  const [selectedActivities, setSelectedActivities] = useState([]);

  const toggleActivity = id => {
    if (selectedActivities.includes(id)) {
      setSelectedActivities(selectedActivities.filter(item => item !== id));
    } else {
      setSelectedActivities([...selectedActivities, id]);
    }
  };

  const isSelected = id => selectedActivities.includes(id);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      <Text style={styles.title}>Activity Typology</Text>
      <Text style={styles.subtitle}>
        Which activities typology are proposing?
      </Text>

      <View style={styles.gridContainer}>
        {activities.map(activity => (
          <TouchableOpacity
            key={activity.id}
            style={[
              styles.card,
              isSelected(activity.id) && styles.cardSelected,
            ]}
            activeOpacity={0.8}
            onPress={() => toggleActivity(activity.id)}
          >
            <Image
              source={activity.image}
              style={styles.cardImage}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.cardText,
                isSelected(activity.id) && styles.cardTextSelected,
              ]}
            >
              {activity.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate(Screens.Onboarding3)}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
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
    fontFamily: Fonts.poppinsBold,
    fontSize: 20,
    color: Colors.textBlack,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    color: Colors.textBlack,
    textAlign: 'center',
    marginBottom: 30,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: cardWidth,
    height: cardWidth,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cardImage: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  cardText: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    color: Colors.textBlack,
    textAlign: 'center',
  },
  cardTextSelected: {
    color: Colors.white,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  continueButtonText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 20,
    color: Colors.white,
  },
});

export default Onboarding2Screen;
