import { useState, useEffect, useCallback } from 'react';

// URL de producción para la API
const API_BASE_URL = 'https://diunsolorentacar.onrender.com/api';

export const useFetchBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para obtener todas las marcas
  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/brands`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 15000,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      // El backend devuelve directamente el array de marcas
      if (Array.isArray(result)) {
        const validBrands = result.filter(brand => {
          return brand._id && brand.brandName;
        });

        // Transformar los datos para que coincidan con el formato esperado por el frontend
        const transformedBrands = validBrands.map(brand => ({
          id: brand._id,
          name: brand.brandName,
          logo: brand.logo,
        }));

        setBrands(transformedBrands);
      } else {
        throw new Error('Formato de respuesta inesperado del servidor');
      }
    } catch (err) {
      let errorMessage = 'Error desconocido';
      
      if (err.message.includes('Network request failed') || err.message.includes('fetch')) {
        errorMessage = 'No se puede conectar al servidor. Verifica que el backend esté ejecutándose en ' + API_BASE_URL;
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Tiempo de espera agotado. El servidor tardó demasiado en responder.';
      } else if (err.message.includes('JSON')) {
        errorMessage = 'Error al procesar la respuesta del servidor.';
      } else if (err.message.includes('404')) {
        errorMessage = 'Endpoint no encontrado. Verifica que la ruta /api/brands esté disponible.';
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para refrescar marcas
  const refreshBrands = useCallback(async () => {
    await fetchBrands();
  }, [fetchBrands]);

  // Función para crear una nueva marca
  const createBrand = useCallback(async (brandData) => {
    try {
      setError(null);

      // Crear FormData para enviar archivo de imagen
      const formData = new FormData();
      formData.append('brandName', brandData.name);
      
      if (brandData.logo) {
        // Si es una URI local de imagen, crear un objeto File
        const imageUri = brandData.logo;
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';
        
        formData.append('logo', {
          uri: imageUri,
          name: filename,
          type: type,
        });
      }

      const response = await fetch(`${API_BASE_URL}/brands`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al crear marca');
      }

      // Refrescar la lista después de crear
      await fetchBrands();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchBrands]);

  // Función para eliminar una marca
  const deleteBrand = useCallback(async (id) => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE_URL}/brands/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al eliminar marca');
      }

      // Actualizar la lista local
      setBrands(prev => 
        prev.filter(brand => brand.id !== id)
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Función para actualizar una marca
  const updateBrand = useCallback(async (id, brandData) => {
    try {
      setError(null);

      // Crear FormData para enviar archivo de imagen
      const formData = new FormData();
      
      if (brandData.name) {
        formData.append('brandName', brandData.name);
      }
      
      if (brandData.logo && brandData.logo !== brands.find(b => b.id === id)?.logo) {
        // Solo añadir logo si es diferente al actual
        const imageUri = brandData.logo;
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';
        
        formData.append('logo', {
          uri: imageUri,
          name: filename,
          type: type,
        });
      }

      const response = await fetch(`${API_BASE_URL}/brands/${id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar marca');
      }

      // Refrescar la lista después de actualizar
      await fetchBrands();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [brands, fetchBrands]);

  // Función para buscar marcas por nombre
  const searchBrands = useCallback((query) => {
    if (!query) return brands;
    
    return brands.filter(brand =>
      brand.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [brands]);

  // Función para obtener marca por ID
  const getBrandById = useCallback((id) => {
    return brands.find(brand => brand.id === id);
  }, [brands]);

  // Cargar marcas al inicializar el hook
  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return {
    // Estados
    brands,
    loading,
    error,

    // Funciones principales
    fetchBrands,
    refreshBrands,
    createBrand,
    deleteBrand,
    updateBrand,
    searchBrands,
    getBrandById,
  };
};