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
        type: Buffer,
        required: false
    },
    licencia: {
        type: Buffer,
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