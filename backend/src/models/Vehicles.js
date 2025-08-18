/*
    Fields:
    - mainViewImage (string: URL)
    - sideImage (string: URL)
    - galleryImages (array[string: URL])
    - vehicleName (string)
    - dailyPrice (number)
    - plate (string)
    - brandId (ObjectId)
    - vehicleClass (string)
    - color (string)
    - year (number)
    - capacity (number)
    - model (string)
    - engineNumber (string)
    - chassisNumber (string)
    - vinNumber (string)
    - leaseContract (string: URL)
    - status (string: "Disponible", "Reservado", "Mantenimiento")
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const vehicleSchema = new Schema({
    mainViewImage: {
        type: String,
        required: true
    },
    sideImage: {
        type: String,
        required: true
    },
    galleryImages: {
        type: [String],
        required: true
    },
    vehicleName: {
        type: String,
        required: true
    },
    dailyPrice: {
        type: Number,
        required: true
    },
    plate: {
        type: String,
        required: true,
        unique: true
    },
    brandId: {
    type: Schema.Types.ObjectId,
    ref: 'Brands',
    required: true
    },
    vehicleClass: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    engineNumber: {
        type: String,
        required: true
    },
    chassisNumber: {
        type: String,
        required: true
    },
    vinNumber: {
        type: String,
        required: true
    },
    leaseContract: {
        type: String,
        required: false,
        default: ''
    },
    status: {
        type: String,
         enum : ["Disponible", "Reservado", "Mantenimiento"],
        default : "Disponible"
    }
}, {
    timestamps: true,
});

//Export
export default model("Vehicle", vehicleSchema);