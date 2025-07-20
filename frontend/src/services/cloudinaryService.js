/**
 * Servicio para manejar la subida de imágenes a Cloudinary
 */

export const uploadImageToCloudinary = async (file, folder = 'vehiculos') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch('/api/upload/upload-image', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al subir la imagen');
    }

    const result = await response.json();
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const uploadMultipleImagesToCloudinary = async (files, folder = 'vehiculos') => {
  try {
    const uploadPromises = files.map(file => uploadImageToCloudinary(file, folder));
    const results = await Promise.all(uploadPromises);
    
    const successResults = results.filter(result => result.success);
    const failedResults = results.filter(result => !result.success);
    
    return {
      success: failedResults.length === 0,
      successCount: successResults.length,
      failedCount: failedResults.length,
      urls: successResults.map(result => result.url),
      publicIds: successResults.map(result => result.public_id),
      errors: failedResults.map(result => result.error)
    };
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const deleteImageFromCloudinary = async (publicId) => {
  try {
    const response = await fetch('/api/upload/delete-image', {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ public_id: publicId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar la imagen');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};