import mongoose from 'mongoose';
import reservasModel from './src/models/Reservas.js';
import clientesModel from './src/models/Clientes.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración de la base de datos desde .env
const MONGODB_URI = process.env.DB_URI;

async function testReservas() {
    try {
        console.log('🔗 Conectando a MongoDB Atlas...');
        console.log('🌐 URI:', MONGODB_URI.substring(0, 30) + '...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB Atlas');

        // Contar total de reservas
        const totalReservas = await reservasModel.countDocuments();
        console.log(`📊 Total de reservas en la BD: ${totalReservas}`);

        // Obtener todas las reservas
        const reservas = await reservasModel.find().populate('clientID', 'nombre apellido email');
        console.log('📋 Reservas encontradas:');
        reservas.forEach((reserva, index) => {
            console.log(`  ${index + 1}. Cliente: ${reserva.clientID?.nombre || 'Sin nombre'} | Estado: ${reserva.estado} | Fecha: ${reserva.fechaInicio}`);
        });

        // Contar total de clientes
        const totalClientes = await clientesModel.countDocuments();
        console.log(`👥 Total de clientes en la BD: ${totalClientes}`);

        // Si no hay reservas, mostrar algunos clientes para debug
        if (totalReservas === 0) {
            console.log('🔍 Mostrando primeros 3 clientes para debug:');
            const clientes = await clientesModel.find().limit(3);
            clientes.forEach((cliente, index) => {
                console.log(`  ${index + 1}. ${cliente.nombre} ${cliente.apellido} (${cliente.email}) - ID: ${cliente._id}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Desconectado de MongoDB');
    }
}

testReservas();
