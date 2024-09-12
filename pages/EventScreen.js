import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import EventListScreen from './EventListScreen';
import EventDetailScreen from '../component/EventDetailScreen';

const EventStack = createStackNavigator();

const EventScreen = () => {
    return (
        <EventStack.Navigator screenOptions={{ headerShown: false }}>
            <EventStack.Screen
                name="EventList"
                component={EventListScreen}
            />
            <EventStack.Screen
                name="EventDetailScreen"
                component={EventDetailScreen}
            />
        </EventStack.Navigator>
    );
};

export default EventScreen;
