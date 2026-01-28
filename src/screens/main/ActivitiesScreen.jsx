import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Colors, Screens } from '../../constants/Constants';

// Components
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import ActivityCard from '../../components/ActivityCard';
import FloatingMapButton from '../../components/FloatingMapButton';

// Dummy Data
const activitiesData = [
  {
    id: '1',
    image: require('../../assets/images/bonfire.png'),
    title: 'Bonfire',
    price: '$12',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
    time: '7:00 AM',
    date: '18 Aug',
    location: 'Pool Site',
  },
  {
    id: '2',
    image: require('../../assets/images/beach-party.png'),
    title: 'Beach Party',
    price: '$12',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
    time: '7:00 AM',
    date: '18 Aug',
    location: 'Pool Site',
  },
  {
    id: '3',
    image: require('../../assets/images/bonfire.png'),
    title: 'Camping Night',
    price: '$18',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
    time: '8:00 PM',
    date: '20 Aug',
    location: 'Mountain View',
  },
];

const ActivitiesScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');

  // Handle tab press
  const handleTabPress = tabName => {
    if (tabName === 'Activities') return;

    switch (tabName) {
      case 'Home':
        navigation.navigate(Screens.Home);
        break;
      case 'Hangouts':
        navigation.navigate(Screens.Hangouts);
        break;
      case 'Chat':
        navigation.navigate(Screens.Chat);
        break;
      case 'Manage':
        navigation.navigate(Screens.Manage);
        break;
    }
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
          title="Activities"
          greeting="Enjoy Your Day"
          showGreeting={true}
          showProfile={true}
          showNotification={true}
          notificationCount={5}
          onProfilePress={() => navigation.navigate(Screens.Profile)}
          onNotificationPress={() => console.log('Notification pressed')}
        />

        {/* Search Bar */}
        <SearchBar
          placeholder="Find your activity"
          value={searchText}
          onChangeText={setSearchText}
          onSearch={() => console.log('Search:', searchText)}
          onActionPress={() => console.log('Filter pressed')}
        />

        {/* Activity Cards */}
        <View style={styles.cardsContainer}>
          {activitiesData?.map(activity => (
            <ActivityCard
              key={activity.id}
              image={activity.image}
              title={activity.title}
              price={activity.price}
              description={activity.description}
              time={activity.time}
              date={activity.date}
              location={activity.location}
              onPress={() =>
                navigation.navigate(Screens.ActivityDetail, { activity })
              }
              onMapPress={() => console.log('Open map for:', activity.title)}
            />
          ))}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Map Button */}
      <FloatingMapButton onPress={() => console.log('Map pressed')} />
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

export default ActivitiesScreen;
