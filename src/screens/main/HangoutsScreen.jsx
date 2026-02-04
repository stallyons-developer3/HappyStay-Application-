import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Colors, Screens } from '../../constants/Constants';

// Components
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import HangoutCard from '../../components/HangoutCard';
import FloatingMapButton from '../../components/FloatingMapButton';
import { Linking, Platform } from 'react-native';
import FilterModal from '../../components/FilterModal';

// Dummy Data
const hangoutsData = [
  {
    id: '1',
    profileImage: require('../../assets/images/profile.png'),
    name: 'Jessica',
    activityType: 'Hiking',
    description:
      'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
    peopleCount: 4,
    peopleImages: [
      require('../../assets/images/profile.png'),
      require('../../assets/images/user1.png'),
      require('../../assets/images/user2.png'),
      require('../../assets/images/user3.png'),
    ],
  },
  {
    id: '2',
    profileImage: require('../../assets/images/profile.png'),
    name: 'Jessica',
    activityType: 'Hiking',
    description:
      'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
    peopleCount: 4,
    peopleImages: [
      require('../../assets/images/profile.png'),
      require('../../assets/images/user1.png'),
      require('../../assets/images/user2.png'),
      require('../../assets/images/user3.png'),
    ],
  },
  {
    id: '3',
    profileImage: require('../../assets/images/profile.png'),
    name: 'Michael',
    activityType: 'Beach Party',
    description:
      'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
    peopleCount: 6,
    peopleImages: [
      require('../../assets/images/profile.png'),
      require('../../assets/images/user1.png'),
      require('../../assets/images/user2.png'),
      require('../../assets/images/user3.png'),
    ],
  },
];

const HangoutsScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Handle tab press
  const handleTabPress = tabName => {
    if (tabName === 'Hangouts') return;

    switch (tabName) {
      case 'Home':
        navigation.navigate(Screens.Home);
        break;
      case 'Activities':
        navigation.navigate(Screens.Activities);
        break;
      case 'Chat':
        navigation.navigate(Screens.Chat);
        break;
      case 'Manage':
        navigation.navigate(Screens.Manage);
        break;
    }
  };

  // Handle Filter Apply
  const handleFilterApply = filters => {
    console.log('Applied Filters:', filters);
    // Apply filters to your data here
  };

  return (
    <View style={styles.container}>
      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Header
          title="Hangouts"
          greeting="Enjoy Your Day"
          showGreeting={true}
          showProfile={true}
          showNotification={true}
          notificationCount={5}
          onProfilePress={() => navigation.navigate(Screens.Profile)}
          onNotificationPress={() => navigation.navigate(Screens.Notification)}
        />

        {/* Search Bar */}
        <SearchBar
          placeholder="Find your activity"
          value={searchText}
          onChangeText={setSearchText}
          onSearch={() => console.log('Search:', searchText)}
          onActionPress={() => setShowFilterModal(true)}
        />

        {/* Hangout Cards */}
        <View style={styles.cardsContainer}>
          {hangoutsData.map(hangout => (
            <HangoutCard
              key={hangout.id}
              profileImage={hangout.profileImage}
              name={hangout.name}
              activityType={hangout.activityType}
              description={hangout.description}
              peopleCount={hangout.peopleCount}
              peopleImages={hangout.peopleImages}
              onPress={() => navigation.navigate(Screens.HangoutDetail)}
              onJoinPress={() => console.log('Join pressed:', hangout.name)}
            />
          ))}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Map Button */}
      <FloatingMapButton onPress={() => navigation.navigate(Screens.Map)} />
      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleFilterApply}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  cardsContainer: {
    marginTop: 30,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default HangoutsScreen;
