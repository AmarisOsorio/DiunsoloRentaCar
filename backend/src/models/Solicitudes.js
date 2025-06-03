/*
    Fields:
        Id_Empleado: String,
        id_Reserva: String,
        estadoSolicitud: String
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const solicitudesSchema = new Schema({
    Id_Empleado: {
        type: String,
        required: true
    },

    id_Reserva: {
        type: String,
        required: true
    },

    estadoSolicitud: {
        type: String,
        required: true,
        enum: ["En Proceso", "Aprobada", "Rechazada"]
    }
}, {
    timestamps: true,
    strict: false
});

//Export
export default model("Solicitudes", solicitudesSchema);