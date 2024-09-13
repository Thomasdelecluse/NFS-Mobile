import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getDetailByEventId, getEventByIdFromAPI } from '../dao/EventDAO';
import { scheduleNotification } from './NotificationManager';
import spotifyLogo from '../assets/spotify.png';
import deezerLogo from '../assets/deezer.png';
import inMemoryStorage from './inMemoryStorage';


const EventDetailScreen = ({ route }) => {
    const { eventId } = route.params;
    const [event, setEvent] = useState(null);
    const [eventDetails, setEventDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [notificationActive, setNotificationActive] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const [eventData, eventDetailsData] = await Promise.all([
                    getEventByIdFromAPI(eventId),
                    getDetailByEventId(eventId)
                ]);
                setEvent(eventData);
            } catch (err) {
                console.error('Erreur lors de la récupération de l\'événement :', err);
                setError('Erreur lors de la récupération des détails de l\'événement.');
            } finally {
                setLoading(false);
            }
        };

        const fetchEventDetails = async () => {
            try {
                const eventDetailsData = await getDetailByEventId(eventId);
                setEventDetails(eventDetailsData);
                checkIfFavorite(eventId);
            } catch (err) {
                console.error('Erreur lors de la récupération des détails de l\'événement :', err);
                setError('Erreur lors de la récupération des détails de l\'événement.');
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
        fetchEventDetails();
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

    // Fonction pour gérer le clic sur l'icône de notification
    const toggleNotification = async () => {
        if (eventDetails && eventDetails.heure) {
            setNotificationActive(!notificationActive);
            if (!notificationActive) {
                await scheduleNotification(eventDetails.heure, event); // Planifier la notification
            }
        }
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
                            source={{ uri: event.photo }}
                            style={styles.image}
                        />
                        <View style={styles.titleRow}>
                            <Text style={styles.title}>{event.artiste?.nom || ''}</Text>
                            <TouchableOpacity onPress={toggleFavorite} style={styles.favButton}>
                                <Ionicons
                                    name={isFavorite ? "heart" : "heart-outline"}
                                    size={24}
                                    color={isFavorite ? "red" : "black"}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={toggleNotification} style={styles.notificationButton}>
                                <Ionicons
                                    name={notificationActive ? 'notifications' : 'notifications-outline'}
                                    size={28}
                                    color={notificationActive ? 'yellow' : 'black'} // Changement de couleur si activé
                                    style={styles.notificationIcon}
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

                        {/* Ajout des logos en bas de la carte */}
                        <View style={styles.logoContainer}>
                            <TouchableOpacity>
                                <Image source={spotifyLogo} style={styles.logo} />
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Image source={deezerLogo} style={styles.logo} />
                            </TouchableOpacity>
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
    infoContainer: {
        flexDirection: 'row',
        gap: 7,
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
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: '100%',
        marginVertical: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    notificationButton: {
        position: 'absolute',
        right: 0,
    },
    notificationIcon: {
        padding: 5,
    },
    favButton: {
        position: 'absolute',
        right: 40,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
        backgroundColor: '#d0e9f2',
        padding: 5,
        paddingRight: 10,
        borderRadius: 5,
    },
    timeText: {
        fontSize: 16,
        marginLeft: 10,
        color: '#000',
    },
    descriptionRow: {
        flexDirection: 'column',
        alignItems: 'flex-start',
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
    mainContainer: {
        flex: 1,
        paddingTop: 70,
        alignItems: 'center',
        backgroundColor: '#14cbc4',
    },
    logoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        marginBottom:10,
        width: '100%',
    },
    logo: {
        width: 50,
        height: 50,
    },
});

export default EventDetailScreen;
