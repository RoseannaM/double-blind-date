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

const Sound = require('react-native-sound');

class Arrived extends Component {

    constructor() {
        super();
        this.state = {
            backgroundColor: new Animated.Value(0)
        };
    }

    componentDidMount() {
        const cycleAnimation = () => {
            Animated.sequence([
                Animated
                    .timing(this.state.backgroundColor, {toValue: 100}),
                Animated
                    .timing(this.state.backgroundColor, {toValue: 0})
            ]).start(() => {
                    cycleAnimation();
                });
        }
        cycleAnimation();

        // Load the sound file 'whoosh.mp3' from the app bundle
        // See notes below about preloading sounds within initialization code below.
        this.love = new Sound('love.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('failed to load the sound', error);
                return;
            } 
            // loaded successfully
            console.log('duration in seconds: ' + this.love.getDuration() + 'number of channels: ' + this.love.getNumberOfChannels());

            // Play the sound with an onEnd callback
            this.love.play((success) => {
                if (success) {
                    console.log('successfully finished playing');
                } else {
                    console.log('playback failed due to audio decoding errors');
                }
            });
        });
    }

    render() {
        const backgroundColor = this
            .state
            .backgroundColor
            .interpolate({
                inputRange: [
                    0, 33, 66, 100
                ],
                outputRange: ['rgba(200, 200, 100, 1)', 'rgba(100, 200, 100, 1)', 'rgba(100, 0, 100, 1)', 'rgba(124, 224, 195, 1)']
            });

        return (
            <Animated.View style={{
                backgroundColor, 
                width: '100%', 
                height: '100%',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: 30
            }}>
                <View style={{flex: 1, justifyContent: 'center', width: '80%'}}>
                    <Text style={styles.text}>1. Turn volume up</Text>
                    <Text style={styles.text}>2. Find the other person holding a glowy, singing phone</Text>
                    <Text style={styles.text}>3. Live happily ever after</Text>
                    <Button title="I've found my soul mate" onPress={this.finished}></Button>
                </View>
            </Animated.View>
        )
    }

    finished = () => {
        this.love.stop();
        firebase.database().ref(`users/${this.props.user}/dateStatus`).set('unavailable');
    }
}

const styles = StyleSheet.create({
    text: {
        fontSize: 30,
        paddingTop: 50,
        paddingBottom: 50
    }
});


export default Arrived;