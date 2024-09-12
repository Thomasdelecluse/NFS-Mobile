import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import EventCard from "../component/EventCard";
import backgroundImage from "../assets/icon.png";
import { getEventsFromAPI } from '../dao/EventDAO';
import DateTimePicker from '@react-native-community/datetimepicker';

const EventListScreen = ({ navigation }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [date, setDate] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    const fetchEvents = async (term = '', selectedDate = '') => {
        setLoading(true);
        try {
            let url = '';
            const params = [];

            if (selectedDate) {
                params.push(`date=${selectedDate}`);
            }
            if (term) {
                params.push(`search_term=${encodeURIComponent(term)}`);
            }

            if (params.length > 0) {
                url += '?' + params.join('&');
            }

            const data = await getEventsFromAPI(url);
            setEvents(data);
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
        fetchEvents(searchTerm, date);
    };

    const handleSearch = () => {
        fetchEvents(searchTerm, date);
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setDate(formattedDate);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setDate('');
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
                            tintColor="#000"
                        />
                    }
                >
                    <View style={styles.filterContainer}>
                        <View style={styles.filterRow}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Rechercher..."
                                placeholderTextColor="#333"
                                value={searchTerm}
                                onChangeText={setSearchTerm}
                            />
                            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                                <Text style={styles.dateButtonText}>
                                    {date ? new Date(date).toLocaleDateString('fr-FR') : 'Sélectionner une date'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {showDatePicker && (
                            <DateTimePicker
                                value={date ? new Date(date) : new Date()}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                            />
                        )}

                        <View style={styles.filterActions}>
                            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                                <Text style={styles.searchButtonText}>Filtrer</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                                <Text style={styles.clearButtonText}>Effacer les filtres</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

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
        width: '100%',
        height: '100%',
    },
    overlay: {
        flex: 1,
        paddingVertical: 90,
        paddingHorizontal: 20,
    },
    scrollViewContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    headerText: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
    filterContainer: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#eee',
        color: '#000',
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
    },
    dateButton: {
        backgroundColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        justifyContent: 'center',
    },
    dateButtonText: {
        color: '#000',
    },
    filterActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    searchButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    clearButton: {
        backgroundColor: '#f44336',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        flex: 1,
    },
    clearButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    noEventsText: {
        color: '#fff',
        textAlign: 'center',
        marginTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
    },
});

export default EventListScreen;
