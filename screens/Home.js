import { View, Text, StyleSheet, Image } from 'react-native';
import React, {useState, useEffect} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import FA5 from 'react-native-vector-icons/FontAwesome5';
import moment from 'moment';

export default Home = () => {
    const [loading, setLoading] = useState(true);
    const [salahJSON, setSalahJSON] = useState({});
    const [activeSalah, setActiveSalah] = useState('qiyam');
    const [dt, setDt] = useState(new Date().toLocaleTimeString());
    
    // get current date
    var today = new Date();
    var currentTwelveHr = formatAMPM(today);

    
    const getSalahApiAsync = async () => {
            try {
              const response = await fetch(
                'https://salah.com/get?lt=34.0837&lg=74.7973'
              );
              const json = await response.json();
            //   console.log(json);
              setLoading(false)
              setSalahJSON(json);
              // make comparisions
              var fajrTime = moment(json?.times?.Fajr, 'h:mm a');
              var sunriseTime = moment(json?.times?.Sunrise, 'h:mm a');
              var dhuhrTime = moment(json?.times?.Dhuhr, 'h:mm a');
              var asrTime = moment(json?.times?.Asr, 'h:mm a');
              var maghribTime = moment(json?.times?.Maghrib, 'h:mm a');
              var ishaTime = moment(json?.times?.Isha, 'h:mm a');
              var qiyamTime = moment(json?.times?.Qiyam, 'h:mm a');

              var currentTime = moment(currentTwelveHr, 'h:mm a');

              if(fajrTime.isBefore(currentTime) && currentTime.isBefore(sunriseTime))
                setActiveSalah('fajr');

              if(sunriseTime.isBefore(currentTime) && currentTime.isBefore(dhuhrTime))
                setActiveSalah('sunrise');

              if(dhuhrTime.isBefore(currentTime) && currentTime.isBefore(asrTime))
                setActiveSalah('dhuhr');

              if(asrTime.isBefore(currentTime) && currentTime.isBefore(maghribTime))
                setActiveSalah('asr');

              if(maghribTime.isBefore(currentTime) && currentTime.isBefore(ishaTime))
                setActiveSalah('maghrib');

              if(ishaTime.isBefore(currentTime) && currentTime.isBefore(qiyamTime))
                setActiveSalah('fajr');

                console.log(activeSalah);
                // not sure about below condition
            //   if(qiyamTime.isBefore(currentTime) && currentTime.isBefore(sunriseTime))
            //     setActiveSalah('fajr');
            //   console.log(salahTime.isBefore(currentTime));
            //   console.log(salahTime.toDate());
            //   console.log(currentTime.toDate());
              return json;
            } catch (error) {
                console.log(error);
            }
        };
        
    // call api
      useEffect(() => {
        getSalahApiAsync();
        console.log(salahJSON);
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
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
      }

      // show clock on app screen
      useEffect(() => {
        let secTimer = setInterval( () => {
          setDt(new Date().toLocaleTimeString())
        },1000)
    
        return () => clearInterval(secTimer);
    }, []);
      

    

    return(
        <View>
            {!loading ? 
            <View>
                <Text style={{textAlign: 'center', fontSize: 30}}>Today</Text>
                <View style={{flexDirection: 'row', justifyContent:'space-between', margin: 5}}>
                    <Text style={{fontSize: 15}}>{today.toDateString()}</Text>
                    <Text style={{fontSize: 12}}><Icon name="location-outline" size={10} color="#4F8EF7" />{salahJSON?.location}</Text>
                </View>

                <View style={{flexDirection: 'row', justifyContent:'center', marginTop: 40, marginBottom: 15}}>
                    <Text style={{fontSize: 40}}>{dt}</Text>
                </View>

                <View style={{flexDirection: 'row', justifyContent:'space-between', marginTop: 10}}>
                    <Text style={{marginLeft: 20}}><FA5 name="mosque" size={30} color="#4F8EF7" /></Text>
                    <Text style={{marginRight: 20}}><Icon name="calendar-outline" size={30} color="#4F8EF7" /></Text>
                </View>

                <View style={{margin: 10}}>
                <View style={[activeSalah == 'fajr' ? styles.activeSalah : null, {flexDirection: 'row', justifyContent:'space-between', marginTop: 20}]}>
                        <Text style={[activeSalah == 'fajr' ? styles.activeTitle : null, {fontSize: 25}]}>Fajr</Text>
                        <Text style={[activeSalah == 'fajr' ? styles.activeTitle : null, {fontSize: 25}]}>{salahJSON?.times?.Fajr}</Text>
                    </View>
                    <View style={[activeSalah == 'sunrise' ? styles.activeSalah : null, {flexDirection: 'row', justifyContent:'space-between', marginTop: 20}]}>
                        <Text style={[activeSalah == 'sunrise' ? styles.activeTitle : null, {fontSize: 25}]}>Sunrise </Text>
                        <Text style={[activeSalah == 'sunrise' ? styles.activeTitle : null, {fontSize: 25}]}>{salahJSON?.times?.Sunrise}</Text>
                    </View>
                    <View style={[activeSalah == 'dhuhr' ? styles.activeSalah : null, {flexDirection: 'row', justifyContent:'space-between', marginTop: 20}]}>
                        <Text style={[activeSalah == 'dhuhr' ? styles.activeTitle : null, {fontSize: 25}]}>Dhuhr </Text>
                        <Text style={[activeSalah == 'dhuhr' ? styles.activeTitle : null, {fontSize: 25}]}>{salahJSON?.times?.Dhuhr}</Text>
                    </View>
                    <View style={[activeSalah == 'asr' ? styles.activeSalah : null, {flexDirection: 'row', justifyContent:'space-between', marginTop: 20}]}>
                        <Text style={[activeSalah == 'asr' ? styles.activeTitle : null, {fontSize: 25}]}>Asr </Text>
                        <Text style={[activeSalah == 'asr' ? styles.activeTitle : null, {fontSize: 25}]}>{salahJSON?.times?.Asr}</Text>
                    </View>
                    <View style={[activeSalah == 'maghrib' ? styles.activeSalah : null, {flexDirection: 'row', justifyContent:'space-between', marginTop: 20}]}>
                        <Text style={[activeSalah == 'maghrib' ? styles.activeTitle : null, {fontSize: 25}]}>Maghrib </Text>
                        <Text style={[activeSalah == 'maghrib' ? styles.activeTitle : null, {fontSize: 25}]}>{salahJSON?.times?.Maghrib}</Text>
                    </View>
                    <View style={[activeSalah == 'isha' ? styles.activeSalah : null, {flexDirection: 'row', justifyContent:'space-between', marginTop: 20}]}>
                        <Text style={[activeSalah == 'isha' ? styles.activeTitle : null, {fontSize: 25}]}>Isha</Text>
                        <Text style={[activeSalah == 'isha' ? styles.activeTitle : null, {fontSize: 25}]}>{salahJSON?.times?.Isha}</Text>
                    </View>
                    <View style={[activeSalah == 'qiyam' ? styles.activeSalah : null, {flexDirection: 'row', justifyContent:'space-between', marginTop: 20}]}>
                        <Text style={[activeSalah == 'qiyam' ? styles.activeTitle : null, {fontSize: 25}]}>Qiyam</Text>
                        <Text style={[activeSalah == 'qiyam' ? styles.activeTitle : null, {fontSize: 25}]}>{salahJSON?.times?.Qiyam}</Text>
                    </View>
                </View>
            </View> : <View style={{}}>
                {/* <Image style={{textAlign: 'center'}} source={require('../assets/loader/Stopwatch.gif')} /> */}
                <Text style={{textAlign: 'center', marginTop: 200}}>Salah Time Loading...</Text>
                <Text style={{textAlign: 'center', marginTop: 50, fontSize: 25}}>{versesOfQuran[getRandomArbitrary()]}</Text>
            </View>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    activeSalah: {
        backgroundColor: '#006bb3',
        borderRadius: 6,
        color: 'white',
        padding: 10,
    },
    activeTitle:{
        color: 'white',
        fontSize: 30,
    },
    loadingContainer: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center'
    }
    
  });