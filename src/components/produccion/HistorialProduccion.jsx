// src/components/produccion/HistorialProduccion.jsx
import { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, CircularProgress, Box, Chip
} from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop'; // Icono para leche

function HistorialProduccion({ animalId, refreshTrigger }) {
    const [produccion, setProduccion] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalLitros, setTotalLitros] = useState(0);

    useEffect(() => {
        const fetchProduccion = async () => {
            if (!animalId) return;
            if (produccion.length === 0) setLoading(true);
            try {
                const response = await api.get(`/produccion/animal/${animalId}`);
                setProduccion(response.data);
                // Calcular total histórico
                const total = response.data.reduce((sum, item) => sum + parseFloat(item.litros), 0);
                setTotalLitros(total.toFixed(1)); // Redondear a 1 decimal
            } catch (error) {
                console.error("Error cargando producción:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduccion();
    }, [animalId, refreshTrigger]);

    if (loading && produccion.length === 0) {
        return <Box display="flex" justifyContent="center" p={2}><CircularProgress size={30} /></Box>;
    }

    if (produccion.length === 0) {
        return <Typography variant="body2" color="textSecondary" align="center" p={2}>No hay registros de producción para este animal.</Typography>;
    }

    return (
        <Box>
             <Box display="flex" alignItems="center" mb={2} sx={{ backgroundColor: '#e3f2fd', p: 1, borderRadius: 1 }}>
                <WaterDropIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                    Total Histórico Producido: {totalLitros} Litros
                </Typography>
            </Box>
            <TableContainer component={Paper} variant="outlined">
                <Table size="small" aria-label="tabla de producción">
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell><strong>Fecha</strong></TableCell>
                            <TableCell align="center"><strong>Jornada</strong></TableCell>
                            <TableCell align="right"><strong>Litros</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {produccion.map((item) => (
                            <TableRow key={item.produccion_id} hover>
                                <TableCell>{new Date(item.fecha_produccion).toLocaleDateString()}</TableCell>
                                <TableCell align="center">
                                    <Chip 
                                        label={item.jornada} 
                                        size="small" 
                                        color={item.jornada === 'Mañana' ? 'warning' : 'info'} // Naranja para mañana, azul para tarde
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                    {parseFloat(item.litros).toFixed(1)} L
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default HistorialProduccion;