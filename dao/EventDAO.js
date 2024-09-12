import axios from 'axios';

const url = "https://fesipopapi.onrender.com/"
export const getDataFromAPI = () => axios.get(`${url}/evenements`).then(res => res.data);

export const getEventByIdFromAPI = (id) => {
    return axios.get(`${url}/evenements/${id}`)
        .then(res => res.data)
        .catch(error => {
            console.error(`Erreur lors de la récupération de l'événement avec ID: ${id}`, error);
            throw error;
        });
};

export const getDetailByEventId = (id) => {
    return axios.get(`${url}/descriptions/${id}`)
        .then(res => res.data)
        .catch(error => {
            console.error(`Erreur lors de la récupération de l'événement avec ID: ${id}`, error);
            throw error;
        });
};



