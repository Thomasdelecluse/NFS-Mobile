import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Image, Modal, Text, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import CustomMarker from "../component/CustomMarker";
import UserImagePin from "../assets/userPin.png";
import LocationImagePin from "../assets/locationPin.png";
import eatPin from "../assets/eat.png";
import GenrePin from "../assets/genre.png";
import { getDataFromAPI, getDetailByEventId } from '../dao/EventDAO';

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
    const [originalMarkers, setOriginalMarkers] = useState([]);
    const [additionalDetails, setAdditionalDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        const getLocation = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({
                    enableHighAccuracy: true,
                    timeout: 20000,
                    maximumAge: 1000,
                });
                const { latitude, longitude } = location.coords;
                setUserLocation({ latitude, longitude });
                setRegion((prevRegion) => ({
                    ...prevRegion,
                    latitude,
                    longitude,
                }));
            }
        };

        Promise.all([getLocation(), getDataFromAPI().then(data => {
            setOriginalMarkers(data);
            setMarkers(data);
        })])
            .then(_ => setLoading(false))
            .catch(_ => setMarkers([]));
    }, []);

    const getMarkerIcon = (type) => {
        switch (type) {
            case 'toilette':
                return GenrePin;
            case 'SONG':
                return LocationImagePin;
            case 'eat':
                return eatPin;
            default:
                return LocationImagePin;
        }
    };

    const handleMarkerPress = async (markerData) => {
        setLoadingDetails(true);
        setSelectedMarker(markerData);

        try {
            const details = await getDetailByEventId(markerData.id);
            setAdditionalDetails(details);
        } catch (error) {
            console.error("Erreur lors de la récupération des détails supplémentaires :", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const closeModal = () => {
        setSelectedMarker(null);
        setAdditionalDetails(null);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={region}
                onRegionChangeComplete={newRegion => {
                    setRegion(newRegion);
                }}
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

                {markers.map((marker, index) => (
                    <CustomMarker
                        key={index}
                        coordinate={{
                            latitude: marker.latitude,
                            longitude: marker.longitude,
                        }}
                        pinImage={getMarkerIcon(marker.type)}
                        height={35}
                        width={35}
                        onPress={() => handleMarkerPress({
                            id: marker.id,
                            title: marker.nom_evenement,
                            lieu: marker.lieu,
                            image: marker.photo,
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
                            {loadingDetails ? (
                                <ActivityIndicator size="large" color="#0000ff" />
                            ) : (
                                <>
                                    {selectedMarker.image && (
                                        <Image source={{ uri: selectedMarker.image }} style={styles.modalImage} />
                                    )}
                                    <Text style={styles.modalTitle}>{selectedMarker.title}</Text>
                                    <View style={styles.datechoice}>
                                        <Text style={styles.modalDescription}>{selectedMarker.lieu}</Text>
                                        {additionalDetails && additionalDetails.heure ? (
                                            <Text style={styles.modalDescription}>{additionalDetails.heure}</Text>
                                        ) : null}
                                    </View>

                                    {additionalDetails && (
                                        <View>
                                            <Text style={styles.modalAdditionalTitle}>Informations supplémentaires :</Text>
                                            <Text style={styles.modalAdditionalText}>{additionalDetails.description}</Text>
                                        </View>
                                    )}
                                </>
                            )}
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
    datechoice:{
        flexDirection:"row",
        gap:10,
    },
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
    modalAdditionalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },
    modalAdditionalText: {
        fontSize: 14,
        marginTop: 5,
        marginBottom:15
    },
    modalImage: {
        width: 220,
        height: 220,
        marginBottom: 5,
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
