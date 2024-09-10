import React from 'react';
import { View, Text, ImageBackground, StyleSheet } from 'react-native';
const backgroundImage = require('../assets/icon.png');
const EventScreen = () => {
    return (
        <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
            <View style={styles.container}>
                <Text style={styles.text}>Event Screen</Text>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default EventScreen;