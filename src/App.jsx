// src/App.jsx
import { Container, Typography, Box } from '@mui/material';
import AnimalesList from './components/animales/AnimalesList'; // Importamos el nuevo componente

function App() {
  return (
    // Container centra el contenido y le da márgenes automáticos
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
          Sistema de Gestión Ganadera jbriones
        </Typography>
        
        {/* Aquí cargamos la lista profesional */}
        <AnimalesList />
        
      </Box>
    </Container>
  )
}

export default App
