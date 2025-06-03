/*
    Fields:
        carID (string),
        tipo_mantenimiento (string),
        fecha_inicio (date),
        fecha_devolucion (date),
        estado (string: "Pendiente, Activo, Finalizado"),
        fecha_creacion (date),
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const mantenimientosSchema = new Schema({
    carID: {
        type: String,
        required: true
    },
    tipo_mantenimiento: {
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
        enum: ["Pendiente", "Activo", "Finalizado"],
        default: "Pendiente"
    },
    fecha_creacion: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    strict: false
});

//Export
export default model("Mantenimientos", mantenimientosSchema);