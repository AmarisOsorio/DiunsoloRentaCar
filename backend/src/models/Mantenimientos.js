/*
    Fields:
        idVehiculo (string),
        tipoMantenimiento (string),
        fechaInicio (date),
        fechaDevolucion (date),
        estado (string: "Pendiente, Activo, Finalizado"),
        fechaCreacion (date),
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const mantenimientosSchema = new Schema({
    /*idVehiculo: {
            type:Schema.Types.ObjectId,
            ref: "Vehiculos",
            require:true,
    },*/
    idVehiculo: {
        type:String,
        require:true,
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