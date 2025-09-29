// Core modules
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Rutas de autenticación y usuarios
import registerClientsRoutes from "./src/routes/registerClients.js";
import loginRoutes from "./src/routes/login.js";
import logoutRoutes from "./src/routes/logout.js";
import passwordRecoveryRoutes from "./src/routes/passwordRecovery.js";
import profileRoutes from "./src/routes/profile.js";

// Rutas de recursos principales
import clientsRoutes from "./src/routes/clients.js";
import employeesRoutes from "./src/routes/Employees.js";
import vehiclesRoutes from "./src/routes/vehicles.js";
import reservationsRoutes from "./src/routes/reservations.js"; //
import contractsRoutes from "./src/routes/contracts.js";
import maintenancesRoutes from "./src/routes/maintenances.js";//--
import brandsRoutes from "./src/routes/brands.js";
import dashboardRoutes from "./src/routes/DashboardController.js";

// Rutas utilitarias y de comunicación
import sendWelcomeRoutes from "./src/routes/sendWelcome.js";
import contactRoutes from "./src/routes/contact.js";

//Imports para utilizar Swagger
import swaggerUI from "swagger-ui-express"
import fs from "fs";
import path from "path";

const app = express();


// Configuración de CORS para permitir credenciales solo desde los orígenes permitidos
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:19006"],
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(cookieParser());


/**
 * Utilizar el sistema de archivos para leer el JSON
 * de swagger y ver mi documentación
 */
const swaggerDocument = JSON.parse(fs.readFileSync(
  path.resolve("./Documentacion_DiunsoloRentaCar.json"),"utf-8"
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
app.use("/api/dashboard", dashboardRoutes);

app.get('/api/contracts/debug-reservations', contractsRoutes);


// Rutas utilitarias y de comunicación
app.use("/api/sendWelcome", sendWelcomeRoutes);
app.use("/api/contact", contactRoutes);


export default app;