# Growing Soporte - Frontend

## 🚀 Deploy en EasyPanel

### 1. Configuración en EasyPanel:

**Build Settings:**
- Build Command: `npm install`
- Start Command: `npm start`
- Port: `8080`

**Environment Variables:**
```
NODE_ENV=production
PORT=8080
API_BASE_URL=http://backend:3000/api
```

Reemplaza `backend` con el nombre de tu servicio backend en EasyPanel.

### 2. Acceso:

Una vez desplegado, accede a:
```
http://TU-IP:8080
```

### 3. Login de prueba:

- Admin: `admin@growing.com`
- Usuario: cualquier email

## 📁 Estructura

```
/
├── package.json       # Dependencias
├── server.js         # Servidor Express
├── .env.example      # Variables de ejemplo
└── public/
    ├── index.html    # App principal
    └── api-client.js # Cliente API
```

## 🔧 Desarrollo local

```bash
npm install
npm start
```

Abre: http://localhost:8080
