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
import reservasRoutes from "./src/routes/reservas.js";
import contratosRoutes from "./src/routes/contratos.js";
import pdfViewerRoutes from "./src/routes/pdfViewer.js";
import marcasRoutes from "./src/routes/marcas.js";

import EmpleadosRoutes from "./src/routes/Empleados.js";

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
    secure: false,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 30
  }
}));
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/registerClients", registerClients);
app.use("/api/clients", clientsRoutes);
app.use("/api/empleados", EmpleadosRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/logout", logoutRoutes);
app.use("/api/passwordRecovery", passwordRecoveryRoutes);
app.use("/api/sendWelcome", sendWelcome);

app.use("/api/upload", uploadImageRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/marcas", marcasRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/reservas", reservasRoutes);
app.use("/api/contratos", contratosRoutes);
app.use("/api/mantenimientos", mantenimientosRoutes); 
app.use("/api/pdf", pdfViewerRoutes);

export default app;