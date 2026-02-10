// src/components/eventos/HistorialEventos.jsx
import { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import {
    List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography,
    CircularProgress, Box, Divider, Chip
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'; // Icono para Salud
import FavoriteIcon from '@mui/icons-material/Favorite'; // Icono para Reproducción
import EventNoteIcon from '@mui/icons-material/EventNote'; // Icono genérico

// Función auxiliar para elegir el icono y color según la categoría del evento
const getEventIconInfo = (categoria) => {
    switch (categoria) {
        case 'Salud':
            return { icon: <LocalHospitalIcon />, color: '#d32f2f' }; // Rojo
        case 'Reproducción':
            return { icon: <FavoriteIcon />, color: '#c2185b' }; // Rosa fuerte
        default:
            return { icon: <EventNoteIcon />, color: '#757575' }; // Gris
    }
};

function HistorialEventos({ animalId, refreshTrigger }) {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistorial = async () => {
            if (!animalId) return;
            //setLoading(true);
            if (eventos.length === 0) setLoading(true);
            try {
                // Llamamos a la nueva ruta de la API
                const response = await api.get(`/eventos/animal/${animalId}`);
                setEventos(response.data);
            } catch (error) {
                console.error("Error cargando historial:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistorial();
    }, [animalId, refreshTrigger]); // Se ejecuta cada vez que cambia el animalId

    if (loading) {
        return <Box display="flex" justifyContent="center" p={2}><CircularProgress size={30} /></Box>;
    }

    if (eventos.length === 0) {
        return <Typography variant="body2" color="textSecondary" align="center" p={2}>Este animal no tiene eventos registrados.</Typography>;
    }

    return (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {eventos.map((evento, index) => {
                const { icon, color } = getEventIconInfo(evento.tipo_evento_categoria);
                // Formatear la fecha para que se vea bonita (ej: 25/10/2023)
                const fechaFormateada = new Date(evento.fecha_evento).toLocaleDateString();

                return (
                    <div key={evento.evento_id}>
                        <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: color }}>
                                    {icon}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="subtitle1" component="span" fontWeight="bold">
                                            {evento.tipo_evento_nombre}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {fechaFormateada}
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <>
                                        <Typography component="span" variant="body2" color="textPrimary" display="block">
                                            {evento.descripcion || 'Sin descripción adicional.'}
                                        </Typography>
                                        {evento.costo_asociado > 0 && (
                                            <Chip label={`Costo: $${evento.costo_asociado}`} size="small" variant="outlined" sx={{ mt: 1, mr: 1 }} />
                                        )}
                                        {evento.realizado_por_nombre && (
                                            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                                Realizado por: {evento.realizado_por_nombre}
                                            </Typography>
                                        )}
                                    </>
                                }

                                secondaryTypographyProps={{ component: 'div' }}

                            />
                        </ListItem>
                        {/* Agregar un divisor si no es el último elemento */}
                        {index < eventos.length - 1 && <Divider variant="inset" component="li" />}
                    </div>
                );
            })}
        </List>
    );
}

export default HistorialEventos;