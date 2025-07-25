
import mongoose from "mongoose";
import { config } from "./src/config.js";

// Usar config.db.uri (minúscula) y mostrar error si no está definida
const dbUri = config.db.uri;
if (!dbUri) {
  throw new Error("No se ha definido la URI de la base de datos. Verifica tu archivo .env y config.js");
}
mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;

connection.once("open", () => {
  console.log("DB is connected");
});

connection.on("disconnected", () => {
  console.log("DB is disconnected");
});

connection.on("error", (error) => {
  console.log("Error found: " + error);
});
