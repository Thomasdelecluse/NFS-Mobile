import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Image, Modal, Text, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import CustomMarker from "../component/CustomMarker";
import UserImagePin from "../assets/userPin.png";
import LocationImagePin from "../assets/locationPin.png";
import eatPin from "../assets/eat.png";
import GenrePin from "../assets/genre.png";
import ChatBot from './ChatBot';
import { getDataFromAPI, getDetailByEventId } from '../dao/EventDAO';
import inMemoryStorage from '../component/inMemoryStorage'; // For favorite marker management
import { MessageCircle, Heart } from 'lucide-react-native';

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
    const [isChatVisible, setIsChatVisible] = useState(false);
    const [originalMarkers, setOriginalMarkers] = useState([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [additionalDetails, setAdditionalDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Fetch data and initialize location
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

        // Fetch markers and set both original and filtered markers
        Promise.all([getLocation(), getDataFromAPI().then(data => {
            setOriginalMarkers(data);
        })])
            .then(() => setLoading(false))
            .catch(() => setOriginalMarkers([]));
    }, []);

    const getMarkerIcon = (type) => {
        switch (type) {
            case 'toilette': return GenrePin;
            case 'SONG': return LocationImagePin;
            case 'eat': return eatPin;
            default: return LocationImagePin;
        }
    };

    // Handle marker press to show additional details
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

    // Toggle showing favorite markers only
    const toggleFavorites = () => {
        setShowFavoritesOnly(prevState => !prevState);
    };

    // Logic to filter markers by favorites or cluster them when zoomed out
    const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 0.5 - Math.cos(dLat) / 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            (1 - Math.cos(dLon)) / 2;
        return R * 2 * Math.asin(Math.sqrt(a));
    }, []);

    const clusterMarkers = useCallback((markers, region) => {
        const clusteredMarkers = [];
        const threshold = region.latitudeDelta * 10;
        const processed = new Set();

        markers.forEach((marker, index) => {
            if (processed.has(index)) return;

            let cluster = [marker];
            processed.add(index);

            markers.forEach((otherMarker, otherIndex) => {
                if (index !== otherIndex && !processed.has(otherIndex)) {
                    const distance = calculateDistance(
                        marker.latitude, marker.longitude,
                        otherMarker.latitude, otherMarker.longitude
                    );
                    if (distance < threshold) {
                        cluster.push(otherMarker);
                        processed.add(otherIndex);
                    }
                }
            });

            if (cluster.length > 1) {
                const clusterLat = cluster.reduce((sum, m) => sum + m.latitude, 0) / cluster.length;
                const clusterLon = cluster.reduce((sum, m) => sum + m.longitude, 0) / cluster.length;
                clusteredMarkers.push({
                    latitude: clusterLat,
                    longitude: clusterLon,
                    count: cluster.length,
                    markers: cluster,
                });
            } else {
                clusteredMarkers.push(marker);
            }
        });

        return clusteredMarkers;
    }, [calculateDistance]);

    const displayedMarkers = useMemo(() => {
        let filteredMarkers = showFavoritesOnly
            ? originalMarkers.filter(marker => inMemoryStorage.favorites.has(marker.id))
            : originalMarkers;

        return region.latitudeDelta > 0.1
            ? clusterMarkers(filteredMarkers, region)
            : filteredMarkers;
    }, [showFavoritesOnly, originalMarkers, region, clusterMarkers]);

    const toggleChat = () => {
        setIsChatVisible(!isChatVisible);
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
                <TouchableOpacity onPress={toggleFavorites} style={styles.heartButton}>
                     <Heart size={20} color="#1B1464" />
                </TouchableOpacity>

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

                {displayedMarkers.map((marker, index) => (
                    marker.count ? (
                        <CustomMarker
                            key={`cluster-${index}`}
                            coordinate={{
                                latitude: marker.latitude,
                                longitude: marker.longitude,
                            }}
                            pinImage={getMarkerIcon(marker.type)}
                            height={35}
                            width={35}
                            title={`${marker.count} événements`}
                            onPress={() => handleMarkerPress({
                                title: `${marker.count} événements`,
                                description: 'Zoom pour voir plus de détails',
                                markers: marker.markers,
                            })}
                        />
                    ) : (
                        <CustomMarker
                            key={`marker-${marker.id}`}
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
                    )
                ))}
            </MapView>

            <TouchableOpacity style={styles.chatButton} onPress={toggleChat}>
                <MessageCircle size={20} color="#fff" />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isChatVisible}
                onRequestClose={() => setIsChatVisible(false)}
            >
                <View style={styles.chatContainer}>
                    <ChatBot userLocation={userLocation} markers={markers} />
                    <TouchableOpacity style={styles.closeChatButton} onPress={() => setIsChatVisible(false)}>
                        <Text style={styles.closeChatButtonText}>Fermer le chat</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

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
    topContainer: {
        backgroundColor: 'white',
        width: '16%',
        margin: 10,
        borderRadius: 10,
        zIndex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    iconButton: {
        padding: 10,
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
    chatButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1,
        backgroundColor: '#1B1464',
        padding: 10,
        borderRadius: 25,
    },
    heartButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 25,
    },
    chatButtonText: {
        color: 'white',
        fontSize: 16,
    },
    chatContainer: {
        flex: 1,
        backgroundColor: 'white',
        marginTop: 50,
    },
    closeChatButton: {
        backgroundColor: '#1B1464',
        padding: 10,
        alignItems: 'center',
    },
    closeChatButtonText: {
        color: 'white',
        fontSize: 16,
    },
});
