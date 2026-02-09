// src/components/animales/AnimalFormDialog.jsx (ACTUALIZADO FASE 9)
import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Grid, FormControl, InputLabel, Select,
    Alert, CircularProgress, Box
} from '@mui/material';

const initialFormState = {
    codigo_arete: '',
    nombre_alias: '',
    especie_id: '',
    raza_id: '',
    sexo: '',
    fecha_nacimiento: '',
    ubicacion_actual_id: '',
    origen: ''
};

// NUEVO FASE 9: Agregamos la prop 'animalToEdit' y renombramos 'onAnimalCreated' a 'onAnimalSaved'
function AnimalFormDialog({ open, onClose, onAnimalSaved, animalToEdit }) {
    const [formData, setFormData] = useState(initialFormState);
    const [especies, setEspecies] = useState([]);
    const [razas, setRazas] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [loadingCatalogos, setLoadingCatalogos] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // NUEVO FASE 9: Determinar si estamos en modo edición
    const isEditMode = !!animalToEdit; // true si animalToEdit tiene datos, false si es null/undefined

    useEffect(() => {
        if (open) {
            // 1. Cargar catálogos (siempre necesario)
            const fetchCatalogos = async () => {
                setLoadingCatalogos(true);
                try {
                    const [espRes, razRes, ubiRes] = await Promise.all([
                        api.get('/especies'),
                        api.get('/razas'),
                        api.get('/ubicaciones')
                    ]);
                    setEspecies(espRes.data);
                    setRazas(razRes.data);
                    setUbicaciones(ubiRes.data);
                } catch (error) {
                    console.error("Error cargando catálogos:", error);
                    setErrorMessage("Error al cargar listas desplegables.");
                } finally {
                    setLoadingCatalogos(false);
                }
            };
            fetchCatalogos();
            setErrorMessage('');

            // NUEVO FASE 9: 2. Configurar el formulario (Crear vs Editar)
            if (isEditMode) {
                // Modo Edición: Pre-llenar el formulario con los datos del animal
                // Importante: Las fechas de MySQL vienen en formato largo, hay que cortarlas a YYYY-MM-DD para el input type="date"
                const formattedDate = animalToEdit.fecha_nacimiento ? animalToEdit.fecha_nacimiento.split('T')[0] : '';
                
                setFormData({
                    codigo_arete: animalToEdit.codigo_arete,
                    nombre_alias: animalToEdit.nombre_alias || '',
                    especie_id: animalToEdit.especie_id || '', // Usamos los IDs crudos que vienen del backend
                    raza_id: animalToEdit.raza_id || '',
                    sexo: animalToEdit.sexo,
                    fecha_nacimiento: formattedDate,
                    ubicacion_actual_id: animalToEdit.ubicacion_actual_id || '',
                    origen: animalToEdit.origen || ''
                });
            } else {
                // Modo Crear: Resetear a blanco
                setFormData(initialFormState);
            }
        }
    }, [open, animalToEdit, isEditMode]); // Se ejecuta cuando se abre o cambia el animal a editar

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'especie_id') { setFormData(prev => ({ ...prev, raza_id: '' })); }
    };

    const handleSubmit = async () => {
        if (!formData.codigo_arete || !formData.especie_id || !formData.sexo) {
            setErrorMessage('Por favor complete los campos obligatorios (*)');
            return;
        }

        setSubmitting(true);
        setErrorMessage('');
        try {
            // NUEVO FASE 9: Decidir si es POST (Crear) o PUT (Editar)
            if (isEditMode) {
                // Editar: Usamos PUT y la URL con el ID
                await api.put(`/animales/${animalToEdit.animal_id}`, formData);
            } else {
                // Crear: Usamos POST a la raíz
                await api.post('/animales', formData);
            }
            
            onAnimalSaved(); // Avisamos a la lista
            onClose();
        } catch (error) {
            console.error("Error guardando animal:", error);
            const msg = error.response?.data?.error || 'Error al guardar el animal.';
            setErrorMessage(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // Filtrar razas (igual que antes)
    // Nota: Asegúrate de que el backend en getAnimales devuelva especie_id y raza_id numéricos, no solo los nombres.
    // Si no, el filtrado y el pre-llenado de los selects fallará.
    const razasFiltradas = razas.filter(r => r.especie_id === (isEditMode ? animalToEdit.especie_id : formData.especie_id));


    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            {/* NUEVO FASE 9: Título dinámico */}
            <DialogTitle>{isEditMode ? `Editar Animal: ${animalToEdit.codigo_arete}` : 'Registrar Nuevo Animal'}</DialogTitle>
            <DialogContent dividers>
                {loadingCatalogos ? (
                    <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
                ) : (
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {errorMessage && <Grid item xs={12}><Alert severity="error">{errorMessage}</Alert></Grid>}
                        
                        {/* Los campos del formulario son los mismos... */}
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth required label="Código de Arete" name="codigo_arete" value={formData.codigo_arete} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Alias / Nombre" name="nombre_alias" value={formData.nombre_alias} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth required>
                                <InputLabel>Especie</InputLabel>
                                {/* Importante: El value debe coincidir con el tipo de dato de los IDs en el catálogo (números) */}
                                <Select name="especie_id" value={formData.especie_id} label="Especie" onChange={handleChange}>
                                    {especies.map(e => <MenuItem key={e.especie_id} value={e.especie_id}>{e.nombre}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth disabled={!formData.especie_id && !isEditMode}>
                                <InputLabel>Raza</InputLabel>
                                <Select name="raza_id" value={formData.raza_id} label="Raza" onChange={handleChange}>
                                    {razasFiltradas.map(r => <MenuItem key={r.raza_id} value={r.raza_id}>{r.nombre}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth required>
                                <InputLabel>Sexo</InputLabel>
                                <Select name="sexo" value={formData.sexo} label="Sexo" onChange={handleChange}>
                                    <MenuItem value="H">Hembra</MenuItem>
                                    <MenuItem value="M">Macho</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="date" label="Fecha de Nacimiento" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Ubicación Actual</InputLabel>
                                <Select name="ubicacion_actual_id" value={formData.ubicacion_actual_id} label="Ubicación Actual" onChange={handleChange}>
                                    {ubicaciones.map(u => <MenuItem key={u.ubicacion_id} value={u.ubicacion_id}>{u.nombre}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                         <Grid item xs={12}>
                            <TextField fullWidth label="Origen" name="origen" value={formData.origen} onChange={handleChange} />
                        </Grid>
                    </Grid>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary" disabled={submitting}>Cancelar</Button>
                {/* NUEVO FASE 9: Texto del botón dinámico */}
                <Button onClick={handleSubmit} variant="contained" color="primary" disabled={submitting || loadingCatalogos}>
                    {submitting ? <CircularProgress size={24} /> : (isEditMode ? 'Actualizar Datos' : 'Guardar Animal')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AnimalFormDialog;