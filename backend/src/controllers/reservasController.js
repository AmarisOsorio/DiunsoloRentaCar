const ReservasController = {};
import reservasModel from "../models/Reservas.js";

//Select

ReservasController.getReservas = async (req, res) => {
    const reservas = await reservasModel.find()
        .populate("clientID")
        .populate("vehiculoID");
    res.json(reservas);
};

//Insert

ReservasController.insertReservas = async (req, res) => {
    const {
        clientID,
        cliente,
        vehiculoID,
        fechaInicio,
        fechaDevolucion,
        estado,
        precioPorDia
    } = req.body;
    
    const newReserva = new reservasModel({
        clientID,
        cliente,
        vehiculoID,
        fechaInicio,
        fechaDevolucion,
        estado,
        precioPorDia
    });

    await newReserva.save();
    res.json({message: "Reserva saved"});
};

//Delete

ReservasController.deleteReservas = async (req, res) => {
    await reservasModel.findByIdAndDelete(req.params.id);
    res.json({message: "Reserva deleted"});
};

//Update

ReservasController.updateReservas = async (req, res) => {
    const {
        clientID,
        cliente,
        vehiculoID,
        fechaInicio,
        fechaDevolucion,
        estado,
        precioPorDia
    } = req.body;
    
    const updatedReserva = await reservasModel.findByIdAndUpdate(
        req.params.id,
        {
            clientID,
            cliente,
            vehiculoID,
            fechaInicio,
            fechaDevolucion,
            estado,
            precioPorDia
        },
        {new: true}
    );

    res.json({message: "Reserva updated"});
};

export default ReservasController;