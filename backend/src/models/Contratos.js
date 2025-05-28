/*
    Fields: 
        id_Cliente: String,
        id_Vehiculo: String,
        fechaInicio: Date,
        fechaFin: Date,
        costoTotal: Number,
        arrendamiento: Object (
            Conductor Principal: Object (
                nombre: String,
                Domicilio: String,
                pasaporte: String,
                licencia: String
            ),
            Conductor Adicional: Objects (
                nombre: String,
                Domicilio: String,
                pasaporte: String,
                licencia: String)
            ),
            Entrega Vehiculo: Object (
                fecchaEntrega: Date
            ),
            CostosArrendamiento: Object (
                diario: Number,
                total: Number,
                diasArrendamiento: Number
                montoAnticipado: Number
            ),
            Plazo: Object (
                diasContrato: Number,
            ),
            Compensacion: Object (
                costo: Number,
            ),
            EntregaContrato: Object (
                fechaEntrega: Date,
            ),
            Firma: String
        )
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const contratosSchema = new Schema({
    id_Cliente: {
        type: String,
        required: true
    },

    id_Vehiculo: {
        type: String,
        required: true
    },

    fechaInicio: {
        type: Date,
        required: true
    },

    fechaFin: {
        type: Date,
        required: true
    },

    costoTotal: {
        type: Number,
        required: true
    },

    arrendamiento: {
        ConductorPrincipal: {
            nombre: {type: String, required: true},
            Domicilio: {type: String, required: true},
            pasaporte: {type: String, required: true},
            licencia: {type: String, required: true}
        },
        ConductorAdicionales: [{
            nombre: {type: String, required: true},
            Domicilio: {type: String, required: true},
            pasaporte: {type: String, required: true},
            licencia: {type: String, required: true}
        }],
        EntregaVehiculo: {
            fechaEntrega: {type: Date, required: true}
        },
        CostosArrendamiento:{
            diario:{type:Number,required:true},
            total:{type:Number,required:true},
            diasArrendamiento:{type:Number,required:true},
            montoAnticipado:{type:Number,required:true}
        },
        Plazo:{
            diasContrato:{type:Number,required:true}
        },
        Compensacion:{
            costo:{type:Number,required:true}
        },
        EntregaContrato:{
            fechaEntrega:{type:String,required:true}
        },
        Firma:{
            type:String,
            required:true
        }
    }
}, {
    timestamps: true,
    strict: false
});

//Export
export const Contratos = model("Contratos", contratosSchema);