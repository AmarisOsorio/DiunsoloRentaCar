/*
    Fields:
        imagenes
        nombreVehiculo
        precioPorDia
        placa
        idMarca
        clase
        color
        anio
        capacidad
        modelo
        numeroMotor
        numeroChasisGrabado
        numeroVinChasis
        contratoArrendamientoPdf
        estado
            - Disponible
            - Reservado
            - Mantenimiento
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const vehiculosSchema = new Schema({
    imagenes: {
        type: [String],
        required: true
    },
    nombreVehiculo: {
        type: String,
        required: true
    },
    precioPorDia: {
        type: Number,
        required: true
    },
    placa: {
        type: String,
        required: true,
        unique: true
    },
    idMarca: {
        type: String,
        required: true
    },
    clase: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    anio: {
        type: Number,
        required: true
    },
    capacidad: {
        type: Number,
        required: true
    },
    modelo: {
        type: String,
        required: true
    },
    numeroMotor: {
        type: String,
        required: true
    },
    numeroChasisGrabado: {
        type: String,
        required: true
    },
    numeroVinChasis: {
        type: String,
        required: true
    },
    contratoArrendamientoPdf: {
        type: String,
        required: true
    },
    estado: {
        type: String,
        enum : ["Disponible", "Reservado", "Mantenimiento"],
        default : "Disponible"
    }
}, {
    timestamps: true,
});

//Export
export default model("Vehiculos", vehiculosSchema);