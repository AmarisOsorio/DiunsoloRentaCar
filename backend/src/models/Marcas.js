/*
    Fields:
        logo: String,
        nombre: String,
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const marcasSchema = new Schema({
    logo: {
        type: String,
        required: true
    },

    nombre: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true,
    strict: false
});

//Export
export default model("Marcas", marcasSchema);