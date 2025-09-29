import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://diunsolorentacar.onrender.com/api';

export default function useContactoForm() {
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', mensaje: '' });
  const [enviado, setEnviado] = useState(false);
  const [telefonoError, setTelefonoError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;

    if (name === 'telefono') {
      let soloNumeros = value.replace(/\D/g, '').slice(0, 8);
      let formateado = soloNumeros;
      if (soloNumeros.length > 4) {
        formateado = soloNumeros.slice(0, 4) + '-' + soloNumeros.slice(4);
      }
      setForm({ ...form, telefono: formateado });

      const regex = /^[267][0-9]{3}-[0-9]{4}$/;
      if (formateado.length === 9 && !regex.test(formateado)) {
        setTelefonoError('Ingrese un teléfono válido de 8 dígitos (inicia con 2, 6 o 7)');
      } else {
        setTelefonoError('');
      }
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setEnviado(false);

    const regex = /^[267][0-9]{3}-[0-9]{4}$/;
    if (!regex.test(form.telefono)) {
      setTelefonoError('Ingrese un teléfono válido de 8 dígitos (inicia con 2, 6 o 7)');
      return;
    }
    setTelefonoError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (response.ok) {
        setEnviado(true);
        setForm({ nombre: '', telefono: '', email: '', mensaje: '' });
      } else {
        setError('Ocurrió un error al enviar el mensaje. Intenta nuevamente.');
      }
    } catch (err) {
      setError('Ocurrió un error al enviar el mensaje. Intenta nuevamente.');
    }
    setLoading(false);
  };

  return {
    form,
    enviado,
    telefonoError,
    error,
    loading,
    handleChange,
    handleSubmit,
  };
}