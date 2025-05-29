import { useState } from 'react';

// Custom hook to manage the registration form state and input changes
const useRegisterForm = () => {
  const [form, setForm] = useState({
    nombre: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    email: '',
    licencia: null,
    pasaporte: null,
    nacimiento: '',
    licenciaPreview: null, // State for license image preview URL
    pasaportePreview: null // State for passport/DUI image preview URL
  });

  // Handles changes to form input fields, including file inputs.
  const handleChange = e => {
    const { name, value, files } = e.target;

    setForm(prev => {
      if (files && files[0]) {
        // If a file is selected, create a URL for preview and store the file object
        return {
          ...prev,
          [name]: files[0],
          [`${name}Preview`]: URL.createObjectURL(files[0])
        };
      } else if (name === 'licencia' || name === 'pasaporte') {
        // If the file input is cleared, remove the file and its preview
        return {
          ...prev,
          [name]: null,
          [`${name}Preview`]: null
        };
      } else {
        // For regular text inputs, just update the value
        return {
          ...prev,
          [name]: value
        };
      }
    });
  };

  // Return the form state and the handleChange function
  return { form, handleChange, setForm };
};

export default useRegisterForm;
