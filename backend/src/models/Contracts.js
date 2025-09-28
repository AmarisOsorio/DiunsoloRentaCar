/* 
fields: 
    reservationId (string) 
    status (string: "active,finished,canceled") 
    startDate (date when this rental agreement was created in the database) 
    endDate (date when status changed to "finished") 

    statusSheetData (object){ 
        deliveryDate (date) 
        returnDate (date) 
        unitNumber (string) 
        brandModel (string) 
        plate (string) 
        clientName (string) 
        notes (string) 

        vehicleDocumentation (object){ 
            delivery (object){ 
                keys (boolean) 
                circulationCard (boolean) 
                consumerInvoice (boolean) 
            } 
            return (object){ 
                keys (boolean) 
                circulationCard (boolean) 
                consumerInvoice (boolean) 
            } 
        } 

        physicalInspection (object){ 
            delivery (object){ 
                external (object){ 
                    generalExteriorCondition (string) 
                    hood (boolean) 
                    antenna (boolean) 
                    mirrors (boolean) 
                    trunk (boolean) 
                    windowsGoodCondition (boolean) 
                    toolKit (boolean) 
                    doorHandles (boolean) 
                    fuelCap (boolean) 
                    wheelCovers (object){ 
                        present (boolean) 
                        quantity (number) 
                    } 
                } 
                internal (object){ 
                    startSwitch (boolean) 
                    ignitionKey (boolean) 
                    lights (boolean) 
                    originalRadio (boolean) 
                    acHeatingVentilation (boolean) 
                    dashboard (string) 
                    gearShift (boolean) 
                    doorLocks (boolean) 
                    mats (boolean) 
                    spareTire (boolean) 
                } 
            } 

            return (object){ 
                external (object){ 
                    generalExteriorCondition (string) 
                    hood (boolean) 
                    antenna (boolean) 
                    mirrors (boolean) 
                    trunk (boolean) 
                    windowsGoodCondition (boolean) 
                    toolKit (boolean) 
                    doorHandles (boolean) 
                    fuelCap (boolean) 
                    wheelCovers (object){ 
                        present (boolean) 
                        quantity (number) 
                    } 
                } 
                internal (object){ 
                    startSwitch (boolean) 
                    ignitionKey (boolean) 
                    lights (boolean) 
                    originalRadio (boolean) 
                    acHeatingVentilation (boolean) 
                    dashboard (string) 
                    gearShift (boolean) 
                    doorLocks (boolean) 
                    mats (boolean) 
                    spareTire (boolean) 
                } 
            } 
        } 

        conditionPhotos (array[string: URL]) 
        fuelStatus (object){ 
            delivery (string) 
            return (string) 
        } 
        deliverySignature (string: URL/base64) 
    } 

    leaseData (object){ 
        tenantName (string) 
        tenantProfession (string) 
        tenantAddress (string) 
        passportCountry (string) 
        passportNumber (string) 
        licenseCountry (string) 
        licenseNumber (string) 

        extraDriverName (string) 
        extraDriverPassportCountry (string) 
        extraDriverPassportNumber (string) 
        extraDriverLicenseCountry (string) 
        extraDriverLicenseNumber (string) 

        deliveryCity (string) 
        deliveryHour (string) 
        deliveryDate (date) 

        dailyPrice (number) 
        totalAmount (number) 
        rentalDays (number) 
        depositAmount (number) 
        termDays (number) 
        misusePenalty (number) 

        signatureCity (string) 
        signatureHour (string) 
        signatureDate (date) 

        landlordSignature (string: URL/base64) 
        tenantSignature (string: URL/base64) 
    } 

    documents (object){ 
        conditionReportPdf (string: URL) 
        leasePdf (string: URL) 
    } 
*/ 

import { Schema, model } from "mongoose";

const contractsSchema = new Schema({
    reservationId: {
        type: String,
        ref: "Reservations",
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ["Active", "Finished", "Canceled"],
        default: "Active"
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },

    statusSheetData: {
        deliveryDate: Date,
        returnDate: Date,
        unitNumber: String,
        brandModel: String,
        plate: String,
        clientName: String,
        notes: String,

        vehicleDocumentation: {
            delivery: {
                keys: Boolean,
                circulationCard: Boolean,
                consumerInvoice: Boolean
            },
            return: {
                keys: Boolean,
                circulationCard: Boolean,
                consumerInvoice: Boolean
            }
        },

        physicalInspection: {
            delivery: {
                external: {
                    generalExteriorCondition: String,
                    hood: Boolean,
                    antenna: Boolean,
                    mirrors: Boolean,
                    trunk: Boolean,
                    windowsGoodCondition: Boolean,
                    toolKit: Boolean,
                    doorHandles: Boolean,
                    fuelCap: Boolean,
                    wheelCovers: { 
                        present: Boolean, 
                        quantity: Number 
                    }
                },
                internal: {
                    startSwitch: Boolean,
                    ignitionKey: Boolean,
                    lights: Boolean,
                    originalRadio: Boolean,
                    acHeatingVentilation: Boolean,
                    dashboard: String,
                    gearShift: Boolean,
                    doorLocks: Boolean,
                    mats: Boolean,
                    spareTire: Boolean
                }
            },
            return: {
                external: {
                    generalExteriorCondition: String,
                    hood: Boolean,
                    antenna: Boolean,
                    mirrors: Boolean,
                    trunk: Boolean,
                    windowsGoodCondition: Boolean,
                    toolKit: Boolean,
                    doorHandles: Boolean,
                    fuelCap: Boolean,
                    wheelCovers: { 
                        present: Boolean, 
                        quantity: Number 
                    }
                },
                internal: {
                    startSwitch: Boolean,
                    ignitionKey: Boolean,
                    lights: Boolean,
                    originalRadio: Boolean,
                    acHeatingVentilation: Boolean,
                    dashboard: String,
                    gearShift: Boolean,
                    doorLocks: Boolean,
                    mats: Boolean,
                    spareTire: Boolean
                }
            }
        },

        fuelStatus: {
            delivery: String,
            return: String
        },

        conditionPhotos: [String],
        deliverySignature: String
    },

    leaseData: {
        tenantName: String,
        tenantProfession: String,
        tenantAddress: String,
        passportCountry: String,
        passportNumber: String,
        licenseCountry: String,
        licenseNumber: String,

        extraDriverName: String,
        extraDriverPassportCountry: String,
        extraDriverPassportNumber: String,
        extraDriverLicenseCountry: String,
        extraDriverLicenseNumber: String,

        deliveryCity: String,
        deliveryHour: String,
        deliveryDate: Date,

        dailyPrice: Number,
        totalAmount: Number,
        rentalDays: Number,
        depositAmount: Number,
        termDays: Number,
        misusePenalty: Number,

        signatureCity: String,
        signatureHour: String,
        signatureDate: Date,

        landlordSignature: String,
        tenantSignature: String
    },

    documents: {
        statusSheetPdf: String,
        leasePdf: String
    }
    
}, {
    timestamps: true,
    strict: false
});

export default model("Contracts", contractsSchema);