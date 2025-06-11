import React, { useState } from 'react';
import '../components/styles/Home.css';
import contactHeader from '../assets/contactHeader.png';
import LocationIcon from '../assets/LocationIcon.png';
import EmailIcon from '../assets/EmailIcon.png';
import PhoneIcon from '../assets/PhoneIcon.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const ContactPage = () => {
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', mensaje: '' });
  const [isSent, setIsSent] = useState(false);
  const [telefonoError, setTelefonoError] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    setIsSent(false);

    // Validación final de teléfono
    const regex = /^[267][0-9]{3}-[0-9]{4}$/;
    if (!regex.test(form.telefono)) {
      setTelefonoError('Ingrese un teléfono válido de 8 dígitos (inicia con 2, 6 o 7)');
      return;
    }
    setTelefonoError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/contacto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (response.ok) {
        setIsSent(true);
        setForm({ nombre: '', telefono: '', email: '', mensaje: '' });
      } else {
        setError('Ocurrió un error al enviar el mensaje. Intenta nuevamente.');
      }
    } catch (err) {
      setError('Ocurrió un error al enviar el mensaje. Intenta nuevamente.');
    }
    setIsLoading(false);
  };

  return (
    <div style={{ background: "#f9f9f9", minHeight: "100vh", paddingBottom: "2rem" }}>
      {/* Header igual al de Home.jsx */}
      <header
        className="header-container"
        style={{
          background: `url(${contactHeader}) no-repeat center center/cover`,
          height: 300,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="header-overlay">
          <h1>Contáctanos</h1>
          <p>Le atenderemos lo más pronto posible</p>
        </div>
      </header>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#eaf6ff",
            borderRadius: 20,
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            boxShadow: "0 2px 12px #0001",
            marginBottom: "2rem"
          }}
        >
          <div style={{ display: "flex", gap: "1rem" }}>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              style={{
                flex: 1,
                padding: "0.8rem",
                borderRadius: 20,
                border: "2px solid #b6e0fc",
                fontSize: "1rem",
                outline: "none",
                background: "#fff"
              }}
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
                style={{
                  padding: "0.8rem",
                  borderRadius: 20,
                  border: telefonoError ? "2px solid #e74c3c" : "2px solid #b6e0fc",
                  fontSize: "1rem",
                  outline: "none",
                  background: "#fff"
                }}
              />
              {telefonoError && (
                <span style={{ color: "#e74c3c", fontSize: 13, marginTop: 2 }}>{telefonoError}</span>
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
            style={{
              padding: "0.8rem",
              borderRadius: 20,
              border: "2px solid #b6e0fc",
              fontSize: "1rem",
              outline: "none",
              background: "#fff"
            }}
          />
          <textarea
            name="mensaje"
            placeholder="Mensaje"
            value={form.mensaje}
            onChange={handleChange}
            required
            rows={4}
            style={{
              padding: "0.8rem",
              borderRadius: 20,
              border: "2px solid #b6e0fc",
              fontSize: "1rem",
              outline: "none",
              background: "#fff",
              resize: "none"
            }}
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
            disabled={!!telefonoError || isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar'}
          </button>
          {isSent && (
            <div style={{ color: 'green', textAlign: 'center', fontWeight: 'bold', marginTop: 10 }}>
              ¡Mensaje enviado! Nos pondremos en contacto pronto.
            </div>
          )}
          {error && (
            <div style={{ color: 'red', textAlign: 'center', fontWeight: 'bold', marginTop: 10 }}>
              {error}
            </div>
          )}
        </form>

        {/* Info boxes */}
        <div style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap"
        }}>
          {/* Ubicación */}
          <div style={{
            flex: 1,
            minWidth: 220,
            background: "#eaf6ff",
            borderRadius: 20,
            padding: 0,
            display: "flex",
            alignItems: "center",
            boxShadow: "0 2px 8px #0001",
            overflow: "hidden",
            position: "relative",
            height: 100
          }}>
            <div style={{
              display: "inline-block",
              background: "#eaf6ff",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "1.2rem 1rem"
            }}>
              <div style={{ fontWeight: 700, color: "#0a2740", fontSize: 18, marginBottom: 2 }}>Encuéntranos</div>
              <div style={{ color: "#0a2740", fontSize: 15, textAlign: "center", lineHeight: 1.2 }}>
                Avenida El Rosario,<br />
                Santa Tecla, La Libertad, El Salvador
              </div>
            </div>
          </div>
          {/* Correo */}
          <div style={{
            flex: 1,
            minWidth: 220,
            background: "#cbeafd",
            borderRadius: 20,
            padding: 0,
            display: "flex",
            alignItems: "center",
            boxShadow: "0 2px 8px #0001",
            overflow: "hidden",
            position: "relative",
            height: 100
          }}>
            <div style={{
              display: "inline-block",
              background: "#fff",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "1.2rem 1rem"
            }}>
              <div style={{ fontWeight: 700, color: "#0a2740", fontSize: 18, marginBottom: 2 }}>Correo electrónico</div>
              <div style={{ color: "#0a2740", fontSize: 15, textAlign: "center" }}>renta@diunsolo.rent</div>
            </div>
          </div>
          {/* Teléfono */}
          <div style={{
            flex: 1,
            minWidth: 220,
            background: "#29abe2",
            borderRadius: 20,
            padding: 0,
            display: "flex",
            alignItems: "center",
            boxShadow: "0 2px 8px #0001",
            overflow: "hidden",
            position: "relative",
            height: 100
          }}>
            <div style={{
              display: "inline-block",
              background: "#fff",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "1.2rem 1rem"
            }}>
              <div style={{ fontWeight: 700, color: "#fff", fontSize: 20, marginBottom: 2 }}>Teléfono</div>
              <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>7423–4724</div>
            </div>
          </div>
        </div>

        {/* Mapa y horarios */}
        <div style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap"
        }}>
          <div style={{
            flex: 2,
            minWidth: 260,
            background: "#fff",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 2px 8px #0001"
          }}>
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
          <div style={{
            flex: 1,
            minWidth: 220,
            background: "#eaf6ff",
            borderRadius: 16,
            padding: "1.2rem",
            boxShadow: "0 2px 8px #0001",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}>
            <div style={{ fontWeight: 700, color: "#0a2740", fontSize: "1.1rem", marginBottom: 8 }}>Horarios de atención</div>
            <div style={{ color: "#0a2740", fontWeight: 600, marginBottom: 4 }}>Oficina Central</div>
            <div style={{ color: "#555", fontSize: 14 }}>
              Lunes a Viernes de 7:00 am a 5:30 pm<br />
              Sábados de 8:00 am a 12:00pm
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
