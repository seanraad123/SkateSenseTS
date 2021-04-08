import React, { useRef, useState, useContext, useEffect } from 'react';
import {
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
  Linking,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import GestureRecognizer from 'react-native-swipe-gestures';
import { Icon } from 'react-native-elements';
import BookmarkButton from './BookmarkButton';
const CARD_WIDTH = wp('95%');

const MapSpotCard = ({ spot, raise, lower, navigation }) => {
  const [opened, setOpened] = useState(true);

  const _start = () => {
    raise();
    setOpened(true);
  };

  const _close = () => {
    lower();
    setOpened(false);
  };

  const config = {
    velocityThreshold: 0.8,
    directionalOffsetThreshold: 500,
  };

  const goToSpotPage = () => {
    navigation.navigate('Spot Page', { spot });
  };

  return (
    <GestureRecognizer
      onSwipeUp={() => _start()}
      onSwipeDown={() => _close()}
      config={config}
      style={styles.gestureRecognizer}
    >
      <View style={styles.card}>
        <View style={styles.tab} />
        <View style={styles.topButtons}>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                `http://maps.apple.com/?daddr=${spot.location.latitude},${spot.location.longitude}`
              )
            }
            style={styles.directionsButton}
          >
            <Icon
              containerStyle={styles.directionsButtonIcon}
              name="directions"
              size={20}
              type="material-community"
              color="black"
            />
          </TouchableOpacity>

          <BookmarkButton spot={spot} />
        </View>

        <TouchableWithoutFeedback onPress={goToSpotPage}>
          <Image
            style={styles.cardImage}
            resizeMode="cover"
            source={{ uri: `data:image/gif;base64,${spot.images[0].base64}` }}
          />
        </TouchableWithoutFeedback>

        <View style={styles.textContent}>
          <Text numberOfLines={1} style={styles.cardtitle}>
            {spot.name}
          </Text>
          <Text numberOfLines={1} style={styles.cardDescription}>
            {spot.description}
          </Text>
        </View>
      </View>
    </GestureRecognizer>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: hp('40%'),
    padding: 10,
    elevation: 1,
    shadowOpacity: 0.75,
    shadowRadius: 3,
    shadowColor: 'grey',
    shadowOffset: { height: 1, width: 1 },
    backgroundColor: '#FFF',
    marginHorizontal: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  tab: {
    height: hp('.8%'),
    width: hp('5%'),
    marginBottom: 5,
    backgroundColor: 'lightgrey',
    borderRadius: 5,
  },
  cardImage: {
    zIndex: 2,
    borderRadius: 20,
    width: wp('90%'),
    height: hp('32%'),
    alignSelf: 'center',
  },
  textContent: {
    zIndex: 100,
  },
  cardtitle: {
    fontSize: hp('2%'),
    fontWeight: '300',
    alignSelf: 'center',
  },
  cardDescription: {
    fontSize: 12,
    color: '#444',
  },

  topButtons: {
    display: 'flex',
    zIndex: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: CARD_WIDTH - wp('5%'),
    position: 'absolute',
    marginTop: hp('2%'),
  },

  directionsButton: {
    zIndex: 2,
    borderRadius: 40,
    justifyContent: 'center',
    backgroundColor: 'rgb(250,255,255)',
    elevation: 1,
    shadowOpacity: 0.3,
    shadowRadius: 0.5,
    shadowOffset: { height: 1, width: 0.5 },
  },
  directionsButtonIcon: {
    zIndex: 2,
    width: 50,
    height: 50,
    justifyContent: 'center',
  },

  container: {
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  item: {},
  btn: {
    zIndex: 25,
    backgroundColor: '#480032',
    height: 40,
    padding: 3,
    justifyContent: 'center',
    borderRadius: 6,
    width: '30%',
  },
  text: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  item1: {
    backgroundColor: 'red',
    padding: 20,
    width: 100,
    margin: 10,
  },

  textBtn: {
    color: '#f4f4f4',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  gestureRecognizer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default MapSpotCard;
