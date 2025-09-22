/*
    Fields:
        name (string),
        email (string),
        password (string),
        phone (string),
        dui (string),
        role (string: "Employee,Manager,Admin")
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const employeesSchema = new Schema({
    
    name: {
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
    dui: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        required: true,
        enum: ["Administrador", "Gestor", "Empleado"]
    },
    photo: {
        type: String,
        required: false, 
        default: null
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
export default model("Employees", employeesSchema);