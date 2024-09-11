import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ActivityIndicator, Image, Modal, Text, TouchableOpacity} from 'react-native';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import CustomMarker from "../component/CustomMarker";
import PopupImage from "../assets/logo.png";
import UserImagePin from "../assets/userPin.png";
import LocationImagePin from "../assets/locationPin.png";
import {getDataFromAPI} from '../dao/EventDAO';

const MapScreen = () => {
    const [region, setRegion] = useState({
        latitude: 48.8566,
        longitude: 2.3522,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });
    const [userLocation, setUserLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [markers, setMarkers] = useState([]);

    useEffect(() => {
            const getLocation = async () => {
                const {status} = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const location = await Location.getCurrentPositionAsync({
                        enableHighAccuracy: true,
                        timeout: 20000,
                        maximumAge: 1000,
                    });
                    const {latitude, longitude} = location.coords;
                    setUserLocation({latitude, longitude});
                    setRegion((prevRegion) => ({
                        ...prevRegion,
                        latitude,
                        longitude,
                    }));
                }
            };

            Promise
                .all([getLocation(), getDataFromAPI().then(setMarkers)])
                .then(_ => setLoading(false))
                .catch(_ => setMarkers([]))
    }, []);

    const handleMarkerPress = (markerData) => {
        setSelectedMarker(markerData);
    };

    const closeModal = () => {
        setSelectedMarker(null); // Fermer la modale
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff"/>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={region}
                onRegionChangeComplete={setRegion}
            >
                {userLocation && (
                    <CustomMarker
                        coordinate={userLocation}
                        title="Votre position actuelle"
                        description="Vous êtes ici"
                        height={45}
                        width={45}
                        pinImage={UserImagePin}
                        onPress={() => handleMarkerPress({
                            title: "Votre position actuelle",
                            description: "Vous êtes ici",
                            image: null,
                        })}
                    />
                )}

                {/* Parcourir les markers récupérés depuis l'API */}
                {markers.map((marker, index) => (
                    <CustomMarker
                        key={index}
                        coordinate={{
                            latitude: marker.latitude,
                            longitude: marker.longitude,
                        }}
                        pinImage={LocationImagePin}
                        height={35}
                        width={35}
                        onPress={() => handleMarkerPress({
                            title: marker.nom_evenement,
                            description: marker.lieu,
                            image: PopupImage,
                        })}
                    />
                ))}
            </MapView>

            {selectedMarker && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={!!selectedMarker}
                    onRequestClose={closeModal}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            {selectedMarker.image && (
                                <Image source={selectedMarker.image} style={styles.modalImage}/>
                            )}
                            <Text style={styles.modalTitle}>{selectedMarker.title}</Text>
                            <Text style={styles.modalDescription}>{selectedMarker.description}</Text>
                            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>Fermer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};

export default MapScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalDescription: {
        fontSize: 16,
        marginBottom: 20,
    },
    modalImage: {
        width: 150,
        height: 150,
        marginBottom: 10,
        resizeMode: 'contain',
    },
    closeButton: {
        backgroundColor: '#1B1464',
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
    },
});
