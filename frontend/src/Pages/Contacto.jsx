import React from 'react';
import './styles/Contacto.css';
import contactHeader from '../assets/contactHeader.png';
import LocationIcon from '../assets/LocationIcon.png';
import EmailIcon from '../assets/EmailIcon.png';
import PhoneIcon from '../assets/PhoneIcon.png';
import useContactoForm from '../hooks/pages/useContactoForm';

const Contacto = () => {
  const {
    form,
    enviado,
    telefonoError,
    error,
    loading,
    handleChange,
    handleSubmit,
  } = useContactoForm();

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

      <section className="contacto-section">
        <form
          onSubmit={handleSubmit}
          className="contacto-form"
        >
          <div className="contacto-form-row">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <div className="contacto-form-col">
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
            disabled={!!telefonoError || loading}
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
          {enviado && (
            <div className="success">
              ¡Mensaje enviado! Nos pondremos en contacto pronto.
            </div>
          )}
          {error && (
            <div className="error">
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