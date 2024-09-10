import React from 'react';
import {View, Text, ImageBackground, StyleSheet} from 'react-native';
import backgroundImage from "../assets/bg2.png";

const HomeScreen = () => {
    return (
        <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
            <View style={styles.container}>
                <Text style={styles.text}>Home Screen</Text>
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
export default HomeScreen;