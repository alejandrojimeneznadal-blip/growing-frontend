const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde public
app.use(express.static(path.join(__dirname, 'public')));

// API client script
app.get('/js/api-client.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'api-client.js'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Growing Soporte Frontend is running',
        timestamp: new Date().toISOString()
    });
});

// Ruta principal - servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch all - redirigir a index.html (para SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Growing Soporte Frontend running on http://localhost:${PORT}`);
    console.log(`📡 Ready to connect to backend API`);
    console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
});
