import { useMemo } from 'react';

// Hook para obtener las clases únicas de los vehículos usando el campo del backend (vehicleClass)
export const useTypes = (vehicles) => {
  return useMemo(() => {
    if (!Array.isArray(vehicles)) return [];
    // Usa el campo exacto del backend: vehicleClass
    const types = vehicles
      .map(v => (typeof v.vehicleClass === 'string' ? v.vehicleClass.trim().toLowerCase() : ''))
      .filter(Boolean);
    return Array.from(new Set(types)).sort();
  }, [vehicles]);
};

// Hook para obtener las marcas únicas de los vehículos usando exactamente el campo del backend (brandId?.brandName)
export const useBrands = (vehicles) => {
  return useMemo(() => {
    if (!Array.isArray(vehicles)) return [];
    // Usa el campo exacto del backend: brandId?.brandName
    const brands = vehicles
      .map(v => (typeof v.brandId?.brandName === 'string' ? v.brandId.brandName.trim() : ''))
      .filter(Boolean);
    return Array.from(new Set(brands)).sort();
  }, [vehicles]);
};

// Hook para filtrar vehículos según los filtros seleccionados
export const useFilteredVehicles = (vehicles, filters) => {
  return useMemo(() => {
    if (!vehicles || !Array.isArray(vehicles)) return [];

    let vehiclesFiltered = [...vehicles];

    // Filtrar por marca usando el campo exacto del backend (brandId?.brandName)
    if (filters.brands && filters.brands.length > 0) {
      vehiclesFiltered = vehiclesFiltered.filter(v => {
        const brandName = v.brandId?.brandName?.trim();
        if (!brandName || typeof brandName !== 'string') return false;
        return filters.brands.includes(brandName);
      });
    }

    // Filtrar por clase
    if (filters.types && filters.types.length > 0) {
      vehiclesFiltered = vehiclesFiltered.filter(v => {
        const type = v.vehicleClass;
        if (!type || typeof type !== 'string') return false;
        return filters.types.includes(type.trim().toLowerCase());
      });
    }

    // Filtrar por estado
    if (filters.statuses && filters.statuses.length > 0) {
      vehiclesFiltered = vehiclesFiltered.filter(v => {
        const state = v.status;
        if (!state || typeof state !== 'string') return false;
        return filters.statuses.includes(state);
      });
    }

    return vehiclesFiltered;
  }, [vehicles, filters]);
};
