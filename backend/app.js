import express from "express";
import cookieParser from "cookie-parser";
import registerClients from "./src/routes/registerClients.js";
import loginRoutes from "./src/routes/login.js";
import logoutRoutes from "./src/routes/logout.js";
import passwordRecoveryRoutes from "./src/routes/passwordRecovery.js";
import clientsRoutes from "./src/routes/clients.js";
import { fileURLToPath } from 'url';
import path from 'path';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cookieParser());

// Servir la carpeta uploads como estática
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

app.use("/api/registerClients", registerClients);
app.use("/api/login", loginRoutes);
app.use("/api/logout", logoutRoutes);
app.use("/api/passwordRecovery", passwordRecoveryRoutes);
app.use("/api/clients", clientsRoutes);

export default app;
