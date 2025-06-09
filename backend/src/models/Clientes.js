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
    nombre_completo: {
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
    fecha_de_nacimiento: {
        type: Date,
        required: true
    },
    pasaporte_dui: {
        type: String, // Cambiado de Buffer a String (URL)
        required: false
    },
    licencia: {
        type: String, // Cambiado de Buffer a String (URL)
        required: false,
    },
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