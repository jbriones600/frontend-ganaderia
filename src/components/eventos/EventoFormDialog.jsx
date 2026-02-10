// src/components/eventos/EventoFormDialog.jsx
import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Grid, FormControl, InputLabel, Select,
    Alert, CircularProgress, InputAdornment, Box
} from '@mui/material';

const initialFormState = {
    tipo_evento_id: '',
    fecha_evento: new Date().toISOString().split('T')[0], // Fecha de hoy por defecto
    descripcion: '',
    costo_asociado: ''
};

function EventoFormDialog({ open, onClose, onEventSaved, animalId }) {
    const [formData, setFormData] = useState(initialFormState);
    const [tiposEvento, setTiposEvento] = useState([]);
    const [loadingTipos, setLoadingTipos] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Cargar el catálogo de tipos de evento al abrir el diálogo
    useEffect(() => {
        if (open) {
            setFormData(initialFormState); // Resetear formulario
            setErrorMessage('');
            const fetchTipos = async () => {
                setLoadingTipos(true);
                try {
                    const response = await api.get('/tipos-evento');
                    setTiposEvento(response.data);
                } catch (error) {
                    console.error("Error cargando tipos de evento:", error);
                    setErrorMessage("Error al cargar los tipos de evento.");
                } finally {
                    setLoadingTipos(false);
                }
            };
            fetchTipos();
        }
    }, [open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.tipo_evento_id || !formData.fecha_evento) {
            setErrorMessage('El tipo de evento y la fecha son obligatorios.');
            return;
        }

        setSubmitting(true);
        setErrorMessage('');
        try {
            // Preparamos el payload, asegurando que el costo sea un número o 0
            const payload = {
                ...formData,
                animal_id: animalId, // Importante: asociar al animal actual
                costo_asociado: formData.costo_asociado || 0,
                // Por ahora, no enviamos realizado_por_id hasta tener autenticación de usuarios
            };

            await api.post('/eventos', payload);
            onEventSaved(); // Avisar al padre que se guardó exitosamente
            onClose();
        } catch (error) {
            console.error("Error guardando evento:", error);
            setErrorMessage('Error al registrar el evento.');
        } finally {
            setSubmitting(false);
        }
    };

    // Agrupar tipos de evento por categoría para el Select
    const tiposAgrupados = tiposEvento.reduce((acc, tipo) => {
        const cat = tipo.categoria;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(tipo);
        return acc;
    }, {});

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Registrar Nuevo Evento</DialogTitle>
            <DialogContent dividers>
                {loadingTipos ? (
                    <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
                ) : (
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {errorMessage && <Grid item xs={12}><Alert severity="error">{errorMessage}</Alert></Grid>}
                        
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Tipo de Evento</InputLabel>
                                <Select
                                    name="tipo_evento_id"
                                    value={formData.tipo_evento_id}
                                    label="Tipo de Evento"
                                    onChange={handleChange}
                                >
                                    {/* Renderizar opciones agrupadas */}
                                    {Object.entries(tiposAgrupados).map(([categoria, tipos]) => [
                                        <MenuItem key={`cat-${categoria}`} disabled sx={{ fontWeight: 'bold', backgroundColor: '#f0f0f0', opacity: 1 }}>
                                            --- {categoria} ---
                                        </MenuItem>,
                                        ...tipos.map(t => (
                                            <MenuItem key={t.tipo_evento_id} value={t.tipo_evento_id} sx={{ pl: 4 }}>
                                                {t.nombre}
                                            </MenuItem>
                                        ))
                                    ])}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                type="date"
                                label="Fecha del Evento"
                                name="fecha_evento"
                                value={formData.fecha_evento}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Costo Asociado"
                                name="costo_asociado"
                                type="number"
                                value={formData.costo_asociado}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Descripción / Notas Adicionales"
                                name="descripcion"
                                multiline
                                rows={3}
                                value={formData.descripcion}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary" disabled={submitting}>Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary" disabled={submitting || loadingTipos}>
                    {submitting ? <CircularProgress size={24} /> : 'Guardar Evento'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default EventoFormDialog;