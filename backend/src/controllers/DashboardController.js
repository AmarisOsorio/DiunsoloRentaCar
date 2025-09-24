// backend/src/controllers/dashboardController.js
import vehiclesModel from "../models/Vehicles.js";
import clientsModel from "../models/Clients.js";
import employeesModel from "../models/Employees.js";
import reservationsModel from "../models/Reservations.js";
import maintenancesModel from "../models/Maintenances.js";

const dashboardController = {};

// Obtener actividades recientes del sistema
dashboardController.getRecentActivities = async (req, res) => {
  try {
    const activities = [];
    const now = new Date();
    
    console.log('🔍 Buscando actividades recientes...');
    
    // Obtener vehículos recientes (últimos 7 días o últimos 5)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentVehicles = await vehiclesModel
      .find({
        $or: [
          { createdAt: { $gte: sevenDaysAgo } },
          { updatedAt: { $gte: sevenDaysAgo } }
        ]
      })
      .populate('brandId', 'brandName')
      .sort({ createdAt: -1, updatedAt: -1 })
      .limit(3)
      .lean();

    console.log('🚗 Vehículos recientes encontrados:', recentVehicles.length);

    recentVehicles.forEach(vehicle => {
      const timeAgo = getTimeAgo(vehicle.updatedAt || vehicle.createdAt);
      activities.push({
        id: `vehicle_${vehicle._id}`,
        type: 'vehicle',
        title: 'Vehículo actualizado',
        description: `${vehicle.brandId?.brandName || 'Marca'} ${vehicle.vehicleName}`,
        time: timeAgo,
        icon: 'car-sport',
        color: '#4CAF50',
        createdAt: vehicle.updatedAt || vehicle.createdAt
      });
    });

    // Obtener mantenimientos recientes (todos los estados, últimos 7 días)
    const recentMaintenances = await maintenancesModel
      .find({
        $or: [
          { createdAt: { $gte: sevenDaysAgo } },
          { updatedAt: { $gte: sevenDaysAgo } }
        ]
      })
      .populate('vehicleId', 'vehicleName')
      .sort({ creationDate: -1, updatedAt: -1 })
      .limit(3)
      .lean();

    console.log('🔧 Mantenimientos recientes encontrados:', recentMaintenances.length);

    recentMaintenances.forEach(maintenance => {
      const dateToUse = maintenance.updatedAt || maintenance.creationDate || maintenance.createdAt;
      const timeAgo = getTimeAgo(dateToUse);
      const statusText = {
        'Pending': 'programado',
        'Active': 'iniciado',
        'Completed': 'completado'
      };
      
      activities.push({
        id: `maintenance_${maintenance._id}`,
        type: 'maintenance',
        title: `Mantenimiento ${statusText[maintenance.status] || maintenance.status.toLowerCase()}`,
        description: `${maintenance.vehicleId?.vehicleName || 'Vehículo'} - ${maintenance.maintenanceType}`,
        time: timeAgo,
        icon: 'construct',
        color: maintenance.status === 'Completed' ? '#4CAF50' : '#FF9800',
        createdAt: dateToUse
      });
    });

    // Obtener clientes recientes verificados (últimos 7 días)
    const recentClients = await clientsModel
      .find({ 
        isVerified: true,
        $or: [
          { createdAt: { $gte: sevenDaysAgo } },
          { updatedAt: { $gte: sevenDaysAgo } }
        ]
      })
      .sort({ createdAt: -1, updatedAt: -1 })
      .limit(3)
      .lean();

    console.log('👤 Clientes recientes encontrados:', recentClients.length);

    recentClients.forEach(client => {
      const dateToUse = client.updatedAt || client.createdAt;
      const timeAgo = getTimeAgo(dateToUse);
      activities.push({
        id: `client_${client._id}`,
        type: 'client',
        title: 'Cliente registrado',
        description: `${client.name} ${client.lastName}`,
        time: timeAgo,
        icon: 'person-add',
        color: '#2196F3',
        createdAt: dateToUse
      });
    });

    // Obtener reservas recientes (últimos 7 días)
    const recentReservations = await reservationsModel
      .find({
        $or: [
          { createdAt: { $gte: sevenDaysAgo } },
          { updatedAt: { $gte: sevenDaysAgo } },
          { creationDate: { $gte: sevenDaysAgo } }
        ]
      })
      .populate('vehicleId', 'vehicleName')
      .populate('clientId', 'name lastName')
      .sort({ creationDate: -1, createdAt: -1, updatedAt: -1 })
      .limit(3)
      .lean();

    console.log('📅 Reservas recientes encontradas:', recentReservations.length);

    recentReservations.forEach(reservation => {
      const dateToUse = reservation.updatedAt || reservation.creationDate || reservation.createdAt;
      const timeAgo = getTimeAgo(dateToUse);
      const clientName = reservation.clientId 
        ? `${reservation.clientId.name} ${reservation.clientId.lastName}`
        : (reservation.client && reservation.client[0] ? reservation.client[0].name : 'Cliente');
      
      const days = Math.ceil((new Date(reservation.returnDate) - new Date(reservation.startDate)) / (1000 * 60 * 60 * 24));
      
      const statusText = {
        'Pending': 'Nueva reserva',
        'Active': 'Reserva activa',
        'Completed': 'Reserva completada'
      };
      
      activities.push({
        id: `reservation_${reservation._id}`,
        type: 'reservation',
        title: statusText[reservation.status] || 'Reserva actualizada',
        description: `${reservation.vehicleId?.vehicleName || 'Vehículo'} - ${days} día${days !== 1 ? 's' : ''}`,
        time: timeAgo,
        icon: 'calendar',
        color: '#9C27B0',
        createdAt: dateToUse
      });
    });

    // Si no hay actividades recientes, obtener las más recientes sin filtro de fecha
    if (activities.length === 0) {
      console.log('⚠️ No se encontraron actividades recientes, buscando las más recientes...');
      
      // Buscar las últimas actividades sin restricción de fecha
      const [lastVehicles, lastMaintenances, lastClients, lastReservations] = await Promise.all([
        vehiclesModel.find().populate('brandId', 'brandName').sort({ createdAt: -1 }).limit(2).lean(),
        maintenancesModel.find().populate('vehicleId', 'vehicleName').sort({ creationDate: -1 }).limit(2).lean(),
        clientsModel.find({ isVerified: true }).sort({ createdAt: -1 }).limit(2).lean(),
        reservationsModel.find().populate('vehicleId', 'vehicleName').populate('clientId', 'name lastName').sort({ creationDate: -1 }).limit(2).lean()
      ]);

      // Agregar las actividades más recientes encontradas
      [...lastVehicles, ...lastMaintenances, ...lastClients, ...lastReservations].forEach(item => {
        let activity = null;
        
        if (item.vehicleName) { // Es un vehículo
          activity = {
            id: `vehicle_${item._id}`,
            type: 'vehicle',
            title: 'Vehículo en sistema',
            description: `${item.brandId?.brandName || 'Marca'} ${item.vehicleName}`,
            time: getTimeAgo(item.createdAt),
            icon: 'car-sport',
            color: '#4CAF50',
            createdAt: item.createdAt
          };
        } else if (item.maintenanceType) { // Es un mantenimiento
          activity = {
            id: `maintenance_${item._id}`,
            type: 'maintenance',
            title: 'Mantenimiento registrado',
            description: `${item.vehicleId?.vehicleName || 'Vehículo'} - ${item.maintenanceType}`,
            time: getTimeAgo(item.creationDate || item.createdAt),
            icon: 'construct',
            color: '#FF9800',
            createdAt: item.creationDate || item.createdAt
          };
        } else if (item.email && item.name) { // Es un cliente
          activity = {
            id: `client_${item._id}`,
            type: 'client',
            title: 'Cliente en sistema',
            description: `${item.name} ${item.lastName}`,
            time: getTimeAgo(item.createdAt),
            icon: 'person-add',
            color: '#2196F3',
            createdAt: item.createdAt
          };
        } else if (item.startDate) { // Es una reserva
          const days = Math.ceil((new Date(item.returnDate) - new Date(item.startDate)) / (1000 * 60 * 60 * 24));
          activity = {
            id: `reservation_${item._id}`,
            type: 'reservation',
            title: 'Reserva en sistema',
            description: `${item.vehicleId?.vehicleName || 'Vehículo'} - ${days} día${days !== 1 ? 's' : ''}`,
            time: getTimeAgo(item.creationDate || item.createdAt),
            icon: 'calendar',
            color: '#9C27B0',
            createdAt: item.creationDate || item.createdAt
          };
        }
        
        if (activity) {
          activities.push(activity);
        }
      });
    }

    // Ordenar por fecha más reciente y limitar a 6 actividades
    const sortedActivities = activities
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    console.log('✅ Actividades finales:', sortedActivities.length);

    res.status(200).json({
      success: true,
      data: sortedActivities,
      count: sortedActivities.length
    });

  } catch (error) {
    console.error('❌ Error obteniendo actividades recientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Función auxiliar para calcular tiempo transcurrido
function getTimeAgo(date) {
  if (!date) return 'Fecha desconocida';
  
  const now = new Date();
  const inputDate = new Date(date);
  
  // Verificar que la fecha sea válida
  if (isNaN(inputDate.getTime())) {
    return 'Fecha inválida';
  }
  
  const diffTime = Math.abs(now - inputDate);
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMinutes < 1) {
    return 'Hace unos momentos';
  } else if (diffMinutes < 60) {
    return diffMinutes === 1 ? 'Hace 1 minuto' : `Hace ${diffMinutes} minutos`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? 'Hace 1 hora' : `Hace ${diffHours} horas`;
  } else if (diffDays < 7) {
    return diffDays === 1 ? 'Ayer' : `Hace ${diffDays} días`;
  } else if (diffWeeks < 4) {
    return diffWeeks === 1 ? 'Hace 1 semana' : `Hace ${diffWeeks} semanas`;
  } else if (diffMonths < 12) {
    return diffMonths === 1 ? 'Hace 1 mes' : `Hace ${diffMonths} meses`;
  } else {
    const diffYears = Math.floor(diffMonths / 12);
    return diffYears === 1 ? 'Hace 1 año' : `Hace ${diffYears} años`;
  }
}

// Obtener estadísticas del dashboard
dashboardController.getDashboardStats = async (req, res) => {
  try {
    const stats = {};
    
    // Contar marcas
    const brandsCount = await (await import("../models/Brands.js")).default.countDocuments();
    stats.marcasCount = brandsCount;

    // Contar y obtener estados de vehículos
    const vehicleStats = await vehiclesModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    stats.vehiculosCount = await vehiclesModel.countDocuments();
    stats.vehiculosDisponibles = vehicleStats.find(v => v._id === 'Disponible')?.count || 0;
    stats.vehiculosReservados = vehicleStats.find(v => v._id === 'Reservado')?.count || 0;
    stats.vehiculosEnMantenimiento = vehicleStats.find(v => v._id === 'Mantenimiento')?.count || 0;

    // Contar clientes
    stats.clientesCount = await clientsModel.countDocuments();

    // Contar empleados
    stats.empleadosCount = await employeesModel.countDocuments();

    // Contar mantenimientos activos
    stats.mantenimientosActivos = await maintenancesModel.countDocuments({ status: 'Active' });

    // Contar reservas por estado
    const reservationStats = await reservationsModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    stats.reservasActivas = reservationStats.find(r => r._id === 'Active')?.count || 0;
    stats.reservasPendientes = reservationStats.find(r => r._id === 'Pending')?.count || 0;
    stats.reservasCompletadas = reservationStats.find(r => r._id === 'Completed')?.count || 0;

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas del dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

export default dashboardController;