/*
    Fields:
        nombre_marca: (String),
        logo: (String: URL)
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const marcasSchema = new Schema({
    nombreMarca: {
        type: String,
        required: true,
        unique: true
    },
    logo: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    strict: false
});

//Export
export default model("Marcas", marcasSchema);