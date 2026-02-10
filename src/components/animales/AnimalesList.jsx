// src/components/animales/AnimalesList.jsx (ACTUALIZADO FASE 11)
import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axiosConfig';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, CircularProgress, Box, Chip, Button,
    IconButton, Tooltip, Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility'; // <-- NUEVO FASE 11: Icono de ojo
import AnimalFormDialog from './AnimalFormDialog';
import AnimalDetailsDialog from './AnimalDetailsDialog'; // <-- NUEVO FASE 11: Importar el diálogo de detalles

function AnimalesList() {
    const [animales, setAnimales] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estados para el diálogo de Crear/Editar
    const [openFormDialog, setOpenFormDialog] = useState(false);
    const [selectedAnimalForEdit, setSelectedAnimalForEdit] = useState(null);

    // NUEVO FASE 11: Estados para el diálogo de Detalles
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [selectedAnimalForDetails, setSelectedAnimalForDetails] = useState(null);

    const fetchAnimales = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/animales');
            setAnimales(response.data);
        } catch (error) {
            console.error("Error cargando animales:", error);
            alert("Error al cargar la lista de animales");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAnimales(); }, [fetchAnimales]);

    const handleAnimalSaved = () => { fetchAnimales(); };

    // Funciones para el formulario (Crear/Editar)
    const handleOpenCreate = () => {
        setSelectedAnimalForEdit(null);
        setOpenFormDialog(true);
    };
    const handleOpenEdit = (animal) => {
        setSelectedAnimalForEdit(animal);
        setOpenFormDialog(true);
    };

    // NUEVO FASE 11: Función para abrir detalles
    const handleOpenDetails = (animal) => {
        setSelectedAnimalForDetails(animal);
        setOpenDetailsDialog(true);
    };

    const handleDelete = async (id, arete) => {
         if (window.confirm(`¿Estás seguro de que deseas dar de baja al animal con arete ${arete}?`)) {
            try {
                await api.delete(`/animales/${id}`);
                fetchAnimales();
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("Error al intentar dar de baja el animal.");
            }
        }
    };

    if (loading && animales.length === 0) { return <Box display="flex" justifyContent="center" m={5}><CircularProgress /></Box>; }

    return (
        <>
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Box sx={{ padding: 2, backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="div">Inventario de Animales Activos ({animales.length})</Typography>
                    <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                        Nuevo Animal
                    </Button>
                </Box>
                
                <Table sx={{ minWidth: 650 }} aria-label="tabla de animales">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                            <TableCell><strong>Arete</strong></TableCell>
                            <TableCell><strong>Alias</strong></TableCell>
                            <TableCell><strong>Especie</strong></TableCell>
                            <TableCell><strong>Raza</strong></TableCell>
                            <TableCell align="center"><strong>Sexo</strong></TableCell>
                            <TableCell><strong>Ubicación</strong></TableCell>
                            <TableCell align="center"><strong>Acciones</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {animales.map((animal) => (
                            <TableRow key={animal.animal_id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#f9f9f9' } }}>
                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', color: '#1976d2' }}>{animal.codigo_arete}</TableCell>
                                <TableCell>{animal.nombre_alias || '-'}</TableCell>
                                <TableCell>{animal.especie_nombre}</TableCell>
                                <TableCell>{animal.raza_nombre || '-'}</TableCell>
                                <TableCell align="center"><Chip label={animal.sexo === 'H' ? 'Hembra' : 'Macho'} color={animal.sexo === 'H' ? 'secondary' : 'primary'} size="small" variant="outlined"/></TableCell>
                                <TableCell>{animal.ubicacion_nombre || 'Sin asignar'}</TableCell>
                                
                                <TableCell align="center">
                                    <Stack direction="row" spacing={1} justifyContent="center">
                                        {/* NUEVO FASE 11: Botón de Ver Detalles */}
                                        <Tooltip title="Ver Detalles e Historial">
                                            <IconButton color="info" onClick={() => handleOpenDetails(animal)}>
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
                                        
                                        <Tooltip title="Editar">
                                            <IconButton color="primary" onClick={() => handleOpenEdit(animal)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Dar de baja">
                                            <IconButton color="error" onClick={() => handleDelete(animal.animal_id, animal.codigo_arete)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                        {animales.length === 0 && !loading && (<TableRow><TableCell colSpan={7} align="center" sx={{ py: 3 }}>No hay animales activos registrados.</TableCell></TableRow>)}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Diálogo de Formulario (Crear/Editar) */}
            <AnimalFormDialog 
                open={openFormDialog} 
                onClose={() => setOpenFormDialog(false)} 
                onAnimalSaved={handleAnimalSaved}
                animalToEdit={selectedAnimalForEdit}
            />

            {/* NUEVO FASE 11: Diálogo de Detalles */}
            <AnimalDetailsDialog
                open={openDetailsDialog}
                onClose={() => setOpenDetailsDialog(false)}
                animal={selectedAnimalForDetails}
            />
        </>
    );
}

export default AnimalesList;