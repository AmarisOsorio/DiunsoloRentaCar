import React, { useEffect } from 'react';
import './TerminosCondiciones.css';
import ToSHeader from '../../assets/ToSHeader.png';

const TerminosCondiciones = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terminos-bg">
      <header
        className="terminos-header"
        style={{ backgroundImage: `url(${ToSHeader})` }}
      >
        <div className="header-overlay">
          <h1>Términos y Condiciones</h1>
          <p>Por favor, lee cuidadosamente antes de utilizar nuestros servicios.</p>
        </div>
      </header>
      <section className="terminos-section">
        <div className="terminos-content">
          <h2>1. Aceptación de los términos</h2>
          <p>
            Al utilizar los servicios de DIUNSOLO Renta Car, aceptas cumplir con estos términos y condiciones. Si no estás de acuerdo, por favor no utilices nuestros servicios.
          </p>
          <h2>2. Reservas y pagos</h2>
          <ul>
            <li>Las reservas están sujetas a disponibilidad de vehículos.</li>
            <li>El pago debe realizarse según las condiciones acordadas al momento de la reserva.</li>
            <li>Nos reservamos el derecho de cancelar reservas en caso de incumplimiento de pago.</li>
          </ul>
          <h2>3. Uso del vehículo</h2>
          <ul>
            <li>El arrendatario es responsable del uso adecuado del vehículo.</li>
            <li>No está permitido subarrendar, vender o transferir el vehículo a terceros.</li>
            <li>El vehículo debe devolverse en las mismas condiciones en que fue entregado.</li>
          </ul>
          <h2>4. Responsabilidad y seguros</h2>
          <ul>
            <li>El arrendatario debe cumplir con las leyes de tránsito vigentes.</li>
            <li>En caso de accidente, debe notificar inmediatamente a DIUNSOLO Renta Car.</li>
            <li>El seguro cubre únicamente los daños especificados en el contrato.</li>
          </ul>
          <h2>5. Modificaciones</h2>
          <p>
            DIUNSOLO Renta Car se reserva el derecho de modificar estos términos y condiciones en cualquier momento. Los cambios serán publicados en nuestro sitio web.
          </p>

          <hr style={{ margin: "2.5rem 0" }} />

          <h2>Políticas de Privacidad de Diunsolo Renta Car</h2>
          <p>
            En Diunsolo Renta Car nos comprometemos a proteger la privacidad y seguridad de los datos personales de nuestros clientes. Esta Política de Privacidad describe cómo recopilamos, utilizamos, protegemos y, en su caso, compartimos la información personal que nos proporcionas durante el proceso de renta de vehículos. Nos regimos por los principios de confidencialidad, transparencia y cumplimiento con las leyes aplicables en materia de protección de datos.
          </p>
          <h3>1. Información que recopilamos</h3>
          <p>
            Recopilamos la información personal necesaria para procesar la renta de vehículos y garantizar un servicio seguro y eficiente. Esta información puede incluir:
          </p>
          <ul>
            <li><b>Datos de identificación:</b> Nombre completo, fecha de nacimiento, dirección, número de teléfono, correo electrónico, Dirección Física de vivienda.</li>
            <li><b>Documentos oficiales:</b> Copia de licencia de conducir, pasaporte, identificación oficial u otros documentos necesarios para verificar tu identidad y cumplir con los requisitos legales para la renta de un vehículo.</li>
            <li><b>Información financiera:</b> Datos de tarjetas de crédito o débito, únicamente para procesar pagos, depósitos de garantía o cargos relacionados con la renta o daños a vehículos.</li>
            <li><b>Datos de la renta:</b> Detalles del contrato de renta, como fechas, tipo de vehículo, destinos, kilometraje y preferencias adicionales.</li>
            <li><b>Información de uso:</b> En algunos casos, datos relacionados con el uso del vehículo (por ejemplo, GPS, si aplica), siempre con tu consentimiento previo.</li>
          </ul>
          <h3>2. Finalidad de los datos recopilados</h3>
          <p>
            Los datos personales que proporcionas son utilizados exclusivamente para los siguientes fines:
          </p>
          <ul>
            <li>Verificar tu identidad y elegibilidad para rentar un vehículo.</li>
            <li>Procesar y gestionar la renta, incluyendo la elaboración de contratos y facturación.</li>
            <li>Garantizar la seguridad del vehículo y del cliente durante el periodo de renta.</li>
            <li>Cumplir con obligaciones legales de tránsito, seguros de coberturas, fiscales o regulatorias aplicables.</li>
            <li>Atender solicitudes, quejas o aclaraciones relacionadas con el servicio.</li>
            <li>Enviar comunicaciones relacionadas con la renta, como confirmaciones, recordatorios o actualizaciones, siempre que hayas autorizado dichas comunicaciones (nos autorizas a contactarnos desde el momento de la comunicación inicial).</li>
          </ul>
          <p>
            No utilizamos tus datos personales para fines distintos a los mencionados, salvo que contemos con tu consentimiento expreso o lo exija la ley.
          </p>
          <h3>3. Confidencialidad y seguridad de los datos</h3>
          <p>
            En Diunsolo Renta Car, tratamos tus datos personales con la máxima confidencialidad. Implementamos medidas técnicas, físicas y administrativas para proteger tu información contra accesos no autorizados, pérdida, alteración o divulgación. Estas medidas incluyen:
          </p>
          <ul>
            <li>Almacenamiento seguro de datos en sistemas protegidos con cifrado.</li>
            <li>Acceso restringido a la información solo para el personal autorizado.</li>
            <li>Destrucción segura de documentos físicos o digitales una vez que ya no son necesarios, conforme a las leyes aplicables.</li>
          </ul>
          <h3>4. Compartición de datos</h3>
          <p>
            No compartimos tus datos personales con terceros, salvo en los siguientes casos:
          </p>
          <ul>
            <li>Cuando sea necesario para cumplir con una obligación legal, como reportes a autoridades competentes, seguros de cobertura en casos de accidentes, emergencia médica hospitalaria.</li>
            <li>Con proveedores de servicios esenciales para la renta (por ejemplo, procesadores de pagos o aseguradoras), quienes están obligados a cumplir con nuestras políticas de confidencialidad.</li>
            <li>Cuando lo autorices expresamente, por ejemplo, para fines de marketing o promociones, salvo promociones o notificaciones de descuentos internos de nuestro servicio de renta car.</li>
          </ul>
          <h3>5. Conservación de los datos</h3>
          <p>
            Conservamos tus datos personales únicamente durante el tiempo necesario para cumplir con los fines descritos en esta política (1 mes). Una vez cumplido dicho periodo, tus datos serán eliminados o anonimizados de manera segura.
          </p>
          <h3>6. Derechos del titular de los datos</h3>
          <p>
            Como titular de los datos personales, tienes derecho a:
          </p>
          <ul>
            <li><b>Acceso:</b> Conocer qué datos personales.</li>
            <li><b>Rectificación:</b> Corregir datos inexactos o incompletos equivocados.</li>
            <li><b>Cancelación:</b> Solicitar la eliminación de tus datos, siempre que no exista una obligación legal para conservarlos.</li>
            <li><b>Oposición:</b> Oponerte al uso de tus datos para fines específicos, como comunicaciones comerciales.</li>
          </ul>
          <p>
            Para ejercer estos derechos, puedes contactarnos a través de <a href="mailto:renta@diunsolo.rent">renta@diunsolo.rent</a>. Te responderemos en los plazos hábiles y horarios hábiles de trabajo.
          </p>
          <h3>7. Consentimiento</h3>
          <p>
            Al proporcionarnos tus datos personales, aceptas las condiciones descritas en esta Política de Privacidad. En caso de no estar de acuerdo, no podremos ofrecerte ningún servicio de renta de vehículos, tampoco servicio de movilidad interna en El Salvador.
          </p>
          <h3>8. Menores de edad</h3>
          <p>
            No recopilamos intencionalmente datos personales de menores de edad sin el consentimiento de sus padres o tutores legales. Si eres menor de edad, por favor no nos proporciones información personal sin dicha autorización.
          </p>
          <h3>9. Cambios a la Política de Privacidad</h3>
          <p>
            Nos reservamos el derecho de actualizar esta Política de Privacidad para reflejar cambios en nuestras prácticas o en la legislación aplicable. Cualquier modificación será publicada en nuestro sitio web <a href="https://www.diunsolo.rent" target="_blank" rel="noopener noreferrer">www.diunsolo.rent</a> y, si es necesario, te notificaremos por correo electrónico.
          </p>
          <h3>10. Contacto</h3>
          <p>
            Si tienes preguntas o inquietudes contáctanos en:<br />
            <b>Correo electrónico:</b> <a href="mailto:renta@diunsolo.rent">renta@diunsolo.rent</a><br />
            <b>Teléfono:</b> +503 7423-4724<br />
            <b>Dirección:</b> Av El Rosario #49 Ciudad Merliot, Santa Tecla El Salvador C.A<br />
            <b>Sitio web:</b> <a href="https://www.diunsolo.rent" target="_blank" rel="noopener noreferrer">www.diunsolo.rent</a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default TerminosCondiciones;