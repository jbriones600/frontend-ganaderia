// src/components/animales/AnimalDetailsDialog.jsx (ACTUALIZADO FASE 17)
import { useState, useEffect } from 'react'; // <-- Importar useEffect
import api from '../../api/axiosConfig'; // <-- Importar api
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Grid, Box, Chip, Divider, Tabs, Tab, CircularProgress // <-- Importar CircularProgress
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom'; // Icono para genealogía
import HistorialEventos from '../eventos/HistorialEventos';
import EventoFormDialog from '../eventos/EventoFormDialog';
import HistorialProduccion from '../produccion/HistorialProduccion';
import ProduccionFormDialog from '../produccion/ProduccionFormDialog';

function TabPanel(props) { /* ... (código de TabPanel igual que antes) ... */ }

// Componente auxiliar para mostrar un padre/madre
const ParentChip = ({ label, codigo, alias }) => {
    if (!codigo) return <Typography variant="body2" color="textSecondary">Desconocido/a</Typography>;
    const displayText = alias ? `${codigo} (${alias})` : codigo;
    return (
        <Chip 
            icon={<FamilyRestroomIcon />} 
            label={displayText} 
            variant="outlined" 
            color="primary" 
            clickable 
            onClick={() => alert(`Próximamente: Ver detalles de ${displayText}`)} // Placeholder para futura navegación
        />
    );
};

function AnimalDetailsDialog({ open, onClose, animal: initialAnimalData }) {
    // NUEVO FASE 17: Estado para el animal con detalles completos (incluyendo padres)
    const [detailedAnimal, setDetailedAnimal] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const [openEventForm, setOpenEventForm] = useState(false);
    const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
    const [openProduccionForm, setOpenProduccionForm] = useState(false);
    const [produccionRefreshTrigger, setProduccionRefreshTrigger] = useState(0);
    const [tabValue, setTabValue] = useState(0);

    // NUEVO FASE 17: Cargar detalles completos al abrir el diálogo
    useEffect(() => {
        const fetchAnimalDetails = async () => {
            if (open && initialAnimalData?.animal_id) {
                setLoadingDetails(true);
                try {
                    // Llamamos al nuevo endpoint que creamos en el backend
                    const response = await api.get(`/animales/${initialAnimalData.animal_id}`);
                    setDetailedAnimal(response.data);
                } catch (error) {
                    console.error("Error cargando detalles del animal:", error);
                    // Podrías mostrar una alerta aquí
                } finally {
                    setLoadingDetails(false);
                }
            } else {
                setDetailedAnimal(null); // Limpiar al cerrar
            }
        };
        fetchAnimalDetails();
    }, [open, initialAnimalData]);


    if (!initialAnimalData) return null;

    // Usamos detailedAnimal si ya cargó, si no, usamos los datos iniciales mientras tanto
    const animalToShow = detailedAnimal || initialAnimalData;

    const calcularEdad = (fechaNac) => { /* ... (código existente) ... */ };
    const handleTabChange = (event, newValue) => { setTabValue(newValue); };
    const handleEventSavedSuccess = () => { setHistoryRefreshTrigger(prev => prev + 1); };
    const handleProduccionSavedSuccess = () => { setProduccionRefreshTrigger(prev => prev + 1); };

    const especiesLecheras = ['Bovino', 'Caprino', 'Vaca', 'Cabra'];
    const esProductorLeche = animalToShow.sexo === 'H' && especiesLecheras.some(e => animalToShow.especie_nombre?.includes(e));

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{ backgroundColor: '#1976d2', color: 'white' }}>
                    Detalles del Animal: {animalToShow.codigo_arete}
                </DialogTitle>
                <DialogContent dividers sx={{ p: 0 }}>
                    
                    {/* Mostrar spinner mientras carga los detalles completos */}
                    {loadingDetails ? (
                        <Box display="flex" justifyContent="center" p={5}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Box p={3} pb={1}>
                                <Typography variant="h6" gutterBottom>Información General</Typography>
                                <Grid container spacing={2}>
                                    {/* ... (Campos existentes: Alias, Especie, Raza, Sexo, Edad, Ubicación) ... */}
                                    <Grid item xs={6} sm={4}><Typography variant="subtitle2">Alias:</Typography> {animalToShow.nombre_alias || '-'}</Grid>
                                    <Grid item xs={6} sm={4}><Typography variant="subtitle2">Especie:</Typography> {animalToShow.especie_nombre}</Grid>
                                    <Grid item xs={6} sm={4}><Typography variant="subtitle2">Raza:</Typography> {animalToShow.raza_nombre || '-'}</Grid>
                                    <Grid item xs={6} sm={4}><Typography variant="subtitle2">Sexo:</Typography> <Chip label={animalToShow.sexo === 'H' ? 'Hembra' : 'Macho'} color={animalToShow.sexo === 'H' ? 'secondary' : 'primary'} size="small" sx={{ ml: 1 }}/></Grid>
                                    <Grid item xs={6} sm={4}><Typography variant="subtitle2">Edad:</Typography> {calcularEdad(animalToShow.fecha_nacimiento)}</Grid>
                                    <Grid item xs={6} sm={4}><Typography variant="subtitle2">Ubicación:</Typography> {animalToShow.ubicacion_nombre}</Grid>
                                    <Grid item xs={12}><Typography variant="subtitle2">Origen:</Typography> {animalToShow.origen || '-'}</Grid>
                                </Grid>

                                {/* --- NUEVO FASE 17: Sección de Genealogía --- */}
                                <Box mt={3}>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                        <FamilyRestroomIcon sx={{ mr: 1 }} /> Genealogía
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" gutterBottom>Padre:</Typography>
                                            {/* Usamos los nuevos campos que vienen del backend */}
                                            <ParentChip codigo={animalToShow.padre_codigo} alias={animalToShow.padre_alias} />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle2" gutterBottom>Madre:</Typography>
                                            <ParentChip codigo={animalToShow.madre_codigo} alias={animalToShow.madre_alias} />
                                        </Grid>
                                    </Grid>
                                </Box>
                                {/* ------------------------------------------ */}
                            </Box>
                            
                            <Divider />
                            
                            {/* ... (Resto del componente: Tabs de Eventos y Producción IGUAL QUE ANTES) ... */}
                            <Box sx={{ width: '100%' }}>
                                {/* ... */}
                                <TabPanel value={tabValue} index={0}>
                                     {/* ... */}
                                    <HistorialEventos animalId={animalToShow.animal_id} refreshTrigger={historyRefreshTrigger} />
                                </TabPanel>

                                {esProductorLeche && (
                                    <TabPanel value={tabValue} index={1}>
                                         {/* ... */}
                                        <HistorialProduccion animalId={animalToShow.animal_id} refreshTrigger={produccionRefreshTrigger} />
                                    </TabPanel>
                                )}
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary">Cerrar</Button>
                </DialogActions>
            </Dialog>

            {/* Diálogos de formularios (IGUAL QUE ANTES) */}
            <EventoFormDialog open={openEventForm} onClose={() => setOpenEventForm(false)} animalId={animalToShow?.animal_id} onEventSaved={handleEventSavedSuccess} />
            <ProduccionFormDialog open={openProduccionForm} onClose={() => setOpenProduccionForm(false)} animalId={animalToShow?.animal_id} onProduccionSaved={handleProduccionSavedSuccess} />
        </>
    );
}

export default AnimalDetailsDialog;