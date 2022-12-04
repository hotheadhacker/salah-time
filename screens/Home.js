import {
  View,
  Text,
  StyleSheet,
  Image,
  Button,
  TouchableOpacity,
  TextInput,
  FlatList,
  AsyncStorage,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import FA5 from 'react-native-vector-icons/FontAwesome5';
import moment from 'moment';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';

export default Home = () => {
  const [loading, setLoading] = useState(true);
  const [salahJSON, setSalahJSON] = useState({});
  const [activeSalah, setActiveSalah] = useState('qiyam');
  const [dt, setDt] = useState(new Date().toLocaleTimeString());
  const [reandomNumber, setRandomNo] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [salahLocation, setSalahLocation] = useState(null);
  const [geoEncodedData, setGeoEncodedData] = useState(null);

  // get current date
  var today = new Date();
  var currentTwelveHr = formatAMPM(today);

  const getSalahApiAsync = async (manualCoordinates = false) => {
    try {
      var url =
        'https://salah.com/get?lt=34.071486870226444&lg=74.81112963457205'; // lalchowk :)
      if (manualCoordinates) {
        console.log(manualCoordinates);
        url = `https://salah.com/get?lt=${manualCoordinates.lat}&lg=${manualCoordinates.lng}`;
      }
      const response = await fetch(url);
      const json = await response.json();
      console.log(json);
      setLoading(false);
      setSalahJSON(json);
      // make comparisions
      var fajrTime = moment(json?.times?.Fajr, 'h:mm a');
      var sunriseTime = moment(json?.times?.Sunrise, 'h:mm a');
      var dhuhrTime = moment(json?.times?.Dhuhr, 'h:mm a');
      var asrTime = moment(json?.times?.Asr, 'h:mm a');
      var maghribTime = moment(json?.times?.Maghrib, 'h:mm a');
      var ishaTime = moment(json?.times?.Isha, 'h:mm a');
      var qiyamTime = moment(json?.times?.Qiyam, 'h:mm a');
      var boundaryTime = moment('11:59 PM', 'h:mm a');
      var currentTime = moment(currentTwelveHr, 'h:mm a');

      if (fajrTime.isBefore(currentTime) && currentTime.isBefore(sunriseTime))
        setActiveSalah('fajr');

      if (sunriseTime.isBefore(currentTime) && currentTime.isBefore(dhuhrTime))
        setActiveSalah('sunrise');

      if (dhuhrTime.isBefore(currentTime) && currentTime.isBefore(asrTime))
        setActiveSalah('dhuhr');

      if (asrTime.isBefore(currentTime) && currentTime.isBefore(maghribTime))
        setActiveSalah('asr');

      if (maghribTime.isBefore(currentTime) && currentTime.isBefore(ishaTime))
        setActiveSalah('maghrib');

      if (ishaTime.isBefore(currentTime) && currentTime.isBefore(boundaryTime))
        // special boundry condition
        setActiveSalah('isha');

      console.log(activeSalah);
      // not sure about below condition
      //   if(qiyamTime.isBefore(currentTime) && currentTime.isBefore(sunriseTime))
      //   setActiveSalah('fajr');
      //   console.log(salahTime.isBefore(currentTime));
      //   console.log(salahTime.toDate());
      //   console.log(currentTime.toDate());
      return json;
    } catch (error) {
      // todo: add a screen on app UI that shows no internet connection!
      console.log(error);
    }
  };
  // make geo encoded places data
  const getGeoEncodedApiAsync = async () => {
    try {
      const response = await fetch(
        'http://api.positionstack.com/v1/forward?access_key=' +
          process.env.REACT_APP_GEO_CODE_API_KEY +
          '&limit=10&output=json&query=' +
          salahLocation,
      );
      const json = await response.json();
      let locationFetchData = json?.data ?? null;
      //   console.log(json?.data[0]?.country ?? {data: 'not found'});
      setGeoEncodedData(locationFetchData);
      return json;
    } catch (error) {
      // todo: add a screen on app UI that shows no internet connection!
      alert('Error: ' + JSON.stringify(error));
      console.log(error);
    }
  };

  // manage text input
  const onChangeSalahLocation = loc => {
    setSalahLocation(loc);
    getGeoEncodedApiAsync();
  };
  // manage item
  const Item = ({title}) => (
    <View style={{paddingBottom: 10}}>
      <Text style={{fontSize: 20}}>
        <Icon name="location-outline" size={20} /> {title}
      </Text>
    </View>
  );
  // manage flatlist render
  const renderItem = ({item}) => (
    <TouchableOpacity
      onPress={() => {
        handleDynamicTapedLocation({
          lat: item?.latitude,
          lng: item?.longitude,
          loc: item?.label,
        });
      }}>
      <Item title={item?.label} />
    </TouchableOpacity>
  );

  // save user selected/tapped location, fetch new salah data and return to main screen

  const handleDynamicTapedLocation = coordinates => {
    console.log(coordinates);
    if (coordinates.lat && coordinates.lng) {
      getSalahApiAsync(coordinates);
      AsyncStorage.setItem('manualCoordinates', JSON.stringify(coordinates)); //! tried to use community version but got npm dependancy err
      setModalVisible(!isModalVisible);
      // add a toast message
      showToast('success', 'Updating...', 'Your new location is updating 🥳');
    }
  };

  // call api
  useEffect(() => {
    // set random number for ayah
    setRandomNo(getRandomArbitrary());
    // check if we have previous user entered coordinates
    (async () => {
      let userCoordinates = await AsyncStorage.getItem('manualCoordinates');
      let parsed = JSON.parse(userCoordinates);
      console.log('From AsyncStorage: ' + userCoordinates);
      if (parsed) getSalahApiAsync(parsed);
      else getSalahApiAsync();
    })();
    // getSalahApiAsync();
    // getGeoEncodedApiAsync();
    // console.log(salahJSON);
  }, []);

  // make loading screen to show verses of al - quran
  let versesOfQuran = [
    '“And Allah would not punish them while they seek forgiveness” [Quran 8:33]',
    '“He created the heavens and earth in truth and formed you and perfected your forms; and to Him is the [final] destination” [Quran 64:3]',
    '“And whoever relies upon Allah – then He is sufficient for him. Indeed, Allah will accomplish His purpose. Allah has already set for everything a [decreed] extent” [Quran 65:3]',
    '“My mercy encompasses all things” [Quran 7:156]',
    '“Allah does not burden a soul beyond that it can bear” [Quran 2:286]',
    '“So verily, with the hardship, there is relief. Verily, with the hardship, there is relief” [Quran 94:5-6]',
    '“Do what is beautiful. Allah loves those who do what is beautiful” [Quran 2:195]',
    '“The people will depart separated [into categories] to be shown [the result of] their deeds. So whoever does an atom’s weight of good will see it” [Quran 99:6-7]',
    '“Say, ‘O My servants who have transgressed against themselves [by sinning], do not despair of the mercy of Allah . Indeed, Allah forgives all sins. Indeed, it is He who is the Forgiving, the Merciful” [Quran 39:53]',
  ];

  // generate a random number from range
  function getRandomArbitrary() {
    min = Math.ceil(0);
    max = Math.floor(versesOfQuran.length - 1);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // compare time for active strip
  // logic may be buggy
  function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  // show clock on app screen
  useEffect(() => {
    let secTimer = setInterval(() => {
      setDt(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(secTimer);
  }, []);

  // let update location feature
  // toggle modal
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  // toast
  const showToast = (type, hero, msg) => {
    Toast.show({
      type: type,
      text1: hero,
      text2: msg,
    });
  };

  return (
    <View>
      {!loading ? (
        <View>
          <Text style={{textAlign: 'center', fontSize: 30}}>Today</Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              margin: 5,
            }}>
            <Text style={{fontSize: 15}}>{today.toDateString()}</Text>
            <TouchableOpacity onPress={toggleModal}>
              <Text style={{fontSize: 16}}>
                <Icon name="location-outline" size={10} color="#4F8EF7" />
                {salahJSON?.location}
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 8,
                  color: 'green',
                  fontStyle: 'italic',
                }}>
                Tap to change your location
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 40,
              marginBottom: 15,
            }}>
            <Text style={{fontSize: 40}}>{dt}</Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 10,
            }}>
            <Text style={{marginLeft: 20}}>
              <FA5 name="mosque" size={30} color="#4F8EF7" />
            </Text>
            <Text style={{marginRight: 20}}>
              <Icon name="calendar-outline" size={30} color="#4F8EF7" />
            </Text>
          </View>

          <View style={{margin: 10}}>
            <View
              style={[
                activeSalah == 'fajr' ? styles.activeSalah : null,
                {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 20,
                },
              ]}>
              <Text
                style={[
                  activeSalah == 'fajr' ? styles.activeTitle : null,
                  {fontSize: 25},
                ]}>
                Fajr
              </Text>
              <Text
                style={[
                  activeSalah == 'fajr' ? styles.activeTitle : null,
                  {fontSize: 25},
                ]}>
                {salahJSON?.times?.Fajr}
              </Text>
            </View>
            <View
              style={[
                activeSalah == 'sunrise' ? styles.activeSalah : null,
                {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 20,
                },
              ]}>
              <Text
                style={[
                  activeSalah == 'sunrise' ? styles.activeTitle : null,
                  {fontSize: 25},
                ]}>
                Sunrise{' '}
              </Text>
              <Text
                style={[
                  activeSalah == 'sunrise' ? styles.activeTitle : null,
                  {fontSize: 25},
                ]}>
                {salahJSON?.times?.Sunrise}
              </Text>
            </View>
            <View
              style={[
                activeSalah == 'dhuhr' ? styles.activeSalah : null,
                {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 20,
                },
              ]}>
              <Text
                style={[
                  activeSalah == 'dhuhr' ? styles.activeTitle : null,
                  {fontSize: 25},
                ]}>
                Dhuhr{' '}
              </Text>
              <Text
                style={[
                  activeSalah == 'dhuhr' ? styles.activeTitle : null,
                  {fontSize: 25},
                ]}>
                {salahJSON?.times?.Dhuhr}
              </Text>
            </View>
            <View
              style={[
                activeSalah == 'asr' ? styles.activeSalah : null,
                {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 20,
                },
              ]}>
              <Text
                style={[
                  activeSalah == 'asr' ? styles.activeTitle : null,
                  {fontSize: 25},
                ]}>
                Asr{' '}
              </Text>
              <Text
                style={[
                  activeSalah == 'asr' ? styles.activeTitle : null,
                  {fontSize: 25},
                ]}>
                {salahJSON?.times?.Asr}
              </Text>
            </View>
            <View
              style={[
                activeSalah == 'maghrib' ? styles.activeSalah : null,
                {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 20,
                },
              ]}>
              <Text
                style={[
                  activeSalah == 'maghrib' ? styles.activeTitle : null,
                  {fontSize: 25},
                ]}>
                Maghrib{' '}
              </Text>
              <Text
                style={[
                  activeSalah == 'maghrib' ? styles.activeTitle : null,
                  {fontSize: 25},
                ]}>
                {salahJSON?.times?.Maghrib}
              </Text>
            </View>
            <View
              style={[
                activeSalah == 'isha' ? styles.activeSalah : null,
                {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 20,
                },
              ]}>
              <Text
                style={[
                  activeSalah == 'isha' ? styles.activeTitle : null,
                  {fontSize: 25},
                ]}>
                Isha
              </Text>
              <Text
                style={[
                  activeSalah == 'isha' ? styles.activeTitle : null,
                  {fontSize: 25},
                ]}>
                {salahJSON?.times?.Isha}
              </Text>
            </View>
            <View
              style={[
                activeSalah == 'qiyam' ? styles.activeSalah : null,
                {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 20,
                },
              ]}>
              <Text
                style={[
                  activeSalah == 'qiyam' ? styles.activeTitle : null,
                  {fontSize: 25},
                ]}>
                Qiyam
              </Text>
              <Text
                style={[
                  activeSalah == 'qiyam' ? styles.activeTitle : null,
                  {fontSize: 25},
                ]}>
                {salahJSON?.times?.Qiyam}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={{}}>
          {/* <Image style={{textAlign: 'center'}} source={require('../assets/loader/Stopwatch.gif')} /> */}
          <Text style={{textAlign: 'center', marginTop: 200}}>
            Salah Time Loading...
          </Text>
          <Text style={{textAlign: 'center', marginTop: 50, fontSize: 25}}>
            {versesOfQuran[reandomNumber]}
          </Text>
        </View>
      )}

      {/* modal for location change */}
      <Modal isVisible={isModalVisible}>
        <View style={{flex: 1, backgroundColor: 'white'}}>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 18,
              color: 'green',
              margin: 10,
            }}>
            Enter your location
          </Text>
          <TextInput
            style={{
              margin: 10,
              color: 'green',
              backgroundColor: 'beige',
              borderWidth: 2,
              paddingLeft: 10,
              borderColor: 'green',
              borderRadius: 20,
            }}
            onChangeText={onChangeSalahLocation}
            value={salahLocation}
            placeholder="Type your location"
          />
          <View>
            <FlatList
              data={geoEncodedData}
              renderItem={renderItem}
              keyExtractor={(item, index) => 'key' + index}
            />
          </View>

          {/* <Button title="Go Back" onPress={toggleModal} /> */}
          <TouchableOpacity onPress={toggleModal} style={{margin: 10}}>
            <Text style={{textAlign: 'center', color: 'green'}}>
              <Icon name="arrow-back" /> Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  activeSalah: {
    backgroundColor: '#006bb3',
    borderRadius: 6,
    color: 'white',
    padding: 10,
  },
  activeTitle: {
    color: 'white',
    fontSize: 30,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
