import axios from 'axios';

const url = "https://fesipopapi.onrender.com/evenements"
export const getDataFromAPI = () => axios.get(url).then(res => res.data);


