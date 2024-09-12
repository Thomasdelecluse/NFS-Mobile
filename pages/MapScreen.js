import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Image, Modal, Text, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import CustomMarker from "../component/CustomMarker";
import PopupImage from "../assets/logo.png";
import UserImagePin from "../assets/userPin.png";
import LocationImagePin from "../assets/locationPin.png";

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
    const [originalMarkers, setOriginalMarkers] = useState([]); // Pour stocker les marqueurs d'origine

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

        // Récupération de la position et des données API
        Promise.all([getLocation(), getDataFromAPI().then(data => {
            setOriginalMarkers(data);  // Stocke les marqueurs d'origine
            setMarkers(data);          // Affiche les marqueurs sans clustering initialement
        })])
        .then(_ => setLoading(false))
        .catch(_ => setMarkers([]));
    }, []);

    // Fonction pour calculer la distance entre deux points géographiques
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Rayon de la Terre en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 0.5 - Math.cos(dLat) / 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            (1 - Math.cos(dLon)) / 2;
        return R * 2 * Math.asin(Math.sqrt(a));
    };

    // Fonction de clustering des marqueurs
    const clusterMarkers = (markers, region) => {
        const clusteredMarkers = [];
        const zoomFactor = region.latitudeDelta;
        const threshold = zoomFactor * 10;  // Ajustez selon vos besoins

        const processed = new Set(); // Marqueurs déjà traités

        markers.forEach((marker, index) => {
            if (processed.has(index)) return;

            let cluster = [marker];
            processed.add(index);

            markers.forEach((otherMarker, otherIndex) => {
                if (index !== otherIndex && !processed.has(otherIndex)) {
                    const distance = calculateDistance(
                        marker.latitude,
                        marker.longitude,
                        otherMarker.latitude,
                        otherMarker.longitude
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
    };

    // Fonction appelée lors de la sélection d'un marqueur
    const handleMarkerPress = (markerData) => {
        setSelectedMarker(markerData); // Mettre à jour l'état avec les informations du marqueur sélectionné
    };

    // Fermer la modale
    const closeModal = () => {
        setSelectedMarker(null);
    };

    // Si l'application charge encore les données
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
                    const clustered = clusterMarkers(originalMarkers, newRegion);  // Utilisez les marqueurs d'origine
                    setMarkers(clustered); // Mettre à jour les marqueurs affichés
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
                    marker.count ? (
                        // Si c'est un cluster, afficher un marqueur avec le nombre de marqueurs dans le cluster
                        <CustomMarker
                            key={index}
                            coordinate={{
                                latitude: marker.latitude,
                                longitude: marker.longitude,
                            }}
                            pinImage={LocationImagePin}
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
                        // Sinon afficher le marqueur individuel
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
                                image: marker.photo,
                            })}
                        />
                    )
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
                            {selectedMarker.markers && selectedMarker.markers.length > 1 ? (
                                <>
                                    <Text style={styles.modalTitle}>{selectedMarker.title}</Text>
                                    <Text style={styles.modalDescription}>Contient plusieurs événements. Zoomez pour en voir plus.</Text>
                                </>
                            ) : (
                                <>
                                    {selectedMarker.image && (
                                        <Image source={{uri: selectedMarker.image}} style={styles.modalImage}/>
                                    )}
                                    <Text style={styles.modalTitle}>{selectedMarker.title}</Text>
                                    <Text style={styles.modalDescription}>{selectedMarker.description}</Text>
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
