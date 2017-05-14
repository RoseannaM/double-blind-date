import React, {Component} from 'react';
import {AppRegistry, StyleSheet, Text, View, Button, Animated, Switch, Image} from 'react-native';

import firebase from '../firebase';

class Search extends Component {

    constructor() {
        super();
        this.state = {
            backgroundColor: new Animated.Value(0)
        };
    }

    toggleAvailability = () => {
        this.user
            .child('isAvailable')
            .set(!this.state.available);
    }

    componentDidMount() {
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
            <Animated.View
                style={{
                flex: 1,
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor
            }}>
                <Text style={styles.welcome}>
                    Welcome to Double Blind Date!
                </Text>
                <Text style={styles.instructions}></Text>
                <Text>
                    {JSON.stringify(this.state.text)}
                </Text>
                <Animated.Image
                    source={require('../img/map.png')}
                    style={{
                    opacity
                }}/>
                <Switch
                    style={{
                    transform: [
                        {
                            scaleX: 2
                        }, {
                            scaleY: 2
                        }
                    ]
                }}
                    onValueChange={this.toggleAvailability}
                    value={this.state.available}/>
            </Animated.View>
        )
    }
}

export default Search;

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