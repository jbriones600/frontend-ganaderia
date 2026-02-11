// src/components/produccion/ProduccionFormDialog.jsx
import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Grid, FormControl, InputLabel, Select, MenuItem,
    Alert, CircularProgress, InputAdornment
} from '@mui/material';

const initialFormState = {
    fecha_produccion: new Date().toISOString().split('T')[0], // Fecha de hoy
    jornada: 'Mañana', // Valor por defecto
    litros: ''
};

function ProduccionFormDialog({ open, onClose, onProduccionSaved, animalId }) {
    const [formData, setFormData] = useState(initialFormState);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Resetear formulario cada vez que se abre
    useEffect(() => {
        if (open) {
            setFormData(initialFormState);
            setErrorMessage('');
        }
    }, [open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        // Validaciones
        if (!formData.fecha_produccion || !formData.jornada || !formData.litros) {
            setErrorMessage('Todos los campos son obligatorios.');
            return;
        }
        if (parseFloat(formData.litros) <= 0) {
            setErrorMessage('La cantidad de litros debe ser mayor a 0.');
            return;
        }

        setSubmitting(true);
        setErrorMessage('');
        try {
            const payload = {
                ...formData,
                animal_id: animalId,
                litros: parseFloat(formData.litros) // Asegurar que sea número
            };

            await api.post('/produccion', payload);
            onProduccionSaved(); // Avisar para recargar historial
            onClose();
        } catch (error) {
            console.error("Error guardando producción:", error);
            setErrorMessage('Error al registrar el ordeño.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Registrar Ordeño</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {errorMessage && <Grid item xs={12}><Alert severity="error">{errorMessage}</Alert></Grid>}
                    
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth required type="date" label="Fecha" name="fecha_produccion"
                            value={formData.fecha_produccion} onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required>
                            <InputLabel>Jornada</InputLabel>
                            <Select name="jornada" value={formData.jornada} label="Jornada" onChange={handleChange}>
                                <MenuItem value="Mañana">Mañana</MenuItem>
                                <MenuItem value="Tarde">Tarde</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth required label="Litros Producidos" name="litros" type="number"
                            value={formData.litros} onChange={handleChange}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">L</InputAdornment>,
                                inputProps: { min: 0, step: 0.1 } // Permitir decimales
                            }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary" disabled={submitting}>Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary" disabled={submitting}>
                    {submitting ? <CircularProgress size={24} /> : 'Guardar Registro'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ProduccionFormDialog;