/*
    Fields: 
        reservationId (string)
        clientID (string)
        carID (string)
        estado (string: "Activo,Finalizado,Anulado")
        fechaInicio (fecha de cuando se agrego este contrato a la base)
        fechaFin (fecha de cuando se paso estado a "Finalizado")
        datosHojaEstado (object){
            fechaEntrega (date)
            fechaDevolucion (date)
            numeroUnidad (string)
            marcaModelo (string)
            placa (string)
            nombreCliente (string)
            anotaciones (string)
            documentacionEntrega (object){
                entrega (object){
                    llaves (boolean)
                    tarjetaCirculacion (boolean)
                    facturaConsumidor (boolean)
                }
                
                devolucion (object){
                    llaves (boolean)
                    tarjetaCirculacion (boolean)
                    facturaConsumidor (boolean)
                }
            }

            inspeccionFisica (object){
                entrega (object){
                    externa (object){
                        condicionGeneral (string)
                        capo (boolean)
                        medidaAceite (string)
                        antena (boolean)
                        espejos (boolean)
                        maletero (boolean)
                        vidriosBuenEstado (boolean)
                        bolsaHerramientas (boolean)
                        manijasPuertas (boolean)
                        tapaGasolina (boolean)
                        tazasRines (object){
                            presente (boolean)
                            cantidad (number)
                        }
                    }
                    interna (object){
                        interruptorMaletero (boolean)
                        llaveEncendido (boolean)
                        luces (boolean)
                        radioOriginal (boolean)
                        ventilacionAcCalefaccion (boolean)
                        panelInstrumentos (string)
                        palancaCambios (boolean)
                        seguroPuerta (boolean)
                        alfombras (boolean)
                        llantaRepuesto (boolean)
                    }
                }

                devolucion (object){
                    externa (object){
                        condicionGeneral (string)
                        capo (boolean)
                        medidaAceite (string)
                        antena (boolean)
                        espejos (boolean)
                        maletero (boolean)
                        vidriosBuenEstado (boolean)
                        bolsaHerramientas (boolean)
                        manijasPuertas (boolean)
                        tapaGasolina (boolean)
                        tazasRines (object){
                            presente (boolean)
                            cantidad (number)
                        }
                    }
                    interna (object){
                        interruptorMaletero (boolean)
                        llaveEncendido (boolean)
                        luces (boolean)
                        radioOriginal (boolean)
                        ventilacionAcCalefaccion (boolean)
                        panelInstrumentos (string)
                        palancaCambios (boolean)
                        seguroPuerta (boolean)
                        alfombras (boolean)
                        llantaRepuesto (boolean)
                    }
                }
            }
            fotosCondicionGeneral (array[string: URL])
            estadoCombustible (object){
                entrega (string)
                devolucion (string)
            }
            firmaEntrega (string: URL/base64)
        }
        datosArrendamiento (object){
            nombreArrendatario (string)
            profesionArrendatario (string)
            direccionArrendatario (string)
            paisPasaporte (string)
            numeroPasaporte (string)
            paisLicencia (string)
            numeroLicencia (string)
            extraDriverName (string)
            paisPasaporteConductorExtra (string)
            numeroPasaporteConductorExtra (string)
            paisLicenciaConductorExtra (string)
            numeroLicenciaConductorExtra (string)
            ciudadEntrega (string)
            horaEntrega (string)
            fechaEntrega (date)
            precioDiario (number)
            montoTotal (number)
            diasAlquiler (number)
            montoDeposito (number)
            diasPlazo (number)
            penalidadMalUso (number)
            ciudadFirma (string)
            horaFirma (string)
            fechaFirma (date)
            firmaArrendador (string: URL/base64)
            firmaArrendatario (string: URL/base64)
        }
        documentos (object){
            hojaEstadoPdf (string: URL)
            arrendamientoPdf (string: URL)
        }
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const contratosSchema = new Schema({
    reservationId: {
        type: String, 
        required: true
    },
    clientID: {
        type: String, 
        required: true
    },
    carID: {
        type: String, 
        required: true
    },
    estado: {
        type: String, 
        enum: ["Activo", "Finalizado", "Anulado"], 
        default: "Activo"
    },
    fechaInicio: {
        type: Date, 
        default: Date.now
    },
    fechaFin: {
        type: Date
    },
    datosHojaEstado: {
        fechaEntrega: Date,
        fechaDevolucion: Date,
        numeroUnidad: String,
        marcaModelo: String,
        placa: String,
        nombreCliente: String,
        anotaciones: String,
        documentacionEntrega: {
            entrega: {
                llaves: Boolean,
                tarjetaCirculacion: Boolean,
                facturaConsumidor: Boolean
            },
            devolucion: {
                llaves: Boolean,
                tarjetaCirculacion: Boolean,
                facturaConsumidor: Boolean
            }
        },
        inspeccionFisica: {
            entrega: {
                externa: {
                    condicionGeneral: String,
                    capo: Boolean,
                    medidaAceite: String,
                    antena: Boolean,
                    espejos: Boolean,
                    maletero: Boolean,
                    vidriosBuenEstado: Boolean,
                    bolsaHerramientas: Boolean,
                    manijasPuertas: Boolean,
                    tapaGasolina: Boolean,
                    tazasRines: {
                        presente: Boolean,
                        cantidad: Number
                    }
                },
                interna: {
                    interruptorMaletero: Boolean,
                    llaveEncendido: Boolean,
                    luces: Boolean,
                    radioOriginal: Boolean,
                    ventilacionAcCalefaccion: Boolean,
                    panelInstrumentos: String,
                    palancaCambios: Boolean,
                    seguroPuerta: Boolean,
                    alfombras: Boolean,
                    llantaRepuesto: Boolean
                }
            },
            devolucion: {
                externa: {
                    condicionGeneral: String,
                    capo: Boolean,
                    medidaAceite: String,
                    antena: Boolean,
                    espejos: Boolean,
                    maletero: Boolean,
                    vidriosBuenEstado: Boolean,
                    bolsaHerramientas: Boolean,
                    manijasPuertas: Boolean,
                    tapaGasolina: Boolean,
                    tazasRines: {
                        presente: Boolean,
                        cantidad: Number
                    }
                },
                interna: {
                    interruptorMaletero: Boolean,
                    llaveEncendido: Boolean,
                    luces: Boolean,
                    radioOriginal: Boolean,
                    ventilacionAcCalefaccion: Boolean,
                    panelInstrumentos: String,
                    palancaCambios: Boolean,
                    seguroPuerta: Boolean,
                    alfombras: Boolean,
                    llantaRepuesto: Boolean
                }
            }
        },
        fotosCondicionGeneral: [String],
        estadoCombustible: {
            entrega: String,
            devolucion: String
        },
        firmaEntrega: String
    },
    datosArrendamiento: {
        nombreArrendatario: String,
        profesionArrendatario: String,
        direccionArrendatario: String,
        paisPasaporte: String,
        numeroPasaporte: String,
        paisLicencia: String,
        numeroLicencia: String,
        extraDriverName: String,
        paisPasaporteConductorExtra: String,
        numeroPasaporteConductorExtra: String,
        paisLicenciaConductorExtra: String,
        numeroLicenciaConductorExtra: String,
        ciudadEntrega: String,
        horaEntrega: String,
        fechaEntrega: Date,
        precioDiario: Number,
        montoTotal: Number,
        diasAlquiler: Number,
        montoDeposito: Number,
        diasPlazo: Number,
        penalidadMalUso: Number,
        ciudadFirma: String,
        horaFirma: String,
        fechaFirma: Date,
        firmaArrendador: String,
        firmaArrendatario: String
    },
    documentos: {
        hojaEstadoPdf: String,
        arrendamientoPdf: String
    }
}, {
    timestamps: true,
    strict: false
});

//Export
export const Contratos = model("Contratos", contratosSchema);