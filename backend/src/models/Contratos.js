/*
    Fields: 
        reservationId (string)
        estado (string: "Activo,Finalizado,Anulado")
        fecha_inicio (fecha de cuando se agrego este contrato a la base)
        fecha_fin (fecha de cuando se paso estado a "Finalizado")
        datos_hoja_estado (object){
            fecha_entrega (date)
            fecha_devolucion (date)
            numero_unidad (string)
            marca_modelo (string)
            placa (string)
            nombre_cliente (string)
            anotaciones (string)
            documentacion_entrega (object){
                entrega (object){
                    llaves (boolean)
                    tarjeta_circulacion (boolean)
                    factura_consumidor (boolean)
                }
                
                devolucion (object){
                    llaves (boolean)
                    tarjeta_circulacion (boolean)
                    factura_consumidor (boolean)
                }
            }

            inspeccion_fisica (object){
                entrega (object){
                    interna (object){
                        condicion_general (string)
                        capo (boolean)
                        medida_aceite (string)
                        antena (boolean)
                        espejos (boolean)
                        maletero (boolean)
                        vidrios_buen_estado (boolean)
                        bolsa_herramientas (boolean)
                        manijas_puertas (boolean)
                        tapa_gasolina (boolean)
                        tazas_rines (object){
                            presente (boolean)
                            cantidad (number)
                        }
                    }
                    externa (object){
                        interruptor_maletero (boolean)
                        llave_encendido (boolean)
                        luces (boolean)
                        radio_original (boolean)
                        ventilacion_ac_calefaccion (boolean)
                        panel_instrumentos (string)
                        palanca_cambios (boolean)
                        seguro_puerta (boolean)
                        alfombras (boolean)
                        llanta_repuesto (boolean)
                    }

                devolucion (object){
                    interna (object){
                            condicion_general (string)
                            capo (boolean)
                            medida_aceite (string)
                            antena (boolean)
                            espejos (boolean)
                            maletero (boolean)
                            vidrios_buen_estado (boolean)
                            bolsa_herramientas (boolean)
                            manijas_puertas (boolean)
                            tapa_gasolina (boolean)
                            tazas_rines (object){
                                presente (boolean)
                                cantidad (number)
                            }
                        }
                        externa (object){
                            interruptor_maletero (boolean)
                            llave_encendido (boolean)
                            luces (boolean)
                            radio_original (boolean)
                            ventilacion_ac_calefaccion (boolean)
                            panel_instrumentos (string)
                            palanca_cambios (boolean)
                            seguro_puerta (boolean)
                            alfombras (boolean)
                            llanta_repuesto (boolean)
                        }
                    }
                }
            }
            fotos_condicion_general (array[string: URL])
            estado_combustible (object){
                entrega (string)
                devolucion (string)
            }
            firma_entrega (string: URL/base64)
        }
        datos_arrendamiento (object){
            nombre_arrendatario (string)
            profesion_arrendatario (string)
            direccion_arrendatario (string)
            pais_pasaporte (string)
            numero_pasaporte (string)
            pais_licencia (string)
            numero_licencia (string)
            extra_driver_name (string)
            pais_pasaporte_conductor_extra (string)
            numero_pasaporte_conductor_extra (string)
            pais_licencia_conductor_extra (string)
            numero_licencia_conductor_extra (string)
            ciudad_entrega (string)
            hora_entrega (string)
            fecha_entrega (date)
            precio_diario (number)
            monto_total (number)
            dias_alquiler (number)
            monto_deposito (number)
            dias_plazo (number)
            penalidad_mal_uso (number)
            ciudad_firma (string)
            hora_firma (string)
            fecha_firma (date)
            firma_arrendador (string: URL/base64)
            firma_arrendatario (string: URL/base64)
        }
        documentos (object){
            hoja_estado_pdf (string: URL)
            arrendamiento_pdf (string: URL)
        }
*/

//Imports
import {Schema, model} from "mongoose";

//Schema
const contratosSchema = new Schema({
    reservationId: {
        type: String, 
        required: true,
        unique: true
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
                interna: {
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
                externa:{
                    interruptorMaletero:Boolean,
                    llaveEncendido:Boolean,
                    luces:Boolean,
                    radioOriginal:Boolean,
                    ventilacionAcCalefaccion:Boolean,
                    panelInstrumentos:String,
                    palancaCambios:Boolean,
                    seguroPuerta:Boolean,
                    alfombras:Boolean,
                    llantaRepuesto:Boolean
                }
            },
            devolucion:{
                interna:{
                    condicionGeneral:String,
                    capo:Boolean,
                    medidaAceite:String,
                    antena:Boolean,
                    espejos:Boolean,
                    maletero:Boolean,
                    vidriosBuenEstado:Boolean,
                    bolsaHerramientas:Boolean,
                    manijasPuertas:Boolean,
                    tapaGasolina:Boolean,
                    tazasRines:{
                        presente:Boolean,
                        cantidad:Number
                    }
                },
                externa:{
                    interruptorMaletero:Boolean,
                    llaveEncendido:Boolean,
                    luces:Boolean,
                    radioOriginal:Boolean,
                    ventilacionAcCalefaccion:Boolean,
                    panelInstrumentos:String,
                    palancaCambios:Boolean,
                    seguroPuerta:Boolean,
                    alfombras:Boolean,
                    llantaRepuesto:Boolean
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