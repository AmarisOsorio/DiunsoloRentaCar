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
    clientId: {
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
        correoElectronico: {
            type: String,
            required: true
        }
    },
    carId: {
        type: String,
        required: true
    },
    fechaInicio: {
        type: Date,
        required: true
    },
    fechaDevolucion: {
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