/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Dimensions,
  PanResponder,
  CameraRoll,
  AlertIOS
} from 'react-native';

var Swiper = require('react-native-swiper');
var NetworkImage = require('react-native-image-progress');
var Progress = require('react-native-progress');
var RandManager = require('./utils/RandManager');
var Utils = require('./utils/Utils');

const NUM_WALLPAPERS = 5;
const DOUBLE_TAP_DELAY = 300; // ms
const DOUBLE_TAP_RADIUS = 20;

var {width, height} = Dimensions.get('window');

class SplashWalls extends Component {
  constructor(props) {
    super(props);

    this.state = {
      wallsJSON: [],
      isLoading: true
    };

    this.imagePanResponder = {};

    this.prevTouchInfo = {
      prevTouchX: 0,
      prevTouchY: 0,
      prevTouchTimestamp: 0
    };

    this.handlePanResponderGrant = this.handlePanResponderGrant.bind(this);
    this.onMomentumScrollEnd = this.onMomentumScrollEnd.bind(this);

    this.currentWallIndex = 0;
  }

  componentWillMount() {
    this.imagePanResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
      onPanResponderGrant: this.handlePanResponderGrant,
      onPanResponderRelease: this.handlePanResponderEnd,
      onPanResponderTerminate: this.handlePanResponderEnd
    });
  }

  handleStartShouldSetPanResponder(e, gestureState) {
    return true;
  }

  handlePanResponderGrant(e, gestureState) {
    console.log('Finger touched the Image!');

    var currentTouchTimestamp = Date.now();

    if( this.isDoubleTap(currentTouchTimestamp, gestureState) ) {
      console.log('Double tap detected!');

      this.saveCurrentWallpaperToCameraRoll();
    }

    this.prevTouchInfo = {
      prevTouchX: gestureState.x0,
      prevTouchY: gestureState.y0,
      prevTouchTimestamp: currentTouchTimestamp
    }
  }

  handlePanResponderEnd(e, gestureState) {
    console.log('Finger pulled up from Image!');
  }

  onMomentumScrollEnd(e, state, context) {
    this.currentWallIndex = state.index;
  }

  isDoubleTap(currentTouchTimestamp, {x0, y0}) {
    var {prevTouchX, prevTouchY, prevTouchTimestamp} = this.prevTouchInfo;
    var dt = currentTouchTimestamp - prevTouchTimestamp;

    return (dt < DOUBLE_TAP_DELAY && Utils.distance(prevTouchX, prevTouchY, x0, y0) < DOUBLE_TAP_RADIUS);
  }

  saveCurrentWallpaperToCameraRoll() {
    var {wallsJSON} = this.state;

    var currentWall = wallsJSON[this.currentWallIndex];
    var currentWallURL = `https://unsplash.it/${currentWall.width}/${currentWall.height}?image=${currentWall.id}`;

    CameraRoll.saveToCameraRoll(currentWallURL, 'photo')
      .then(
        (data) => {
          AlertIOS.alert(
            'Saved',
            'Wallpaper successfully saved to Camera Roll',
            [
              {text: 'High 5!', onPress: () => console.log('Ok Pressed!')}
            ]
          );
        })
        .catch(
          (err) => {
            console.log('Error saving to camera roll', err);
          }
        );
  }

  fetchWallsJSON() {
    var url = 'https://unsplash.it/list';
    fetch(url)
      .then(response => response.json())
      .then(jsonData => {
        var randomIds = RandManager.uniqueRandomNumbers(NUM_WALLPAPERS, 0, jsonData.length);
        var walls = [];
        randomIds.forEach(randomId => {
          walls.push(jsonData[randomId]);
        });

        this.setState({
          isLoading: false,
          wallsJSON: [].concat(walls)
        });
      })
      .catch(error => console.log('JSON Fetch Error: ' + error));
  }

  componentDidMount() {
    this.fetchWallsJSON();
  }

  renderLoadingMessage() {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          animating={true}
          color={'#FFF'}
          size={'small'}
          style={{margin: 15}} />

        <Text style={{color: '#FFF'}}> Contacting Unsplash </Text>
      </View>
    );
  }

  renderResults() {
    var {wallsJSON, isLoading} = this.state;
    if ( !isLoading ) {
      return (
        <Swiper
         dot={<View style={{backgroundColor: 'rgba(255, 255, 255, .4)', width: 8, height: 8, borderRadius: 10, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3}} />}
         activeDot={<View style={{backgroundColor: '#FFF', width: 13, height: 13, borderRadius: 7, marginLeft: 7, marginRight: 7}} />}
         loop={true}
         onMomentumScrollEnd={this.onMomentumScrollEnd}>
          {
            wallsJSON.map((wallpaper, index) => {
              return (
                <View key={index}>
                  <NetworkImage
                    source={{uri: `https://unsplash.it/${wallpaper.width}/${wallpaper.height}?image=${wallpaper.id}`}}
                    indicator={Progress.Circle}
                    style={styles.wallpaperImage}
                    indicatorProps={
                      {
                        color: 'rgba(255, 255, 255)',
                        size: 60,
                        thickness: 7
                      }
                    }
                    {...this.imagePanResponder.panHandlers}>
                      <Text style={styles.label}>Photo by</Text>
                      <Text style={styles.labelAuthorName}>{wallpaper.author}</Text>
                  </NetworkImage>
                </View>
              );
            })
          }
        </Swiper>
      );
    }
  }

  render() {
    var {isLoading} = this.state;
    if(isLoading)
      return this.renderLoadingMessage();
    else
      return this.renderResults();

    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit index.ios.js
        </Text>
        <Text style={styles.instructions}>
          Press Cmd+R to reload,{'\n'}
          Cmd+D or shake for dev menu
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000'
  },
  wallpaperImage: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: '#000'
  },
  label: {
    position: 'absolute',
    color: '#FFF',
    fontSize: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 2,
    paddingLeft: 5,
    top: 20,
    left: 20,
    width: width/2
  },
  labelAuthorName: {
    position: 'absolute',
    color: '#FFF',
    fontSize: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 2,
    paddingLeft: 5,
    top: 41,
    left: 20,
    fontWeight: 'bold',
    width: width/2
  }
});

AppRegistry.registerComponent('SplashWalls', () => SplashWalls);
