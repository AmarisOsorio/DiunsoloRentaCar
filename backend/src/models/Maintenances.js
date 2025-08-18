/*
    Fields:
        vehicleId (string),
        maintenanceType (string),
        startDate (date),
        returnDate (date),
        status (string: "Pending, Active, Completed"),
        creationDate (date),
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const maintenanceSchema = new Schema({
    vehicleId: {
            type: Schema.Types.ObjectId,
            ref: "Vehicle",
            required: true,
    },
    maintenanceType: {
        type: String,
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
    creationDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    strict: false
});

//Export
export default model("Maintenance", maintenanceSchema);