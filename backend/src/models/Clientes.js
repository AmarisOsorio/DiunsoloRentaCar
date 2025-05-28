/*
    Fields:
        documentoDeIdentificacion: String,
        telefono: String,
        fechaDeNacimiento: Date,
        licencia: String,
        contraseña: String,
        correo: String,
        nombre: String,
        verificado: Boolean,
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const clientsSchema = new Schema({
    documentoDeIdentificacion: {
        type: String,
        required: true,
        unique: true
    },

    telefono: {
        type: String,
        required: true,
        unique: true
    },

    fechaDeNacimiento: {
        type: Date,
        required: true
    },

    licencia: {
        type: String,
        required: true,
        unique: true
    },

    contraseña: {
        type: String,
        required: true
    },

    correo: {
        type: String,
        required: true,
        unique: true
    },

    nombre: {
        type: String,
        required: true
    },

    verificado: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    strict: false
});

//Export
export default model("Clients", clientsSchema);