import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { getDetailByEventId, getEventByIdFromAPI } from "../dao/EventDAO";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

// Stockage en mémoire pour les favoris
const inMemoryStorage = {
  favorites: new Set()
};

const EventDetailScreen = ({ route }) => {
    const { eventId } = route.params;
    const [event, setEvent] = useState(null);
    const [eventDetails, setEventDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const fetchEventAndDetails = async () => {
            try {
                const [eventData, eventDetailsData] = await Promise.all([
                    getEventByIdFromAPI(eventId),
                    getDetailByEventId(eventId)
                ]);
                setEvent(eventData);
                setEventDetails(eventDetailsData);
                checkIfFavorite(eventId);
            } catch (err) {
                console.error("Erreur lors de la récupération des données :", err);
                setError('Erreur lors de la récupération des détails de l\'événement.');
            } finally {
                setLoading(false);
            }
        };

        fetchEventAndDetails();
    }, [eventId]);

    const checkIfFavorite = (id) => {
        setIsFavorite(inMemoryStorage.favorites.has(id));
    };

    const toggleFavorite = () => {
        if (isFavorite) {
            inMemoryStorage.favorites.delete(eventId);
        } else {
            inMemoryStorage.favorites.add(eventId);
        }
        setIsFavorite(!isFavorite);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
                <Text>Chargement des détails...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.mainContainer}>
            <View style={styles.cardContainer}>
                {event && eventDetails ? (
                    <>
                        <Image
                            source={{ uri: 'https://cache.marieclaire.fr/data/photo/w1200_h630_ci/6h/mode-kpop.jpg' }}
                            style={styles.image}
                        />
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>{event.artiste?.nom || ''}</Text>
                            <TouchableOpacity onPress={toggleFavorite}>
                                <Ionicons
                                    name={isFavorite ? "heart" : "heart-outline"}
                                    size={24}
                                    color={isFavorite ? "red" : "black"}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.infoContainer}>
                            <View style={styles.infoRow}>
                                <Ionicons name="map-outline" size={24} color="black" />
                                <Text style={styles.timeText}>{event.lieu || ''}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="time-outline" size={24} color="black" />
                                <Text style={styles.timeText}>{eventDetails.heure || ''}</Text>
                            </View>
                        </View>
                        <View style={styles.descriptionRow}>
                            <Text style={styles.descriptionText}>{eventDetails.description || 'Description non disponible'}</Text>
                        </View>
                    </>
                ) : (
                    <Text style={styles.noEventsText}>Aucun événement trouvé</Text>
                )}
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    infoContainer:{
        flexDirection:'row',
        gap:7
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: 'red',
    },
    cardContainer: {
        backgroundColor: '#b3e5e8',
        borderRadius: 10,
        padding: 10,
        margin: 20,
        width: 300,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    image: {
        width: '100%',
        height: 150,
        borderRadius: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 10,
        color: '#000',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
        backgroundColor: '#d0e9f2',
        padding: 5,
        paddingRight:10,
        borderRadius: 5,
    },
    timeText: {
        fontSize: 16,
        marginLeft: 10,
        color: '#000',
    },
    descriptionRow: {
        flexDirection: 'column',
        alignItems: 'left',
        marginTop: 10,
        backgroundColor: '#d0e9f2',
        padding: 5,
        borderRadius: 5,
        width: '100%',
        justifyContent: 'center',
    },
    descriptionText: {
        fontSize: 16,
        marginLeft: 10,
        color: '#000',
    },
    noEventsText: {
        fontSize: 18,
        color: '#000',
    },
    mainContainer:{
        flex:1,
        paddingTop:70,
        alignItems:"center",
        backgroundColor:"#14cbc4",
    }
});

export default EventDetailScreen;
