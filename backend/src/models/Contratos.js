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
        type: Schema.Types.ObjectId,
        ref:"Reservas", 
        required: true
    },
    clientID: {
        type: Schema.Types.ObjectId, 
        ref: "Clientes",
        required: true
    },
    carID: {
        type: Schema.Types.ObjectId, 
        ref: "Vehiculos",
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
    datosHojaEstado: [{
        fechaEntrega:{ 
            type: Date
        },
        fechaDevolucion:{ 
            type: Date
        },
        numeroUnidad: {
            type: String
        },
        marcaModelo: {
            type: String
        },
        placa: {
            type: String
        },
        nombreCliente: {
           type: String
        },
        anotaciones: {
           type: String
        },
        documentacionEntrega: [{
            entrega: [{
                llaves: {
                    type: Boolean
                },
                tarjetaCirculacion: {
                    type:Boolean
                },
                facturaConsumidor: {
                    type:Boolean
                }
            }],
            devolucion: [{
                llaves: {
                    type: Boolean
                },
                tarjetaCirculacion: {
                    type: Boolean
                },
                facturaConsumidor: {
                    type: Boolean
                }
            }]
        }
        ],
        inspeccionFisica: [{
            entrega: [{
                externa: [{
                    condicionGeneral: {
                        type: String
                    },
                    capo: {
                        type: Boolean
                    },
                    medidaAceite: {
                        type: String
                    },
                    antena: {
                       type: Boolean
                    },
                    espejos: {
                        type: Boolean
                    },
                    maletero: {
                       type: Boolean
                    },
                    vidriosBuenEstado: {
                        type: Boolean
                    },
                    bolsaHerramientas: {
                        type: Boolean
                    },
                    manijasPuertas: {
                        type: Boolean
                    },
                    tapaGasolina: {
                       type: Boolean
                    },
                    tazasRines: [{
                        presente: {
                            type: Boolean
                        },
                        cantidad: {
                           type: Number
                        }
                    }]
                }],
                interna: [{
                    interruptorMaletero: {
                       type: Boolean
                    },
                    llaveEncendido: {
                        type: Boolean
                    },
                    luces: {
                        type: Boolean
                    },
                    radioOriginal: {
                       type: Boolean
                    },
                    ventilacionAcCalefaccion: {
                        type: Boolean
                    },
                    panelInstrumentos: {
                        type: String
                    },
                    palancaCambios: {
                        type: Boolean
                    },
                    seguroPuerta: {
                        type: Boolean
                    },
                    alfombras: {
                        type: Boolean
                    },
                    llantaRepuesto: {
                        type: Boolean
                    }
                }]
            }],
            devolucion: [{
                externa: [{
                    condicionGeneral: {
                        type: String
                    },
                    capo: {
                        type: Boolean
                    },
                    medidaAceite: {
                        type: String
                    },
                    antena: {
                        type: Boolean
                    },
                    espejos: {
                        type: Boolean
                    },
                    maletero: {
                        type: Boolean
                    },
                    vidriosBuenEstado: {
                        type: Boolean
                    },
                    bolsaHerramientas: {
                        type: Boolean
                    },
                    manijasPuertas: {
                        type: Boolean
                    },
                    tapaGasolina: {
                        type: Boolean
                    },
                    tazasRines: [{
                        presente: {
                           type:  Boolean
                        },
                        cantidad: {
                           type:  Number
                        }
                    }]
                }],
                interna: [{
                    interruptorMaletero: {
                        type: Boolean
                    },
                    llaveEncendido: {
                        type: Boolean
                    },
                    luces: {
                        type: Boolean
                    },
                    radioOriginal: {
                        type: Boolean
                    },
                    ventilacionAcCalefaccion: {
                        type: Boolean
                    },
                    panelInstrumentos: {
                        type: String
                    },
                    palancaCambios: {
                        type: Boolean
                    },
                    seguroPuerta: {
                        type: Boolean
                    },
                    alfombras: {
                        type: Boolean
                    },
                    llantaRepuesto: {
                        type: Boolean
                    }
                }]
            }]
        }],
        fotosCondicionGeneral: {
            type: String
        },
        estadoCombustible: [{
            entrega: {
                type: String
            },
            devolucion: {
                type: String
            }
        }],
        firmaEntrega: {
            type: String
        }
    }
],
    datosArrendamiento: [{
        nombreArrendatario: {
            type:String
        },
        profesionArrendatario: {
           type: String
        },
        direccionArrendatario: {
          type:  String
        },
        paisPasaporte: {
           type: String
        },
        numeroPasaporte: {
           type: String
        },
        paisLicencia: {
           type: String
        },
        numeroLicencia: {
           type: String
        },
        extraDriverName: {
          type:  String
        },
        paisPasaporteConductorExtra: {
          type:  String
        },
        numeroPasaporteConductorExtra: {
           type: String
        },
        paisLicenciaConductorExtra: {
          type:  String
        },
        numeroLicenciaConductorExtra: {
          type:  String
        },
        ciudadEntrega: {
           type: String
        },
        horaEntrega: {
           type: String
        },
        fechaEntrega: {
            type: Date
        },
        precioDiario: {
            type: Number
        },
        montoTotal: {
          type: Number
        },
        diasAlquiler: {
           type: Number
        },
        montoDeposito: {
          type: Number
        },
        diasPlazo: {
            type:Number
        },
        penalidadMalUso: {
           type: Number
        },
        ciudadFirma: {
          type: String
        },
        horaFirma: {
           type: String
        },
        fechaFirma: {
           type: Date
        },
        firmaArrendador: {
           type: String
        },
        firmaArrendatario: {
           type: String
        }
    }],
    documentos: [{
        hojaEstadoPdf: {
           type: String
        },
        arrendamientoPdf: {
           type: String
        }
    }]
}, {
    timestamps: true,
    strict: false
});

//Export
export const Contratos = model("Contratos", contratosSchema); 