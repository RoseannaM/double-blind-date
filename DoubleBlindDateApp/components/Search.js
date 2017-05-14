import React, {Component} from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Button,
    Animated,
    Switch,
    Image
} from 'react-native';

import firebase from '../firebase';

class Search extends Component {

    constructor() {
        super();
        this.state = {
            backgroundColor: new Animated.Value(0)
        };
    }

    toggleAvailability = () => {
        this
            .user
            .child('isAvailable')
            .set(!this.state.available);
    }

    pushLocation = () => {
        navigator
            .geolocation
            .getCurrentPosition((position) => {
                this.user.child('location').set({
                    lat: position.coords.latitude,
                    long: position.coords.longitude,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                })
                this.setState({latitude: position.coords.latitude, longitude: position.coords.longitude, error: null});
            }, (error) => console.log("Geolocation screwed up"), {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 1000
            },);
    }

    componentDidMount() {
        firebase
            .auth()
            .onAuthStateChanged((user) => {
                if (user) {
                    this.user = firebase
                        .database()
                        .ref(`users/${user.uid}`);
                    this
                        .user
                        .child('isAvailable')
                        .on('value', (snapshot) => {
                            this.setState({
                                available: snapshot.val()
                            });

                            if (this.state.available) {
                                this.locationPoll = setInterval(this.pushLocation, 5000);
                                Animated
                                    .timing(this.state.backgroundColor, {toValue: 100})
                                    .start();
                            } else {
                                if (this.locationPoll) {
                                    clearInterval(this.locationPoll);
                                }
                                Animated
                                    .timing(this.state.backgroundColor, {toValue: 0})
                                    .start();
                            }
                        });
                }
            });
    }

    render() {
        const backgroundColor = this
            .state
            .backgroundColor
            .interpolate({
                inputRange: [
                    0, 100
                ],
                outputRange: ['rgba(100, 100, 100, 1)', 'rgba(124, 224, 195, 1)']
            });

        const opacity = this
            .state
            .backgroundColor
            .interpolate({
                inputRange: [
                    0, 100
                ],
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
                <Animated.View style={{opacity}}>
                    <Text style={styles.welcome}>
                        Searching for love...
                    </Text>
                    <Animated.Image
                        source={require('../img/map.png')}
                        style={styles.map}
                    >
                        <Image style={styles.heart} source={require('../img/heart.gif')}/>
                    </Animated.Image>
                </Animated.View>
                <View>
                    <Text>No, I want to be single forever</Text>
                    <Switch style={{
                        transform: [
                            {
                                scaleX: 2
                            }, {
                                scaleY: 2
                            }
                            ]}}
                        onValueChange={this.toggleAvailability}
                        value={this.state.available}/>
                    <Text>Yes, I want to go on a date tonight</Text>
                </View>
                
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
    },
    heart: {
        height: '40%',
        width: '40%'
    },
    map: {
        justifyContent: 'center',
        alignItems: 'center'
    }
});
