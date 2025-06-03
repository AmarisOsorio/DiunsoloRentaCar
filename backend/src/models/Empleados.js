/*
    Fields:
        nombre: String,
        correo: String,
        contraseña: String,
        DUI: String,
        telefono: String,
        rol: String
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const empleadosSchema = new Schema({
    nombre: {
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

    DUI: {
        type: String,
        required: true,
        unique: true
    },

    telefono: {
        type: String,
        required: true
    },

    rol: {
        type: String,
        required: true,
        enum: ["Administrador", "Gestor", "Empleado"]
    }
}, {
    timestamps: true,
    strict: false
});

//Export
export default model("Empleados", empleadosSchema);