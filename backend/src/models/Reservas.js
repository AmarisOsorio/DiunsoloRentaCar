/*
    Fields:
        clientID (string),
        cliente (object){
            nombre (string),
            telefono (string),
            correoElectronico (string)
        },
        carID (string),
        fechaInicio (date),
        fechaDevolucion (date),
        estado (string: "Pendiente,Activa,Finalizada"),
        precioPorDia (number),
        fechaCreacion (date),
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const reservasSchema = new Schema({

    clientID: {
        type: Schema.Types.ObjectId,
        ref: 'Clientes',
        required: true
    },
    cliente: [ { 
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
    }],
    vehiculoID: {
        type: Schema.Types.ObjectId,
        ref: 'Vehiculos', 
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
export default model("Reservas", reservasSchema);