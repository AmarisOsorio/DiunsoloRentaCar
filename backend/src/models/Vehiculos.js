/*
    Fields: 
        imgCarro: String,
        id_Modelo: String,
        precioDia: Number,
        placa: String,
        id_Marca: String,
        id_tipo: String,
        color: String,
        numeroMotor: String,
        numeroChasisGrabado: String,
        contratoPDF: String,
        estado: String,
*/

//Imports

import {Schema, model} from "mongoose";

//Schema
const vehiculosSchema = new Schema({
    imgCarro: {
        type: String,
        required: true
    },

    id_Modelo: {
        type: String,
        required: true
    },

    precioDia: {
        type: Number,
        required: true
    },

    placa: {
        type: String,
        required: true,
        unique: true
    },

    id_Marca: {
        type: String,
        required: true
    },

    id_tipo: {
        type: String,
        required: true
    },

    color: {
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

    contratoPDF: {
        type: String,
        required: false
    },

    estado: {
        type: String,
        default: "disponible"
    }
}, {
    timestamps: true,
    strict: false
});

//Export    
export default model("Vehiculos", vehiculosSchema);