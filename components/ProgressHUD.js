// 'use strict';

import React, {Component} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet
} from 'react-native';

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   flexDirection: 'row',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   width: width,
  //   height: height,
  //   position: 'absolute',
  //   top: 0,
  //   left: 0,
  //   backgroundColor: 'rgba(0, 0, 0, 0.5)'
  // },
  indicator: {
    margin: 15
  },
  label: {
    color: '#FFF'
  }
});

class ProgressHUD extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    var {width, height, isVisible} = this.props;
    if(isVisible) {
      return (
        <View style={
          {flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          width: width,
          height: height,
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}>
          <ActivityIndicator
            animating={true}
            color={'#FFF'}
            size={'large'}
            style={styles.indicator} />
          <Text style={styles.label}>Please wait...</Text>
        </View>
      );
    } else {
      return (
        <View></View>
      );
    }
  }
}

module.exports  = ProgressHUD;
