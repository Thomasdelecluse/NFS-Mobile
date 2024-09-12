import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import {getDetailByEventId, getEventByIdFromAPI} from "../dao/EventDAO";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const EventDetailScreen = ({ route }) => {
    const { eventId } = route.params;
    const [event, setEvent] = useState(null);
    const [eventDetails, setEventDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const eventData = await getEventByIdFromAPI(eventId);
                console.log("Event Data:", eventData);
                setEvent(eventData);
            } catch (err) {
                console.error("Erreur lors de la récupération de l'événement :", err);
                setError('Erreur lors de la récupération des détails de l\'événement.');
            } finally {
                setLoading(false);
            }
        };

        const fetchEventDetails = async () => {
            try {
                const eventDetailsData = await getDetailByEventId(eventId);
                console.log("EventDetails Data:", eventDetailsData);
                setEventDetails(eventDetailsData);
            } catch (err) {
                console.error("Erreur lors de la récupération de l'événement :", err);
                setError('Erreur lors de la récupération des détails de l\'événement.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
        fetchEventDetails();

    }, [eventId]);

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
        <View style={styles.cardContainer}>
            {event && eventDetails ? (
                <>
                    <Image
                        source={{ uri: 'https://cache.marieclaire.fr/data/photo/w1200_h630_ci/6h/mode-kpop.jpg' }} // Remplace par ton URL d'image
                        style={styles.image}
                    />
                    <Text style={styles.title}>{event.artiste?.nom || 'Artiste non disponible'}</Text>

                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={24} color="black" />
                        <Text style={styles.timeText}>{event.lieu || 'Heure non disponible'}</Text>
                    </View>

                    <View style={styles.descriptionRow}>
                        <Text style={styles.descriptionText}>{eventDetails.description || 'Description non disponible'}</Text>
                    </View>
                </>
            ) : (
                <Text style={styles.noEventsText}>Aucun événement trouvé</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
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
        backgroundColor: '#b3e5e8', // Bleu clair pour la carte
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
        backgroundColor: '#d0e9f2', // Légère différence de couleur pour le fond
        padding: 5,
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
        backgroundColor: '#d0e9f2', // Même couleur que pour l'heure
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
});

export default EventDetailScreen;
