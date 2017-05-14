/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import {AccessToken, LoginManager} from 'react-native-fbsdk';
import React, {Component} from 'react';
import {AppRegistry, StyleSheet, Text, View, Button, Animated, Switch, Image} from 'react-native';

import GeolocationExample from './components/get-location';
import RNFirebase from 'react-native-firebase';

const configurationOptions = {
  debug: true
};

const firebase = RNFirebase.initializeApp(configurationOptions);

export default class DoubleBlindDateApp extends Component {
  constructor() {
    super();
    this.state = {
      backgroundColor: new Animated.Value(0)
    };
  }

  componentDidMount() {
      console.log("something")
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          this.user = firebase.database().ref(`users/${user.uid}`);
          this.user.child('isAvailable').on('value', 
            (snapshot) => {
              this.setState({available: snapshot.val()});

              if (this.state.available) {
                Animated.timing(              
                  this.state.backgroundColor,                      
                  {
                    toValue: 100,                   
                  }
                ).start();  
              } else {
                Animated.timing(              
                  this.state.backgroundColor,                      
                  {
                    toValue: 0,                   
                  }
                ).start();  
              }
            });
        }
      });

      LoginManager
      .logInWithReadPermissions(['public_profile', 'email'])
      .then((result) => {
        if (result.isCancelled) {
          return Promise.resolve('cancelled');
        }
        console.log(`Login success with permissions: ${result.grantedPermissions.toString()}`);
        // get the access token
        return AccessToken.getCurrentAccessToken();
      })
      .then(data => {
        // create a new firebase credential with the token
        const credential = firebase
          .auth
          .FacebookAuthProvider
          .credential(data.accessToken);

        // login with credential
        return firebase
          .auth()
          .signInWithCredential(credential);
      })
      .then((currentUser) => {
        if (currentUser === 'cancelled') {
          console.log('Login cancelled');
        } else {
          // now signed in
          console.warn(JSON.stringify(currentUser.toJSON()));
        }
      })
      .catch((error) => {
        console.log(`Login fail with error: ${error}`);
      });
  }

  render() {
    const backgroundColor = this.state.backgroundColor.interpolate({
        inputRange: [0, 100],
        outputRange: ['rgba(100, 100, 100, 1)', 'rgba(124, 224, 195, 1)']
    });

    const opacity = this.state.backgroundColor.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1]
    });

    return (
      <Animated.View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center', 
        backgroundColor
      }}>
        <Switch style={{transform: [{scaleX: 2}, {scaleY: 2}]}} onValueChange={this.toggleAvailability} value={this.state.available}/>
        <Text style={styles.welcome}>
          Welcome to Double Blind Date!
        </Text>
        <Text style={styles.instructions}>
          
        </Text>
        <Text>
          {JSON.stringify(this.state.text)}
        </Text>
        <GeolocationExample/>
        <Animated.Image source={require('./img/map.png')} style={{opacity}}/>
      </Animated.View>
    );
  }

  toggleAvailability = () => {
    this.user.child('isAvailable').set(!this.state.available);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5
  }
});

AppRegistry.registerComponent('DoubleBlindDateApp', () => DoubleBlindDateApp);
