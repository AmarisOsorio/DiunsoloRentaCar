/*
    Fields:
- imagenVista3/4(string: URL)
- imagenLateral(string: URL)
- imagenes (array[string: URL])
- nombreVehiculo (string)
- precioPorDia (number)
- placa (string)
- idMarca (string)
- clase (string)
- color (string)
- año (number)
- capacidad (number)
- modelo (string)
- numeroMotor (string)
- numeroChasisGrabado (string)
- numeroVinChasis (string)
- contratoArrendamientoPDF (string: URL)
- estado (string: "Disponible,Reservado,Mantenimiento")
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const vehiculosSchema = new Schema({
    imagenVista3_4: {
        type: String,
        required: true
    },
    imagenLateral: {
        type: String,
        required: true
    },
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
        required: false,
        default: ''
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