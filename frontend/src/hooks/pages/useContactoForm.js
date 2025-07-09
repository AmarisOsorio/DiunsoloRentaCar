
import { useState } from 'react';

function useContactoForm() {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.nombre) newErrors.nombre = 'El nombre es requerido';
    if (!form.email) newErrors.email = 'El email es requerido';
    if (!form.mensaje) newErrors.mensaje = 'El mensaje es requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    // Aquí puedes agregar la lógica para enviar el formulario
    setIsSubmitting(false);
  };

  return {
    form,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit
  };
}

export default useContactoForm;
