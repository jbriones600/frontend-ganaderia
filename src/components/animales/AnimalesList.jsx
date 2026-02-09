// src/components/animales/AnimalesList.jsx (ACTUALIZADO FASE 9)
import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axiosConfig';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, CircularProgress, Box, Chip, Button,
    IconButton, Tooltip, Stack // <-- Importamos Stack para agrupar botones
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; // <-- NUEVO FASE 9: Icono de lápiz
import AnimalFormDialog from './AnimalFormDialog';

function AnimalesList() {
    const [animales, setAnimales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    
    // NUEVO FASE 9: Estado para guardar el animal que se va a editar
    const [selectedAnimal, setSelectedAnimal] = useState(null);

    const fetchAnimales = useCallback(async () => {
        // ... (código de fetchAnimales igual que antes) ...
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

    // Renombramos la función para que sea más genérica
    const handleAnimalSaved = () => {
        fetchAnimales();
    };

    // NUEVO FASE 9: Funciones para abrir el modal en modo Crear o Editar
    const handleOpenCreate = () => {
        setSelectedAnimal(null); // Aseguramos que no haya animal seleccionado
        setOpenDialog(true);
    };

    const handleOpenEdit = (animal) => {
        setSelectedAnimal(animal); // Guardamos el animal completo que se va a editar
        setOpenDialog(true);
    };

    const handleDelete = async (id, arete) => {
        // ... (código de handleDelete igual que antes) ...
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
                    {/* Usamos la nueva función handleOpenCreate */}
                    <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                        Nuevo Animal
                    </Button>
                </Box>
                
                <Table sx={{ minWidth: 650 }} aria-label="tabla de animales">
                    {/* ... (TableHead igual que antes) ... */}
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
                                {/* ... (Celdas de datos iguales que antes) ... */}
                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', color: '#1976d2' }}>{animal.codigo_arete}</TableCell>
                                <TableCell>{animal.nombre_alias || '-'}</TableCell>
                                <TableCell>{animal.especie_nombre}</TableCell>
                                <TableCell>{animal.raza_nombre || '-'}</TableCell>
                                <TableCell align="center"><Chip label={animal.sexo === 'H' ? 'Hembra' : 'Macho'} color={animal.sexo === 'H' ? 'secondary' : 'primary'} size="small" variant="outlined"/></TableCell>
                                <TableCell>{animal.ubicacion_nombre || 'Sin asignar'}</TableCell>
                                
                                {/* NUEVO FASE 9: Columna de Acciones con Editar y Eliminar */}
                                <TableCell align="center">
                                    <Stack direction="row" spacing={1} justifyContent="center">
                                        <Tooltip title="Editar">
                                            <IconButton 
                                                color="primary" 
                                                onClick={() => handleOpenEdit(animal)} // Pasamos el objeto animal completo
                                            >
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

            {/* NUEVO FASE 9: Pasamos la prop animalToEdit al formulario */}
            <AnimalFormDialog 
                open={openDialog} 
                onClose={() => setOpenDialog(false)} 
                onAnimalSaved={handleAnimalSaved} // Nombre actualizado de la prop
                animalToEdit={selectedAnimal}     // <-- ¡AQUÍ PASAMOS EL ANIMAL A EDITAR!
            />
        </>
    );
}

export default AnimalesList;