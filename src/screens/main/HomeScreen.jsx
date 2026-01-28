  import React, { useState } from 'react';
  import { View, ScrollView, StyleSheet } from 'react-native';
  import { Colors, Screens } from '../../constants/Constants';

  // Components
  import Header from '../../components/Header';
  import SearchBar from '../../components/SearchBar';
  import ActivityCard from '../../components/ActivityCard';
  import HangoutCard from '../../components/HangoutCard';
  import PromotionCard from '../../components/PromotionCard';
  import FloatingMapButton from '../../components/FloatingMapButton';

  // Dummy Data
  const activityData = {
    image: require('../../assets/images/bonfire.png'),
    title: 'Bonfire',
    price: '$12',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
    time: '7:00 AM',
    date: '18 Aug',
    location: 'Pool Site',
  };

  const hangoutData = {
    profileImage: require('../../assets/images/profile.png'),
    name: 'Jessica',
    activityType: 'Hiking',
    description:
      'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
    peopleCount: 4,
    peopleImages: [
      require('../../assets/images/profile.png'),
      require('../../assets/images/profile.png'),
      require('../../assets/images/profile.png'),
      require('../../assets/images/profile.png'),
    ],
  };

  const promotionData = {
    icon: require('../../assets/images/icons/promo-icon.png'),
    title: 'Sea Cafeteria',
    description: 'today 10% discount at the restaurant from 6pm to 8pm',
    link: 'www.example.com',
  };

  const HomeScreen = ({ navigation }) => {
    const [searchText, setSearchText] = useState('');

    // Handle tab press
    const handleTabPress = tabName => {
      if (tabName === 'Home') return;

      switch (tabName) {
        case 'Activities':
          navigation.navigate(Screens.Activities);
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
            title="Home"
            greeting="Good Morning!"
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

          {/* Activity Card */}
          <View style={styles.sectionSpacing}>
            <ActivityCard
              image={activityData.image}
              title={activityData.title}
              price={activityData.price}
              description={activityData.description}
              time={activityData.time}
              date={activityData.date}
              location={activityData.location}
              onPress={() => navigation.navigate(Screens.ActivityDetail)}
              onMapPress={() => console.log('Open map')}
            />
          </View>

          {/* Hangout Card */}
          <HangoutCard
            profileImage={hangoutData.profileImage}
            name={hangoutData.name}
            activityType={hangoutData.activityType}
            description={hangoutData.description}
            peopleCount={hangoutData.peopleCount}
            peopleImages={hangoutData.peopleImages}
            onPress={() => console.log('Hangout pressed')}
            onJoinPress={() => console.log('Join pressed')}
          />

          {/* Promotion Card */}
          <PromotionCard
            icon={promotionData.icon}
            title={promotionData.title}
            description={promotionData.description}
            link={promotionData.link}
            onPress={() => console.log('Promotion pressed')}
          />

          {/* Bottom Spacing for FloatingMapButton & BottomNav */}
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
      paddingTop: 30,
      paddingBottom: 20,
    },
    sectionSpacing: {
      marginTop: 10,
    },
    bottomSpacing: {
      height: 100,
    },
  });

  export default HomeScreen;
