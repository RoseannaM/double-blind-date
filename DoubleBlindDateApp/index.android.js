/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import {AccessToken, LoginManager} from 'react-native-fbsdk';
import React, {Component} from 'react';
import {AppRegistry, StyleSheet, Text, View, Button, Animated, Switch, Image} from 'react-native';

import Search from './components/Search';

import firebase from './firebase';

export default class DoubleBlindDateApp extends Component {

  componentDidMount() {
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

      firebase
            .auth()
            .onAuthStateChanged((user) => {
              if (user) {
                firebase.messaging().getToken()
                  .then((token) => {
                    firebase.database().ref(`users/${user.uid}/fcmToken`).set(token);
                  });
              }
            })
  }

  render() {
    return (
      <View style={styles.container}>
        <Search/>
      </View>
    );
  } 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

AppRegistry.registerComponent('DoubleBlindDateApp', () => DoubleBlindDateApp);
