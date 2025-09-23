/*
    Fields:
        clientId (string),
        vehicleId (string),
        startDate (date),
        returnDate (date),
        status (string: "Pending,Active,Completed"),
        pricePerDay (number),
        creationDate (date)
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const reservationsSchema = new Schema({
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'Clients',
        required: true
    },
    vehicleId: {
        type: Schema.Types.ObjectId,
        ref: 'Vehicle', 
        required: true
    },
    startDate: {  
        type: Date,
        required: true
    },
    returnDate: { 
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Active", "Completed"],
        default: "Pending"
    },
    pricePerDay: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },

    creationDate: {  
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    strict: false
});

//Export
export default model("Reservations", reservationsSchema);