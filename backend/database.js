// Importa mongoose para manejar la conexión con MongoDB
import mongoose from "mongoose";
// Importa la configuración de la base de datos desde config.js
import { config } from "./src/config.js";

// Obtiene la URI de la base de datos desde la configuración
const dbUri = config.db.uri;
// Si la URI no está definida, lanza un error para evitar conexiones fallidas
if (!dbUri) {
  throw new Error("No se ha definido la URI de la base de datos. Verifica tu archivo .env y config.js");
}
// Conecta a MongoDB usando la URI y opciones recomendadas
mongoose.connect(dbUri);

// Obtiene la conexión actual de mongoose
const connection = mongoose.connection;

// Evento: conexión exitosa a la base de datos
connection.once("open", () => {
  console.log("DB is connected");
});

// Evento: la base de datos se ha desconectado
connection.on("disconnected", () => {
  console.log("DB is disconnected");
});

// Evento: error en la conexión de la base de datos
connection.on("error", (error) => {
  console.log("Error found: " + error);
});
