import axios from 'axios';


export const getDataFromAPI = async () => {
    try {
        const response = await axios.get(''); // Remplace par l'URL de ton API
        return response.data; // Retourner les données
    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error.response ? error.response.data : error.message);
        throw error; // Propager l'erreur pour gestion dans le composant appelant
    }
};