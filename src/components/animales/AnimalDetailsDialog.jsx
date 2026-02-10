// src/components/animales/AnimalDetailsDialog.jsx
import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Grid, Box, Chip, Divider
} from '@mui/material';
import HistorialEventos from '../eventos/HistorialEventos'; // Importamos el componente que acabamos de crear
import EventoFormDialog from '../eventos/EventoFormDialog';

function AnimalDetailsDialog({ open, onClose, animal }) {

    const [openEventForm, setOpenEventForm] = useState(false);  
    const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

    console.log("Renderizando AnimalDetailsDialog. Estado del formulario:", openEventForm);

    if (!animal) return null; // Si no hay animal seleccionado, no renderiza nada

    // Calcular edad aproximada (simple)
    const calcularEdad = (fechaNac) => {
        if (!fechaNac) return 'Desconocida';
        const hoy = new Date();
        const nacimiento = new Date(fechaNac);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return `${edad} años`;
    };

    const handleEventSavedSuccess = () => {  
        // Incrementamos el contador para forzar la recarga del historial  
        setHistoryRefreshTrigger(prev => prev + 1);  
    };

    return (
        <>
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ backgroundColor: '#1976d2', color: 'white' }}>
                Detalles del Animal: {animal.codigo_arete}
            </DialogTitle>
            <DialogContent dividers>
                {/* --- Sección 1: Datos Generales --- */}
                <Box mb={3}>
                    <Typography variant="h6" gutterBottom>Información General</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={4}><Typography variant="subtitle2">Alias:</Typography> {animal.nombre_alias || '-'}</Grid>
                        <Grid item xs={6} sm={4}><Typography variant="subtitle2">Especie:</Typography> {animal.especie_nombre}</Grid>
                        <Grid item xs={6} sm={4}><Typography variant="subtitle2">Raza:</Typography> {animal.raza_nombre || '-'}</Grid>
                        <Grid item xs={6} sm={4}>
                            <Typography variant="subtitle2">Sexo:</Typography> 
                            <Chip label={animal.sexo === 'H' ? 'Hembra' : 'Macho'} color={animal.sexo === 'H' ? 'secondary' : 'primary'} size="small" sx={{ ml: 1 }}/>
                        </Grid>
                        <Grid item xs={6} sm={4}><Typography variant="subtitle2">Edad:</Typography> {calcularEdad(animal.fecha_nacimiento)}</Grid>
                        <Grid item xs={6} sm={4}><Typography variant="subtitle2">Ubicación:</Typography> {animal.ubicacion_nombre}</Grid>
                        <Grid item xs={12}><Typography variant="subtitle2">Origen:</Typography> {animal.origen || '-'}</Grid>
                    </Grid>
                </Box>
                
                <Divider />
                
                {/* --- Sección 2: Historial de Eventos --- */}
                <Box mt={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Historial Clínico y Reproductivo</Typography>
                        {/* Aquí pondremos el botón para agregar nuevo evento más adelante */}
                        <Button variant="outlined" size="small" onClick={() =>{console.log("¡Botón Registrar Evento clickeado!");
                             setOpenEventForm(true)}}>Registrar Evento</Button>
                    </Box>
                    
                    {/* Aquí usamos el componente de historial */}
                    <HistorialEventos animalId={animal.animal_id} 
                    refreshTrigger={historyRefreshTrigger}
                    />
                    
                </Box>

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">Cerrar</Button>
            </DialogActions>

        </Dialog>

        <EventoFormDialog   
                open={openEventForm}  
                onClose={() => setOpenEventForm(false)}  
                animalId={animal.animal_id}  
                onEventSaved={handleEventSavedSuccess}  
            />
         

        </>
    );
}

export default AnimalDetailsDialog;