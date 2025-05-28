/*
    Fields:
        id_Usuario: String,
        cliente: Object (nombre, correo, telefono),
        id_Vehiculo: String,
        fechaEntrega: Date,
        fechaInicio: Date,
        estado: String,
        precioDia: Number,
        precioTotal: Number,
        id_Contrato: String,
        id_HojaDeEstado: String
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const reservasSchema = new Schema({
    id_Usuario: {
        type: String,
        required: true
    },

    cliente: {
        type: Object,
        required: true,
        properties: {
            nombre: {type: String, required: true},
            correo: {type: String, required: true},
            telefono: {type: String, required: true}
        }
    },

    id_Vehiculo: {
        type: String,
        required: true
    },

    fechaEntrega: {
        type: Date,
        required: true
    },

    fechaInicio: {
        type: Date,
        required: true
    },

    estado: {
        type: String,
        required: true,
        enum: ["Reservado", "Pendiente", "Finalizado", "Cancelado"]
    },

    precioDia: {
        type: Number,
        required: true
    },

    precioTotal: {
        type: Number,
        required: true
    },

    id_Contrato: {
        type: String,
        required: true
    },

    id_HojaDeEstado: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    strict: false
});

//Export
export default model("Reservas", reservasSchema);