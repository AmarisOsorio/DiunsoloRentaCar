/*
    Fields:
        brandName: (String),
        logo: (String: URL)
*/

// Imports
import {Schema, model} from "mongoose";

// Schema
const brandsSchema = new Schema({
    brandName: {
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

// Export
export default model("Brands", brandsSchema);