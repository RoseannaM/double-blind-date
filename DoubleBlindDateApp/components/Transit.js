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

    render() {
        return (
            <View>
                <Text>You're on your way</Text>
            </View>
        )
    }
}

export default Transit;