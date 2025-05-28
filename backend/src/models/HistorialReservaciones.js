/*
    Fields:
        idReservacion: String,
        idEmpleado: String,
        accion: String,
        fecha: Date,
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const historialReservacionesSchema = new Schema({
    idReservacion: {
        type: String,
        required: true
    },

    idEmpleado: {
        type: String,
        required: true
    },

    accion: {
        type: String,
        required: true,
        enum: ["Solicitud Aceptada", "Solicitud Rechazada"]
    },

    fecha: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    strict: false
});

//Export
export default model("HistorialReservaciones", historialReservacionesSchema);