

import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import registerClients from "./src/routes/registerClients.js";
import loginRoutes from "./src/routes/login.js";
import logoutRoutes from "./src/routes/logout.js";
import passwordRecoveryRoutes from "./src/routes/passwordRecovery.js";
import clientsRoutes from "./src/routes/clients.js";
import mantenimientosRoutes from "./src/routes/mantenimientos.js";
import sendWelcome from "./src/routes/sendWelcome.js";
import uploadImageRoutes from "./src/routes/uploadImage.js";
import vehiclesRoutes from "./src/routes/vehicles.js";

import contactRoutes from "./src/routes/contact.js";
import profileRoutes from "./src/routes/profile.js";
import { fileURLToPath } from 'url';
import path from 'path';
import cors from "cors";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'diunsolo_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Cambia a true si usas HTTPS
    sameSite: 'lax',
    maxAge: 1000 * 60 * 30 // 30 minutos
  }
}));
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));

// Servir la carpeta uploads como estática
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

app.use("/api/registerClients", registerClients);
app.use("/api/login", loginRoutes);
app.use("/api/logout", logoutRoutes);
app.use("/api/passwordRecovery", passwordRecoveryRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/send-welcome", sendWelcome);
app.use("/api/upload", uploadImageRoutes);
app.use("/api", contactRoutes);

app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/profile", profileRoutes);


import reservasRoutes from "./src/routes/reservas.js";
app.use("/api/reservas", reservasRoutes);
app.use("/api/mantenimientos", mantenimientosRoutes); 
export default app;
