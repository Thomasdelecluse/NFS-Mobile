import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const locationIcon = require('../assets/location.png');

const EventCard = ({ city, groupName, imageSource }) => {
    return (
        <View style={styles.cardContainer}>
            {/* Utiliser une image distante avec une URL */}
            <Image source={{ uri: imageSource }} style={styles.image} />
            <View style={styles.infoContainer}>
                <Text style={styles.groupName}>{groupName}</Text>
                <View style={styles.cityContainer}>
                    <Image source={locationIcon} style={styles.locationImage} />
                    <Text style={styles.cityText}>{city}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        marginBottom: 20,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.67)',
    },
    image: {
        width: '100%',
        height: 150,
    },
    infoContainer: {
        padding: 10,
        justifyContent: 'center',
    },
    cityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationImage: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
    cityText: {
        color: 'rgba(180,180,180,0.73)',
        fontSize: 16,
    },
    groupName: {
        color: '#1B1464',
        fontSize: 19,
        marginTop: 5,
        fontWeight: "bold",
    },
});

export default EventCard;
