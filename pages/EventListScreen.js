import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import EventCard from "../component/EventCard";
import backgroundImage from "../assets/icon.png";
import { getDataFromAPI } from '../dao/EventDAO';

const EventListScreen = ({ navigation }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchEvents = async () => {
        try {
            const data = await getDataFromAPI();
            setEvents(data);
            console.log(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des événements:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchEvents();
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Chargement des événements...</Text>
            </View>
        );
    }

    return (
        <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
            <View style={styles.overlay}>
                <ScrollView
                    contentContainerStyle={styles.scrollViewContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#fff"
                        />
                    }
                >
                    <Text style={styles.headerText}>EVENEMENTS</Text>

                    {events.length > 0 ? (
                        events.map((event, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => navigation.navigate('EventDetailScreen', { eventId: event.id })}
                            >
                                <EventCard
                                    city={event.lieu || 'Ville inconnue'}
                                    groupName={event.artiste.nom || 'Groupe inconnu'}
                                    imageSource={event.photo}
                                />
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={styles.noEventsText}>Aucun événement trouvé</Text>
                    )}
                </ScrollView>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    overlay: {
        flex: 1,
    },
    scrollViewContainer: {
        paddingVertical: 25,
        paddingHorizontal: 20,
        paddingBottom: 120,
    },
    headerText: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 35,
        marginBottom: 30,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    loadingText: {
        color: 'white',
        fontSize: 18,
        marginTop: 10,
    },
    noEventsText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },
});

export default EventListScreen;
