import React from 'react';
import * as Notifications from 'expo-notifications';
import logo from "../assets/logo.png";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});


const scheduleNotification = async (heure, event) => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        alert('Permissions de notification refusées');
        return;
    }

    // Assurer que l'heure est au format correct
    const [hours, minutes] = heure.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        alert('Format d\'heure invalide');
        return;
    }

    const notificationTime = new Date();
    notificationTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    if (notificationTime <= now) {
        notificationTime.setDate(now.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
        content: {
            title: `Événement : ${event.artiste?.nom || 'Artiste'}`,
            body: `L'événement commence bientôt à ${heure}.`,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            image: 'https://static.vecteezy.com/system/resources/previews/010/366/202/non_2x/bell-icon-transparent-notification-free-png.png',

        },
        trigger: notificationTime,
    });

    alert('Notification programmée pour ' + notificationTime.toString());
};

export { scheduleNotification };
