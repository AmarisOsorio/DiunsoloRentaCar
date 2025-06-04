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
    nombre_completo: {
        type: String,
        required: true
    },

    correo_electronico: {
        type: String,
        required: true,
        unique: true
    },

    contraseña: {
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