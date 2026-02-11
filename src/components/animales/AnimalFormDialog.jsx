// src/components/animales/AnimalFormDialog.jsx (ACTUALIZADO FASE 20)
import { useState, useEffect, useRef } from 'react'; // <-- Importar useRef
import api from '../../api/axiosConfig';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Grid, FormControl, InputLabel, Select,
    Alert, CircularProgress, Box, Typography, Divider, Avatar, IconButton // <-- Importar Avatar, IconButton
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera'; // <-- Importar icono de cámara
import DeleteIcon from '@mui/icons-material/Delete'; // <-- Importar icono de borrar

const initialFormState = {
    codigo_arete: '',
    nombre_alias: '',
    especie_id: '',
    raza_id: '',
    sexo: '',
    fecha_nacimiento: '',
    ubicacion_actual_id: '',
    origen: '',
    padre_id: '',
    madre_id: ''
};

function AnimalFormDialog({ open, onClose, onAnimalSaved, animalToEdit }) {
    const [formData, setFormData] = useState(initialFormState);
    const [especies, setEspecies] = useState([]);
    const [razas, setRazas] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [todosLosAnimales, setTodosLosAnimales] = useState([]); 
    
    // --- NUEVO FASE 20: Estados para la foto ---
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null); // Referencia al input oculto
    // -------------------------------------------

    const [loadingData, setLoadingData] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const isEditMode = !!animalToEdit;

    useEffect(() => {
        if (open) {
            setErrorMessage('');
            // Limpiar estados de foto al abrir
            setSelectedFile(null);
            setPreviewUrl(null);

            fetchCatalogos();
            if (isEditMode && animalToEdit) {
                setFormData({
                    codigo_arete: animalToEdit.codigo_arete || '',
                    nombre_alias: animalToEdit.nombre_alias || '',
                    especie_id: animalToEdit.especie_id || '',
                    raza_id: animalToEdit.raza_id || '',
                    sexo: animalToEdit.sexo || '',
                    fecha_nacimiento: animalToEdit.fecha_nacimiento ? animalToEdit.fecha_nacimiento.split('T')[0] : '',
                    ubicacion_actual_id: animalToEdit.ubicacion_actual_id || '',
                    origen: animalToEdit.origen || '',
                    padre_id: animalToEdit.padre_id || '',
                    madre_id: animalToEdit.madre_id || ''
                });
                // Si estamos editando y el animal ya tiene foto, mostrarla en la previsualización
                if (animalToEdit.foto_url) {
                    // Asumimos que la URL base del backend es http://localhost:3000
                    setPreviewUrl(`http://localhost:3000${animalToEdit.foto_url}`);
                }
                if (animalToEdit.especie_id) {  
                    fetchRazas(animalToEdit.especie_id);  
                }
            } else {
                setFormData(initialFormState);
                setRazas([]); // Limpiar razas al crear nuevo
            }
        }
    }, [open, isEditMode, animalToEdit]);

    // ... (fetchCatalogos, handleEspecieChange, handleChange quedan IGUAL) ...
   const fetchCatalogos = async () => {  
        setLoadingData(true);  
        try {  
            // Hacemos las peticiones en paralelo para ser más eficientes  
            const [especiesRes, ubicacionesRes, animalesRes] = await Promise.all([  
                api.get('/especies'),  
                api.get('/ubicaciones'),  
                api.get('/animales') // Para los padres/madres  
            ]);  
            setEspecies(especiesRes.data);  
            setUbicaciones(ubicacionesRes.data);  
            setTodosLosAnimales(animalesRes.data);  
        } catch (error) {  
            console.error("Error al cargar catálogos:", error);  
            setErrorMessage('Error al cargar datos necesarios. Por favor, recargue la página.');  
        } finally {  
            setLoadingData(false);  
        }  
    };  
  
    const fetchRazas = async (especieId) => {  
        if (!especieId) {  
            setRazas([]);  
            return;  
        }  
        try {  
            const response = await api.get(`/razas/${especieId}`);  
            setRazas(response.data);  
        } catch (error) {  
            console.error("Error al cargar razas:", error);  
            // No bloqueamos el flujo, solo no se mostrarán razas  
        }  
    };  
  
    const handleEspecieChange = async (e) => {  
        const especieId = e.target.value;  
        setFormData(prev => ({ ...prev, especie_id: especieId, raza_id: '' })); // Resetear raza al cambiar especie  
        fetchRazas(especieId);  
    };  
  
    const handleChange = (e) => {  
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));  
    };
    // --- NUEVO FASE 20: Manejar selección de archivo ---
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Crear URL temporal para previsualización
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClearPhoto = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    // ---------------------------------------------------

    const handleSubmit = async () => {
        if (!formData.codigo_arete || !formData.especie_id || !formData.sexo || !formData.fecha_nacimiento || !formData.ubicacion_actual_id) {
            setErrorMessage('Por favor complete los campos obligatorios (*).');
            return;
        }

        setSubmitting(true);
        setErrorMessage('');

        // --- NUEVO FASE 20: Usar FormData para enviar archivo y datos ---
        const dataToSend = new FormData();
        // Añadir campos de texto
        Object.keys(formData).forEach(key => {
            // Convertir valores nulos o vacíos a cadenas vacías para que FormData no se queje,
            // o no enviarlos si son nulos (depende de cómo lo maneje el backend, probemos enviando todo)
             dataToSend.append(key, formData[key] === null ? '' : formData[key]);
        });

        // Añadir el archivo si se seleccionó uno nuevo
        if (selectedFile) {
            dataToSend.append('foto', selectedFile); // El nombre 'foto' debe coincidir con upload.single('foto') en el backend
        }
        // ---------------------------------------------------------------

        try {
            // Importante: Al usar FormData, axios configura automáticamente el header 'Content-Type': 'multipart/form-data'
            if (isEditMode) {
                await api.put(`/animales/${animalToEdit.animal_id}`, dataToSend);
            } else {
                await api.post('/animales', dataToSend);
            }
            onAnimalSaved();
            onClose();
        } catch (error) {
            console.error("Error al guardar animal:", error);
            if (error.response && error.response.data && error.response.data.error) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage('Error al guardar el animal. Intente nuevamente.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const posiblesPadres = todosLosAnimales.filter(a => a.sexo === 'M' && (!isEditMode || a.animal_id !== animalToEdit.animal_id));
    const posiblesMadres = todosLosAnimales.filter(a => a.sexo === 'H' && (!isEditMode || a.animal_id !== animalToEdit.animal_id));

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{isEditMode ? 'Editar Animal' : 'Registrar Nuevo Animal'}</DialogTitle>
            <DialogContent dividers>
                {loadingData ? (
                    <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
                ) : (
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {errorMessage && <Grid item xs={12}><Alert severity="error">{errorMessage}</Alert></Grid>}
                        
                        {/* --- NUEVO FASE 20: Sección de Foto --- */}
                        <Grid item xs={12} display="flex" flexDirection="column" alignItems="center" mb={2}>
                            <Box position="relative">
                                <Avatar
                                    src={previewUrl}
                                    sx={{ width: 120, height: 120, mb: 1, border: '2px solid #ccc' }}
                                    variant="rounded"
                                >
                                    {!previewUrl && <PhotoCamera sx={{ fontSize: 60, color: '#ccc' }} />}
                                </Avatar>
                                {previewUrl && (
                                    <IconButton
                                        sx={{ position: 'absolute', top: -10, right: -10, backgroundColor: 'white' }}
                                        size="small"
                                        onClick={handleClearPhoto}
                                    >
                                        <DeleteIcon color="error" fontSize="small" />
                                    </IconButton>
                                )}
                            </Box>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="raised-button-file"
                                type="file"
                                onChange={handleFileSelect}
                                ref={fileInputRef}
                            />
                            <label htmlFor="raised-button-file">
                                <Button variant="outlined" component="span" startIcon={<PhotoCamera />}>
                                    {previewUrl ? 'Cambiar Foto' : 'Subir Foto'}
                                </Button>
                            </label>
                        </Grid>
                        {/* -------------------------------------- */}

                        {/* ... (Resto de campos del formulario: Código, Nombre, Especie, etc. IGUAL QUE ANTES) ... */}
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth required label="Código Arete" name="codigo_arete" value={formData.codigo_arete} onChange={handleChange} disabled={isEditMode} />
                        </Grid>
                        {/* ... (copia el resto de los Grids del código anterior) ... */}
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Nombre / Alias" name="nombre_alias" value={formData.nombre_alias} onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth required><InputLabel>Especie</InputLabel><Select name="especie_id" value={formData.especie_id} label="Especie" onChange={handleEspecieChange}>{especies.map(e => <MenuItem key={e.especie_id} value={e.especie_id}>{e.nombre}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth disabled={!formData.especie_id}><InputLabel>Raza</InputLabel><Select name="raza_id" value={formData.raza_id} label="Raza" onChange={handleChange}><MenuItem value=""><em>Ninguna</em></MenuItem>{razas.map(r => <MenuItem key={r.raza_id} value={r.raza_id}>{r.nombre}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth required><InputLabel>Sexo</InputLabel><Select name="sexo" value={formData.sexo} label="Sexo" onChange={handleChange}><MenuItem value="M">Macho</MenuItem><MenuItem value="H">Hembra</MenuItem></Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth required type="date" label="Fecha Nacimiento" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth required><InputLabel>Ubicación Actual</InputLabel><Select name="ubicacion_actual_id" value={formData.ubicacion_actual_id} label="Ubicación Actual" onChange={handleChange}>{ubicaciones.map(u => <MenuItem key={u.ubicacion_id} value={u.ubicacion_id}>{u.nombre}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Origen (Ej: Compra, Nacimiento)" name="origen" value={formData.origen} onChange={handleChange} /></Grid>

                        <Grid item xs={12}><Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>Genealogía (Opcional)</Typography><Divider /></Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Padre</InputLabel><Select name="padre_id" value={formData.padre_id} label="Padre" onChange={handleChange}><MenuItem value=""><em>Desconocido / Ninguno</em></MenuItem>{posiblesPadres.map(a => (<MenuItem key={a.animal_id} value={a.animal_id}>{a.codigo_arete} {a.nombre_alias ? `(${a.nombre_alias})` : ''} - {a.especie_nombre}</MenuItem>))}</Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Madre</InputLabel><Select name="madre_id" value={formData.madre_id} label="Madre" onChange={handleChange}><MenuItem value=""><em>Desconocida / Ninguna</em></MenuItem>{posiblesMadres.map(a => (<MenuItem key={a.animal_id} value={a.animal_id}>{a.codigo_arete} {a.nombre_alias ? `(${a.nombre_alias})` : ''} - {a.especie_nombre}</MenuItem>))}</Select></FormControl></Grid>

                    </Grid>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary" disabled={submitting}>Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary" disabled={submitting || loadingData}>
                    {submitting ? <CircularProgress size={24} /> : (isEditMode ? 'Actualizar' : 'Registrar')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AnimalFormDialog;