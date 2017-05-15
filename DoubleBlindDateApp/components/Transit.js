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

class Transit extends Component {

    constructor() {
        super();
        this.state = {transit: {}};
    }

    pushLocation = () => {
        navigator
            .geolocation
            .getCurrentPosition((position) => {
                this.props.user.child('location').set({
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
        this.locationPoll = setInterval(this.pushLocation, 5000);
        this.props.user.child('transit').on('value', (snapshot => {
            this.setState({transit: snapshot.val()});
        }))

    }

    componentDidUnmount() {
        clearInterval(this.locationPoll);
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.bigText}>It's a match</Text>
                <Image style={styles.cupid} source={require('../img/cupid.gif')}/>
                <Text style={styles.statusText}>{this.state.transit.status1}</Text>
                <Text style={styles.statusText}>{this.state.transit.status2}</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(124, 224, 195, 1)',
        width: '100%'
    },
    cupid: {
        height: '50%',
        width: '80%'
    },
    bigText: {
        fontSize: 40,
        paddingTop: 10,
        paddingBottom: 10
    },
    statusText: {
        fontSize: 20,
        paddingTop: 20,
        paddingBottom: 20
    }
});

export default Transit;
