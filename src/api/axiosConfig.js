// src/api/axiosConfig.js
import axios from 'axios';

// Creamos una instancia de axios con la URL base de nuestro backend.
// Si en el futuro cambias el puerto del backend o lo subes a un servidor real,
// solo tienes que cambiar esta línea.
const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

export default api;