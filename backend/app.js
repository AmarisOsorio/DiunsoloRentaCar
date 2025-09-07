// Core modules
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// Obtener __dirname para módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas de autenticación y usuarios
import registerClientsRoutes from "./src/routes/registerClients.js";
import loginRoutes from "./src/routes/login.js";
import logoutRoutes from "./src/routes/logout.js";
import passwordRecoveryRoutes from "./src/routes/passwordRecovery.js";
import profileRoutes from "./src/routes/profile.js";

// Rutas de recursos principales
import clientsRoutes from "./src/routes/clients.js";
import employeesRoutes from "./src/routes/Empleados.js";
import vehiclesRoutes from "./src/routes/vehicles.js";
import reservationsRoutes from "./src/routes/reservations.js"; //
import contractsRoutes from "./src/routes/contratos.js";
import maintenancesRoutes from "./src/routes/maintenances.js";//--
import brandsRoutes from "./src/routes/brands.js";

// Rutas utilitarias y de comunicación
import sendWelcomeRoutes from "./src/routes/sendWelcome.js";
import contactRoutes from "./src/routes/contact.js";

//Imports para utilizar Swagger
import swaggerUI from "swagger-ui-express"
const app = express();


// Configuración de CORS para permitir credenciales solo desde los orígenes permitidos
app.use(cors({
  origin: [
    'http://localhost:8081', 
    'http://localhost:4000', 
    'http://127.0.0.1:4000',
    'http://localhost:3000',
    'http://127.0.0.1:8081',
    'http://192.168.0.3:4000',
    'http://192.168.0.3:8081'
  ],
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});


/**
 * Utilizar el sistema de archivos para leer el JSON
 * de swagger y ver mi documentación
 */
const swaggerDocument = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, "./Documentacion_DiunsoloRentaCar.json"),"utf-8"
))
 
//Documentación
app.use("/api/docs" , swaggerUI.serve , swaggerUI.setup(swaggerDocument));


// Rutas de autenticación y usuarios
app.use("/api/registerClients", registerClientsRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/logout", logoutRoutes);
app.use("/api/passwordRecovery", passwordRecoveryRoutes);
app.use("/api/profile", profileRoutes);

// Rutas de recursos principales
app.use("/api/clients", clientsRoutes);
app.use("/api/employees", employeesRoutes);
app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/reservations", reservationsRoutes);//
app.use("/api/contracts", contractsRoutes);
app.use("/api/maintenances", maintenancesRoutes);//--
app.use("/api/brands", brandsRoutes);


// Rutas utilitarias y de comunicación
app.use("/api/sendWelcome", sendWelcomeRoutes);
app.use("/api/contact", contactRoutes);


export default app;