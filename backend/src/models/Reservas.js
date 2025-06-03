/*
    Fields:
        clientID (string),
        cliente (object){
            nombre (string),
            telefono (string),
            correo_electronico (string)
        },
        carID (string),
        fecha_inicio (date),
        fecha_devolucion (date),
        estado (string: "Pendiente,Activa,Finalizada"),
        precioPorDia (number),
        fecha_creacion (date),
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const reservasSchema = new Schema({
    clientID: {
        type: String,
        required: true
    },
    cliente: {
        nombre: {
            type: String,
            required: true
        },
        telefono: {
            type: String,
            required: true
        },
        correo_electronico: {
            type: String,
            required: true
        }
    },
    carID: {
        type: String,
        required: true
    },
    fecha_inicio: {
        type: Date,
        required: true
    },
    fecha_devolucion: {
        type: Date,
        required: true
    },
    estado: {
        type: String,
        enum: ["Pendiente", "Activa", "Finalizada"],
        default: "Pendiente"
    },
    precioPorDia: {
        type: Number,
        required: true
    }
}, {
    timestamps: true,
    strict: false
});

//Export
export default model("Reservas", reservasSchema);