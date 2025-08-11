/*
    Fields:
        name [String],
        lastName [String],
        email [String],
        password [String],
        phone [String],
        birthDate [Date],
        licenseFront [String URL],
        licenseBack [String URL],
        passportFront [String URL],
        passportBack [String URL],

*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const clientsSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    birthDate: {
        type: Date,
        required: true
    },

    licenseFront: {
        type: String,
        required: false
    },
    licenseBack: {
        type: String,
        required: false
    },
    passportFront: {
        type: String,
        required: false
    },
    passportBack: {
        type: String,
        required: false
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    loginAttempts: {
        type: Number,
        default: 0
    },

    lockTime: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    strict: false
});

//Export
export default model("Clients", clientsSchema);