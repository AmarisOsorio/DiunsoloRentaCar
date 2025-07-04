/*
    Fields:
        nombre_completo (string),
        correo (string: unique),
        contraseña (string),
        telefono (string),
        fecha_de_nacimiento (date),
        pasaporte_dui (String: optional, URL),
        licencia (String: optional, URL),
        isVerified (boolean: default false)
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const clientsSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    apellido: {
        type: String,
        required: true
    },
    correo: {
        type: String,
        required: true,
        unique: true
    },
    contraseña: {
        type: String,
        required: true
    },
    telefono: {
        type: String,
        required: true
    },
    fechaDeNacimiento: {
        type: Date,
        required: true
    },
    // Documentos separados por lado
    licenciaFrente: {
        type: String, // URL del archivo
        required: false
    },
    licenciaReverso: {
        type: String, // URL del archivo
        required: false
    },
    pasaporteFrente: {
        type: String, // URL del archivo
        required: false
    },
    pasaporteReverso: {
        type: String, // URL del archivo
        required: false
    },
    // Eliminados campos legacy: pasaporteDui y licencia. Solo se usan los de frente y reverso.
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    strict: false
});

//Export
export default model("Clientes", clientsSchema, "Clientes");