/*
    Fields:
        tipoMantenimiento: String,
        fechaInicio: Date,
        fechaFinalizacion: Date,
        idVehiculo: String,
        estado: String,
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const mantenimientosSchema = new Schema({
    tipoMantenimiento: {
        type: String,
        required: true
    },

    fechaInicio: {
        type: Date,
        required: true
    },

    fechaFinalizacion: {
        type: Date,
        required: true
    },

    idVehiculo: {
        type: String,
        required: true
    },

    estado: {
        type: String,
        required: true,
        enum: ["En Proceso", "Finalizado", "Cancelado"]
    }
}, {
    timestamps: true,
    strict: false
});

//Export
export default model("Mantenimientos", mantenimientosSchema);