import React, {
  useEffect,
  useReducer,
  useRef,
  useCallback,
  useState,
  useContext,
} from 'react';
import { Text, View, Animated, Image, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
// import { TouchableOpacity } from 'react-native-gesture-handler';
import MapView, { Callout } from 'react-native-maps';
import { Icon, Button } from 'react-native-elements';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
// import Geolocation from "@react-native-community/geolocation";
import markerIcon from '../../../assets/markerIcon.png';
import { animateToUserLocation } from './utils';
import { reducer, mapState } from './reducer';
import MapSpotCard from '../../components/MapSpotCard';
import * as Location from 'expo-location';
import styles from './styles';
import { MainContext } from '../../store';
import Loading from '../../components/Loading';
import { getSpots } from '../../api/api';

const LOCATION_TASK_NAME = 'background-location-task';
const CARD_WIDTH = wp('95%');

const Map = (props) => {
  const { state: myStore, dispatch: storeDispatch } = useContext(MainContext);
  const [state, dispatch] = useReducer(reducer, mapState);
  const mapRef = useRef();
  const flatListRef = useRef();
  const [slideUpValue, setSideUpValie] = useState(new Animated.Value(0));
  const [raiseOrLower, setRaiseOrLower] = useState(true);
  const [userLocation, setUserLocation] = useState();
  const [loading, setLoading] = useState(false);
  const { filteredSpots } = state;
  const { navigation } = props;

  const raise = () => {
    Animated.timing(slideUpValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    setRaiseOrLower(true);
  };

  const lower = () => {
    Animated.timing(slideUpValue, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
    setRaiseOrLower(false);
  };

  useFocusEffect(
    useCallback(() => {
      let response;
      async function getTheSpots() {
        setLoading(true);
        response = await getSpots();
        dispatch({ type: 'SET_SPOTS', payload: response.spotList });
        setLoading(false);
      }

      async function mounting() {
        const { status } = await Location.requestPermissionsAsync();
        await animateToUserLocation(mapRef);

        if (status === 'granted') {
          const a = await Location.startLocationUpdatesAsync(
            LOCATION_TASK_NAME,
            {
              accuracy: Location.Accuracy.Balanced,
            }
          );
        }
      }

      raise();
      getTheSpots();

      mounting();
    }, [])
  );

  useEffect(() => {
    // Geolocation.getCurrentPosition((position) => {
    //   const initReg = {
    //     initialRegion: {
    //       latitude: position.coords.latitude - 0.02,
    //       longitude: position.coords.longitude,
    // latitudeDelta: 0.115,
    // longitudeDelta: 0.1121,
    //     },
    //     geoLocationSwitch: true,
    //   };
    // dispatch({ type: 'SET_SPOTS', payload: data.spotList });
    //   dispatch({ type: "SET_INIT_LOCATION", payload: initReg });
    // });

    setAnimatorListener();
  }, [
    // data,
    // refreshMarkers,
    setAnimatorListener,
    state.animation,
    state.currentRegion,
  ]);

  // useEffect(() => {
  //   async function checkAuth() {
  //     const user_id = await AsyncStorage.getItem("AUTH_TOKEN");
  //     navigation.navigate("Login");
  //   }

  //   checkAuth();
  // });

  // This is the function to scroll
  // to the end of the spots when a new spot is created
  // useEffect(() => {
  //   flatlistRef.getNode().scrollToEnd();
  // }, [flatlistRef, props.route.params]);

  // useEffect(() => {
  //   // filter to show only spots near initial starting point
  //   if (state.updateCounter <= 0) {
  //     const area = 0.5;
  //     if (state.initialRegion && state.initialRegion.latitude > 0.1) {
  //       const spotsThatHaveBeenFiltered = state.filteredSpots.filter(
  //         spot =>
  //           spot.latitude < state.initialRegion.latitude + area &&
  //           spot.latitude > state.initialRegion.latitude - area &&
  //           spot.longitude < state.initialRegion.longitude + area &&
  //           spot.longitude > state.initialRegion.longitude - area &&
  //           spot.approved === true,
  //       );
  //     }
  //     // Animate to spot
  //     // addAnEventListener();
  //     dispatch({ type: 'UPDATE_COUNTER', payload: 1 });
  //   }
  // }, [state.filteredSpots, state.initialRegion, state.updateCounter]);

  const onRegionChange = (region) => {
    dispatch({ type: 'SET_CURRENT_REGION', payload: region });
  };

  const goToSpotPage = (marker) => {
    navigation.navigate('SpotPage', { skatespot: marker });
  };

  const onMarkerPressHandler = (marker, index) => {
    flatListRef.current.getNode().scrollToIndex({ index });
  };

  // const refreshMarkers = useCallback(() => {
  //   state.animation.removeAllListeners();
  //   if (data) {
  //     const area = 0.05;
  //     if (
  //       state.currentRegion &&
  //       state.currentRegion.latitude > 0.1 &&
  //       data.getSpots !== undefined
  //     ) {
  //       const filteredSpots = data.getSpots.filter(
  //         (spot) =>
  //           spot.location.latitude < state.currentRegion.latitude + area &&
  //           spot.location.latitude > state.currentRegion.latitude - area &&
  //           spot.location.longitude < state.currentRegion.longitude + area &&
  //           spot.location.longitude > state.currentRegion.longitude - area
  //         // spot.approved === true,
  //       );
  //       // setState({filteredSpots: filteredSpots})
  //       dispatch({ type: 'SET_SPOTS', payload: filteredSpots });
  //     }
  //   }
  // }, [data, state.animation, state.currentRegion]);

  const setAnimatorListener = useCallback(() => {
    let regionTimeout = '';

    state.animation.addListener(({ value }) => {
      let animationIndex = Math.floor(value / CARD_WIDTH + 0.3); // animate 30% away from landing on the next item
      if (animationIndex >= filteredSpots.length) {
        animationIndex = filteredSpots.length - 1;
      }
      if (animationIndex <= 0) {
        animationIndex = 0;
      }

      clearTimeout(regionTimeout);
      regionTimeout = setTimeout(() => {
        if (state.index !== animationIndex) {
          state.index = animationIndex;
          mapRef.current.animateToRegion(
            {
              latitude: filteredSpots[animationIndex].location.latitude - 0.02,
              longitude: filteredSpots[animationIndex].location.longitude,
              latitudeDelta: state.region.latitudeDelta,
              longitudeDelta: state.region.longitudeDelta,
            },
            350
          );
        }
      }, 10);
    });
  }, [
    state.animation,
    filteredSpots,
    state.index,
    state.region.latitudeDelta,
    state.region.longitudeDelta,
  ]);

  const interpolations = filteredSpots
    ? filteredSpots.map((marker, index) => {
        const inputRange = [
          (index - 1) * CARD_WIDTH,
          index * CARD_WIDTH,
          (index + 1) * CARD_WIDTH,
        ];
        const scale = state.animation.interpolate({
          inputRange,
          outputRange: [1, 2.5, 1],
          extrapolate: 'clamp',
        });
        const opacity = state.animation.interpolate({
          inputRange,
          outputRange: [10, 1, 10],
          extrapolate: 'clamp',
        });
        return { scale, opacity };
      })
    : null;

  if (!filteredSpots) {
    return <Loading />;
  }

  // Map types
  // "standard"
  //  "satellite"
  //  "hybrid"
  //  "terrain"
  //  "none"
  //  "mutedStandard";

  return (
    <View style={styles.container}>
      <MapView
        showsUserLocation
        onMapReady={() => console.log('ready!')}
        ref={mapRef}
        style={{ flex: 1 }}
        rotateEnabled={false}
        // region={this.state.region}
        // mapType={"satellite"}
        showsMyLocationButton
        onRegionChange={onRegionChange}
      >
        {filteredSpots.length > 0
          ? filteredSpots.map((marker, index) => {
              const scaleStyle = {
                transform: [
                  {
                    scale: interpolations[index].scale,
                  },
                ],
              };
              const opacityStyle = {
                opacity: interpolations[index].opacity,
              };
              return (
                <MapView.Marker
                  key={index}
                  coordinate={{
                    latitude: Number(marker.location.latitude),
                    longitude: Number(marker.location.longitude),
                  }}
                  title={marker.name}
                  description={marker.description}
                  style={{ width: 40, height: 40 }}
                  onPress={(e) => {
                    e.stopPropagation();
                    onMarkerPressHandler(marker, index);
                  }}
                >
                  <Animated.View style={[styles.markerWrap, opacityStyle]}>
                    <Animated.View style={[styles.marker, scaleStyle]}>
                      <Image source={markerIcon} style={styles.marker} />
                    </Animated.View>
                  </Animated.View>
                </MapView.Marker>
              );
            })
          : null}
      </MapView>

      <Callout>
        <View>
          <View>
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Icon
                raised
                name="bars"
                size={17}
                type="font-awesome"
                containerStyle={styles.drawerButtonContainer}
                color="rgb(244, 2, 87)"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('New Spot Page')}
              style={styles.addSpotButton}
            >
              <Animated.View
                style={{
                  transform: [
                    {
                      translateY: slideUpValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [200, 0],
                      }),
                    },
                  ],
                }}
              >
                <Icon
                  raised
                  name="plus"
                  size={20}
                  type="font-awesome"
                  containerStyle={styles.addSpotButtonContainer}
                  color="rgb(244, 2, 87)"
                  iconStyle={styles.addSpotIcon}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>

          <Button
            raised
            icon={{
              name: 'refresh',
              size: 18,
              color: 'rgb(244, 2, 87)',
              type: 'font-awesome',
              marginLeft: 5,
            }}
            title="Search this area"
            containerStyle={styles.refreshContainer}
            buttonStyle={styles.refreshButtonStyle}
            titleStyle={styles.refreshButtonTitle}
            // onPress={refreshMarkers}
          />

          <TouchableOpacity onPress={() => animateToUserLocation(mapRef)}>
            <Animated.View
              style={{
                transform: [
                  {
                    translateY: slideUpValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [200, 0],
                    }),
                  },
                ],
              }}
            >
              <Icon
                raised
                name="location-arrow"
                size={20}
                type="font-awesome"
                containerStyle={styles.locationButtonContainer}
                color="rgb(244, 2, 87)"
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Callout>

      {filteredSpots !== undefined ? (
        <Animated.View
          style={{
            transform: [
              {
                translateY: slideUpValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [200, 0],
                }),
              },
            ],
          }}
        >
          <Animated.FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollView}
            ref={flatListRef}
            scrollEventThrottle={1}
            snapToInterval={CARD_WIDTH + 20}
            onScroll={Animated.event(
              [
                {
                  nativeEvent: {
                    contentOffset: {
                      x: state.animation,
                    },
                  },
                },
              ],
              { useNativeDriver: true }
            )}
            data={filteredSpots}
            renderItem={({ item }) => (
              <MapSpotCard
                navigation={navigation}
                spot={item}
                raise={raise}
                lower={lower}
                CARD_WIDTH={CARD_WIDTH}
              />
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </Animated.View>
      ) : null}
    </View>
  );
};

export default Map;
