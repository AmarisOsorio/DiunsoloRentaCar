# 🚗 Diunsolo Rent a Car

Este proyecto está diseñado para un emprendimiento de **alquileres de vehículos**, en especial a extranjeros y turistas. Cuenta con **2 aplicaciones**:
- Un **sitio web** para los clientes, donde se puede visualizar información del emprendimiento, el catálogo de vehículos disponibles, realizar reservas, etc.
- Una **app móvil** para administradores y empleados, con funcionalidades avanzadas de gestión.

# 💡 Funcionalidades Principales
- Calendario para previsualizar las reservas
- Administrar los contratos de vehículos
- Realizar reservas desde el sitio web
- Catálogo de los vehículos

# 📦 Dependencias principales
- **Backend:** express, mongoose, dotenv, cors, nodemailer, bcryptjs, jsonwebtoken, multer, nodemon
- **Frontend:** react, react-dom, vite, react-router-dom, (y otras según el diseño)

# 📌 Integrantes
- Amaris Osorio
- Eduardo Lima
- Christhian Sánchez
- Edenilson Amaya
- José Irhaeta

---
## 📝 Pasos previos antes de ejecutar el frontend y backend

1. **Clonar el repositorio** (si aún no lo has hecho):
   ```bash
   git clone <url-del-repositorio>
   ```
2. **Configurar variables de entorno:**
   - Entra a la carpeta `backend` y revisa/crea el archivo `.env` con las variables necesarias (DB, JWT, email, Cloudinary, etc).
3. **Instalar dependencias:**
   - Backend:
     ```bash
     cd backend
     npm install
     ```
   - Frontend:
     ```bash
     cd ../frontend
     npm install
     ```
4. **Verificar la configuración de la base de datos:**
   - Asegúrate de que la URI de MongoDB en `.env` sea válida y tengas acceso a internet.
5. **Configurar servicios externos:**
   - Si usas servicios como Cloudinary, revisa que las credenciales sean correctas.
6. **Ejecutar el backend:**
   ```bash
   cd backend
   npm run dev
   ```
7. **Ejecutar el frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
8. **Abrir la app en el navegador:**
   - Por defecto, el frontend suele estar en `http://localhost:5173` o el puerto que indique la terminal.

---
¡Gracias por usar Diunsolo Rent a Car! Si tienes dudas, revisa la documentación o contacta al equipo.
