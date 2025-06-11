import React, { useState } from 'react';
import './styles/Contacto.css';
import contactHeader from '../assets/contactHeader.png';
import LocationIcon from '../assets/LocationIcon.png';
import EmailIcon from '../assets/EmailIcon.png';
import PhoneIcon from '../assets/PhoneIcon.png';
import useContactoForm from '../hooks/useContactoForm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const Contacto = () => {
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', mensaje: '' });
  const [enviado, setEnviado] = useState(false);
  const [telefonoError, setTelefonoError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;

    if (name === 'telefono') {
      // Solo números, máximo 8 dígitos, formato ####-####
      let soloNumeros = value.replace(/\D/g, '').slice(0, 8);
      let formateado = soloNumeros;
      if (soloNumeros.length > 4) {
        formateado = soloNumeros.slice(0, 4) + '-' + soloNumeros.slice(4);
      }
      setForm({ ...form, telefono: formateado });

      // Validación
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

    // Validación final de teléfono
    const regex = /^[267][0-9]{3}-[0-9]{4}$/;
    if (!regex.test(form.telefono)) {
      setTelefonoError('Ingrese un teléfono válido de 8 dígitos (inicia con 2, 6 o 7)');
      return;
    }
    setTelefonoError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/contacto`, {
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

  return (
    <div className="contacto-bg">
      <header
        className="contacto-header"
        style={{ backgroundImage: `url(${contactHeader})` }}
      >
        <div className="header-overlay">
          <h1>Contáctanos</h1>
          <p>Le atenderemos lo más pronto posible</p>
        </div>
      </header>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
        <form
          onSubmit={handleSubmit}
          className="contacto-form"
        >
          <div style={{ display: "flex", gap: "1rem" }}>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              style={{ flex: 1 }}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <input
                type="text"
                name="telefono"
                placeholder="Teléfono"
                value={form.telefono}
                onChange={handleChange}
                required
                maxLength={9}
                inputMode="numeric"
                pattern="[0-9]{4}-[0-9]{4}"
              />
              {telefonoError && (
                <span className="error">{telefonoError}</span>
              )}
            </div>
          </div>
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
            required
          />
          <textarea
            name="mensaje"
            placeholder="Mensaje"
            value={form.mensaje}
            onChange={handleChange}
            required
            rows={4}
          />
          <button
            type="submit"
            style={{
              alignSelf: "flex-end",
              padding: "0.6rem 2.5rem",
              borderRadius: 20,
              border: "2px solid #0a2740",
              background: "#fff",
              color: "#0a2740",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: "pointer",
              transition: "background 0.2s, color 0.2s"
            }}
            disabled={!!telefonoError || loading}
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
          {enviado && (
            <div style={{ color: 'green', textAlign: 'center', fontWeight: 'bold', marginTop: 10 }}>
              ¡Mensaje enviado! Nos pondremos en contacto pronto.
            </div>
          )}
          {error && (
            <div className="error">
              {error}
            </div>
          )}
        </form>

        <div className="info-boxes">
          <div className="info-card ubicacion">
            <img
              src={LocationIcon}
              alt="Ubicación"
              className="info-card-img"
            />
            <div className="info-card-content">
              <div className="title">Encuéntranos</div>
              <div className="subtitle">
                Avenida El Rosario,<br />
                Santa Tecla, La Libertad, El Salvador
              </div>
            </div>
          </div>
          <div className="info-card correo">
            <img
              src={EmailIcon}
              alt="Correo"
              className="info-card-img"
            />
            <div className="info-card-content">
              <div className="title">Correo electrónico</div>
              <div className="subtitle">renta@diunsolo.rent</div>
            </div>
          </div>
          <div className="info-card telefono">
            <img
              src={PhoneIcon}
              alt="Teléfono"
              className="info-card-img"
            />
            <div className="info-card-content">
              <div className="title">Teléfono</div>
              <div className="subtitle">7423–4724</div>
            </div>
          </div>
        </div>

        <div className="contacto-mapa-horarios">
          <div className="contacto-mapa">
            <iframe
              title="Ubicación"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3877.019889232747!2d-89.2733566846066!3d13.67685799039759!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f6330b6b8b7b8e1%3A0x6e6e6e6e6e6e6e6e!2sAvenida%20El%20Rosario%2C%20Santa%20Tecla!5e0!3m2!1ses-419!2ssv!4v1686350000000!5m2!1ses-419!2ssv"
              width="100%"
              height="220"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="contacto-horarios">
            <div className="title">Horarios de atención</div>
            <div className="subtitle">Oficina Central</div>
            <div className="text">
              Lunes a Viernes de 7:00 am a 5:30 pm<br />
              Sábados de 8:00 am a 12:00pm
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contacto;
