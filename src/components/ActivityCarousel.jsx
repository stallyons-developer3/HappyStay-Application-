import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../constants/Constants';
import ActivityCarouselCard from './ActivityCarouselCard';

const ActivityCarousel = ({
  title,
  subtitle,
  activities,
  onActivityPress,
  onLikePress,
}) => {
  if (!activities || activities.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? (
          <Text style={styles.subtitle}>{subtitle}</Text>
        ) : null}
      </View>
      <FlatList
        data={activities}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyExtractor={item => `carousel-${item.id}`}
        renderItem={({ item }) => (
          <ActivityCarouselCard
            activity={item}
            onPress={() => onActivityPress(item)}
            onLikePress={onLikePress}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerSection: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 18,
    color: Colors.textBlack,
  },
  subtitle: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textGray,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 20,
  },
});

export default ActivityCarousel;
