/*
    Fields:
        nombre_completo (string),
        correo_electronico (string),
        contraseña (string),
        telefono (string),
        dui (string),
        rol (string: "Empleado,Gestor,Admin")
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const empleadosSchema = new Schema({
    nombreCompleto: {
        type: String,
        required: true
    },

    correoElectronico: {
        type: String,
        required: true,
        unique: true
    },

    contrasena: {
        type: String,
        required: true
    },

    dui: {
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