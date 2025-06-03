/*
    Fields:
        imagenes (array[string: URL]),
        nombre_vehiculo (string),
        precio_por_dia (number),
        placa (string),
        id_marca (string),
        clase (string),
        color (string),
        año (number),
        capacidad (number),
        modelo (string),
        numero_motor (string),
        numero_chasis_grabado (string),
        numero_vin_chasis (string),
        contratoArrendamientoPDF (string: URL),
        estado (string: "Disponible,Reservado,Mantenimiento")
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const vehiculosSchema = new Schema({
    imagenes: {
        type: [String],
        required: true
    },
    nombre_vehiculo: {
        type: String,
        required: true
    },
    precio_por_dia: {
        type: Number,
        required: true
    },
    placa: {
        type: String,
        required: true,
        unique: true
    },
    id_marca: {
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
    año: {
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
    numero_motor: {
        type: String,
        required: true
    },
    numero_chasis_grabado: {
        type: String,
        required: true
    },
    numero_vin_chasis: {
        type: String,
        required: true
    },
    contratoArrendamientoPDF: {
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