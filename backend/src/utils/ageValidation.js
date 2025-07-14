/**
 * Calcula la edad exacta de una persona basada en su fecha de nacimiento
 * @param {Date|string} fechaNacimiento - Fecha de nacimiento
 * @returns {number} - Edad en años
 */
export const calcularEdad = (fechaNacimiento) => {
  const fechaNac = new Date(fechaNacimiento);
  const fechaActual = new Date();
  
  const edad = fechaActual.getFullYear() - fechaNac.getFullYear();
  const mesActual = fechaActual.getMonth();
  const diaActual = fechaActual.getDate();
  const mesNacimiento = fechaNac.getMonth();
  const diaNacimiento = fechaNac.getDate();
  
  // Ajustar la edad si aún no ha cumpleaños este año
  const edadReal = edad - (mesActual < mesNacimiento || (mesActual === mesNacimiento && diaActual < diaNacimiento) ? 1 : 0);
  
  return edadReal;
};

/**
 * Valida que una persona sea mayor de edad (18 años)
 * @param {Date|string} fechaNacimiento - Fecha de nacimiento
 * @returns {boolean} - true si es mayor de edad, false si no
 */
export const esMayorDeEdad = (fechaNacimiento) => {
  return calcularEdad(fechaNacimiento) >= 18;
};

/**
 * Valida fecha de nacimiento y retorna error si es menor de edad
 * @param {Date|string} fechaNacimiento - Fecha de nacimiento
 * @returns {object|null} - Objeto con error si es menor de edad, null si es válido
*/
export const validarEdadMinima = (fechaNacimiento) => {
  const edad = calcularEdad(fechaNacimiento);
  
  if (edad < 18) {
    return {
      isValid: false,
      message: 'Debes ser mayor de 18 años para usar nuestros servicios',
      edad: edad
    };
  }
  
  return {
    isValid: true,
    edad: edad
  };
};
