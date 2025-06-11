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
    carId: {
        type: String,
        required: true
    },
    tipoMantenimiento: {
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
        enum: ["Pendiente", "Activo", "Finalizado"],
        default: "Pendiente"
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    strict: false
});

//Export
export default model("Mantenimientos", mantenimientosSchema);