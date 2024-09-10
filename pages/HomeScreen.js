import React from 'react';
import {ImageBackground, ScrollView, StyleSheet, Text} from 'react-native';
import backgroundImage from "../assets/bg2.png";

const HomeScreen = () => {
    return (
        <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <Text style={styles.mainTitle}>FESIPOP</Text>
                <Text style={styles.subtitle}>MUSIC FESTIVAL</Text>
                <Text style={styles.lineText}>BOOBA</Text>
                <Text style={styles.lineTextSmall}>SOPRANO, KAARIS</Text>
                <Text style={styles.lineTextSmaller}>MHD, ORELSAN, GIMS, NISKA</Text>
                <Text style={styles.lineTextTiny}>KERY JAMES, LOMEPAL, VLAD, PLK</Text>
                <Text style={styles.lineTextTiny}>KERY JAMES, LOMEPAL, VLAD, PLK,NISKA</Text>
                <Text style={styles.lineTextTiny}>KERY JAMES, LOMEPAL, VLAD, PLK</Text>
                <Text style={styles.lineTextSmaller}>MHD, ORELSAN, GIMS, NISKA</Text>
                <Text style={styles.lineTextSmall}>SOPRANO, KAARIS</Text>
                <Text style={styles.lineText}>BOOBA</Text>
                {/* Continue d'ajouter du texte si nécessaire */}
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    contentContainer: {
        flexGrow: 1,
        marginTop:70,
        alignItems: 'center',
        padding: 20,
    },
    mainTitle: {
        fontSize: 60,
        fontWeight: 'bold',
        color: 'white',
    },
    subtitle: {
        fontSize: 24,
        fontWeight: '400',
        color: 'white',
        marginBottom: 100,
    },
    lineText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    lineTextSmall: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    lineTextSmaller: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    lineTextTiny: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
});

export default HomeScreen;
