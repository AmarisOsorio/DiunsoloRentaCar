/*
    Fields: 
        reservationId (string)
        clientID (string)
        carID (string)
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
    fecha_inicio: {
        type: Date, 
        default: Date.now
    },
    fecha_fin: {
        type: Date
    },
    datos_hoja_estado: {
        fecha_entrega: Date,
        fecha_devolucion: Date,
        numero_unidad: String,
        marca_modelo: String,
        placa: String,
        nombre_cliente: String,
        anotaciones: String,
        documentacion_entrega: {
            entrega: {
                llaves: Boolean,
                tarjeta_circulacion: Boolean,
                factura_consumidor: Boolean
            },
            devolucion: {
                llaves: Boolean,
                tarjeta_circulacion: Boolean,
                factura_consumidor: Boolean
            }
        },
        inspeccion_fisica: {
            entrega: {
                interna: {
                    condicion_general: String,
                    capo: Boolean,
                    medida_aceite: String,
                    antena: Boolean,
                    espejos: Boolean,
                    maletero: Boolean,
                    vidrios_buen_estado: Boolean,
                    bolsa_herramientas: Boolean,
                    manijas_puertas: Boolean,
                    tapa_gasolina: Boolean,
                    tazas_rines: {
                        presente: Boolean,
                        cantidad: Number
                    }
                },
                externa:{
                    interruptor_maletero:Boolean,
                    llave_encendido:Boolean,
                    luces:Boolean,
                    radio_original:Boolean,
                    ventilacion_ac_calefaccion:Boolean,
                    panel_instrumentos:String,
                    palanca_cambios:Boolean,
                    seguro_puerta:Boolean,
                    alfombras:Boolean,
                    llanta_repuesto:Boolean
                }
            },
            devolucion:{
                interna:{
                    condicion_general:String,
                    capo:Boolean,
                    medida_aceite:String,
                    antena:Boolean,
                    espejos:Boolean,
                    maletero:Boolean,
                    vidrios_buen_estado:Boolean,
                    bolsa_herramientas:Boolean,
                    manijas_puertas:Boolean,
                    tapa_gasolina:Boolean,
                    tazas_rines:{
                        presente:Boolean,
                        cantidad:Number
                    }
                },
                externa:{
                    interruptor_maletero:Boolean,
                    llave_encendido:Boolean,
                    luces:Boolean,
                    radio_original:Boolean,
                    ventilacion_ac_calefaccion:Boolean,
                    panel_instrumentos:String,
                    palanca_cambios:Boolean,
                    seguro_puerta:Boolean,
                    alfombras:Boolean,
                    llanta_repuesto:Boolean
                }
            }
        },
        fotos_condicion_general: [String],
        estado_combustible: {
            entrega: String,
            devolucion: String
        },
        firma_entrega: String
    },
    datos_arrendamiento: {
        nombre_arrendatario: String,
        profesion_arrendatario: String,
        direccion_arrendatario: String,
        pais_pasaporte: String,
        numero_pasaporte: String,
        pais_licencia: String,
        numero_licencia: String,
        extra_driver_name: String,
        pais_pasaporte_conductor_extra: String,
        numero_pasaporte_conductor_extra: String,
        pais_licencia_conductor_extra: String,
        numero_licencia_conductor_extra: String,
        ciudad_entrega: String,
        hora_entrega: String,
        fecha_entrega: Date,
        precio_diario: Number,
        monto_total: Number,
        dias_alquiler: Number,
        monto_deposito: Number,
        dias_plazo: Number,
        penalidad_mal_uso: Number,
        ciudad_firma: String,
        hora_firma: String,
        fecha_firma: Date,
        firma_arrendador: String,
        firma_arrendatario: String
    },
    documentos: {
        hoja_estado_pdf: String,
        arrendamiento_pdf: String
    }
}, {
    timestamps: true,
    strict: false
});

//Export
export const Contratos = model("Contratos", contratosSchema);