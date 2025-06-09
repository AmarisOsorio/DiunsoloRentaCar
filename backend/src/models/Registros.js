/*
    Fields:
        id_reservacion: (String),
        id_empleado: (String),
        accion: (String),
        fecha: (Date)
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const registrosSchema = new Schema({
    id_reservacion: {
        type: String,
        required: true
    },
    id_empleado: {
        type: String,
        required: true
    },
    accion: {
        type: String,
        required: true
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
export default model("Registros", registrosSchema);