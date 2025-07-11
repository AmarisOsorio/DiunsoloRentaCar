import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class PdfGenerator {
  
  // Función para obtener la ruta de la imagen del logo
  getLogoImagePath() {
    const possiblePaths = [
      path.join(process.cwd(), 'assets', 'diunsolo-logo.png'),
      path.join(process.cwd(), 'assets', 'diunsolo-logo.jpg'),
      path.join(process.cwd(), 'assets', 'diunsolo-logo.jpeg'),
    ];

    for (const logoPath of possiblePaths) {
      if (fs.existsSync(logoPath)) {
        console.log('✅ Logo encontrado en:', logoPath);
        return logoPath;
      }
    }

    console.log('⚠️ Logo real no encontrado. Usando placeholder.');
    return null;
  }
  
  async generateContratoArrendamiento(vehiculoData) {
    // Limpiar archivos temporales antiguos antes de generar nuevo PDF
    await this.cleanupTempFiles();
    
    const logoPath = this.getLogoImagePath();
    const htmlTemplate = this.getHtmlTemplate(vehiculoData, logoPath);
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      
      // Si hay un logo real, permitir el acceso a archivos locales
      if (logoPath) {
        await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });
      } else {
        await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });
      }
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });
      
      // Limpiar el nombre del vehículo para usar en el nombre del archivo
      const nombreLimpio = vehiculoData.nombreVehiculo
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remover caracteres especiales
        .replace(/\s+/g, '-') // Reemplazar espacios con guiones
        .toUpperCase(); // Convertir a mayúsculas
      
      console.log('🔧 Nombre original:', vehiculoData.nombreVehiculo);
      console.log('🔧 Nombre limpio:', nombreLimpio);
      
      // SUBIR A CLOUDINARY (SIN FALLBACK LOCAL - SOLO CLOUDINARY)
      const timestamp = Date.now();
      const publicId = `${nombreLimpio}-CONTRATO-DE-ARRENDAMIENTO-DE-VEHICULO-${timestamp}`;
      
      console.log('🔧 Public ID que se usará:', publicId);
      console.log('☁️ Subiendo PDF a Cloudinary...');
      console.log('📊 Tamaño del PDF buffer:', pdfBuffer.length, 'bytes');
      
      // Subir como raw 
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'contratos',
            resource_type: 'raw',
            public_id: publicId,
            use_filename: false,
            unique_filename: false // Cambiar a false para usar exactamente el public_id especificado
          },
          (error, result) => {
            if (error) {
              console.error('❌ Error subiendo a Cloudinary:', error);
              reject(error);
            } else {
              console.log('✅ Upload result completo:', {
                public_id: result.public_id,
                secure_url: result.secure_url,
                resource_type: result.resource_type,
                bytes: result.bytes,
                format: result.format
              });
              resolve(result);
            }
          }
        ).end(pdfBuffer);
      });
      
      // Usar directamente la URL de Cloudinary para evitar dependencia del backend
      console.log('✅ PDF subido a Cloudinary exitosamente');
      console.log('🔗 URL de Cloudinary:', uploadResult.secure_url);
      
      // Devolver la URL directa de Cloudinary
      return uploadResult.secure_url;
      
    } finally {
      await browser.close();
    }
  }

  // Función para limpiar archivos temporales antiguos (más de 1 hora)
  async cleanupTempFiles() {
    const tempDir = path.join(process.cwd(), 'temp');
    
    if (!fs.existsSync(tempDir)) {
      return;
    }

    const files = fs.readdirSync(tempDir);
    const oneHourAgo = Date.now() - (60 * 60 * 1000);

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.birthtime.getTime() < oneHourAgo) {
        try {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Archivo temporal eliminado: ${file}`);
        } catch (error) {
          console.error(`❌ Error eliminando archivo temporal ${file}:`, error);
        }
      }
    }
  }

  getHtmlTemplate(vehiculo, logoPath) {
    // Generar la imagen del logo - usar imagen física si existe, sino placeholder
    let logoElement;
    if (logoPath) {
      try {
        // Leer la imagen y convertirla a base64 para insertarla directamente
        const imageBuffer = fs.readFileSync(logoPath);
        const ext = path.extname(logoPath).toLowerCase();
        let mimeType = 'image/png';
        if (ext === '.jpg' || ext === '.jpeg') {
          mimeType = 'image/jpeg';
        }
        const base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
        logoElement = `<img src="${base64Image}" alt="Diunsolo Rent a Car" class="logo-image">`;
        console.log('✅ Logo real insertado en PDF');
      } catch (error) {
        console.error('❌ Error leyendo logo:', error);
        // Fallback a placeholder si hay error
        logoElement = `
          <div style="width: 400px; height: 100px; margin: 0 auto; display: flex; border-radius: 5px; overflow: hidden; font-family: Arial Black, sans-serif;">
            <!-- Lado azul oscuro con DIUN -->
            <div style="width: 50%; background: linear-gradient(135deg, #1f3a93, #2c5aa0); display: flex; align-items: center; justify-content: center;">
              <span style="color: #ffeb3b; font-size: 28px; font-weight: bold; letter-spacing: 1px;">DIUN</span>
            </div>
            <!-- Lado azul claro con SOLO -->
            <div style="width: 50%; background: linear-gradient(135deg, #00bcd4, #26c6da); display: flex; flex-direction: column; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 28px; font-weight: bold; letter-spacing: 1px;">SOLO</span>
              <span style="color: white; font-size: 10px; letter-spacing: 2px; margin-top: 2px;">RENTA CAR</span>
            </div>
          </div>
        `;
      }
    } else {
      // Usar placeholder que simula el diseño real
      logoElement = `
        <div style="width: 400px; height: 100px; margin: 0 auto; display: flex; border-radius: 5px; overflow: hidden; font-family: Arial Black, sans-serif;">
          <!-- Lado azul oscuro con DIUN -->
          <div style="width: 50%; background: linear-gradient(135deg, #1f3a93, #2c5aa0); display: flex; align-items: center; justify-content: center;">
            <span style="color: #ffeb3b; font-size: 28px; font-weight: bold; letter-spacing: 1px;">DIUN</span>
          </div>
          <!-- Lado azul claro con SOLO -->
          <div style="width: 50%; background: linear-gradient(135deg, #00bcd4, #26c6da); display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 28px; font-weight: bold; letter-spacing: 1px;">SOLO</span>
            <span style="color: white; font-size: 10px; letter-spacing: 2px; margin-top: 2px;">RENTA CAR</span>
          </div>
        </div>
      `;
    }
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          margin: 0;
          padding: 15px;
          color: #000;
        }
        .logo-header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #1f3a93;
          padding-bottom: 12px;
        }
        .logo-container {
          margin-bottom: 12px;
        }
        .logo-image {
          max-width: 350px;
          height: auto;
          margin-bottom: 12px;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        .title {
          font-size: 16px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 20px;
          text-transform: uppercase;
          color: #1f3a93;
        }
        .content {
          text-align: justify;
          margin-bottom: 15px;
          line-height: 1.5;
          font-size: 12px;
        }
        .vehiculo-specs {
          border: 2px solid #1f3a93;
          padding: 12px;
          margin: 15px 0;
          background-color: #f8f9fa;
          border-radius: 5px;
        }
        .specs-title {
          font-weight: bold;
          font-size: 14px;
          text-align: center;
          margin-bottom: 12px;
          color: #1f3a93;
          text-transform: uppercase;
        }
        .specs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .spec-item {
          font-size: 11px;
          padding: 6px;
          background-color: white;
          border-radius: 3px;
          border-left: 3px solid #00bcd4;
        }
        .spec-label {
          font-weight: bold;
          color: #1f3a93;
        }
        .clausulas-section {
          margin-top: 15px;
        }
        .clausulas-title {
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 12px;
          color: #1f3a93;
        }
        .clausula {
          margin-bottom: 10px;
          text-align: justify;
          line-height: 1.4;
          font-size: 12px;
        }
        .clausula-numero {
          font-weight: bold;
          color: #1f3a93;
        }
        .clausula-especial {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          padding: 8px;
          margin: 10px 0;
          border-radius: 3px;
          font-size: 11px;
        }
        .clausula-especial-title {
          font-weight: bold;
          text-align: center;
          margin-bottom: 8px;
          color: #856404;
          text-transform: uppercase;
          font-size: 12px;
        }
        .firmas {
          margin-top: 25px;
          border-top: 2px solid #1f3a93;
          padding-top: 15px;
        }
        .firma-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-top: 30px;
        }
        .firma-box {
          text-align: center;
          padding-top: 15px;
          margin-top: 50px;
          font-size: 14px;
        }
        .page-break {
          page-break-before: always;
        }
      </style>
    </head>
    <body>
      <div class="logo-header">
        <div class="logo-container">
          ${logoElement}
        </div>
        <div class="title">Contrato de Arrendamiento de Vehículo</div>
      </div>

      <div class="content">
        <strong>Nosotros:</strong> <strong>DIUNSOLO RENT A CAR</strong>, empresa constituida bajo las leyes de la República de El Salvador, del domicilio de San Salvador, que en lo sucesivo se denominará <strong>"LA ARRENDANTE"</strong>, representada en este acto por su Representante Legal; y <strong>el señor(a): ________________________________</strong>, de ______ años de edad, de estado civil ____________, de profesión u oficio ____________, del domicilio de ____________, portador(a) de Documento Único de Identidad número ____________________, expedido en ________________, quien en lo sucesivo se denominará <strong>"EL/LA ARRENDATARIO(A)"</strong>, hemos convenido en celebrar el presente <strong>CONTRATO DE ARRENDAMIENTO DE VEHÍCULO AUTOMOTOR</strong>, bajo las condiciones que se detallan en el cuerpo del presente instrumento.
      </div>

      <div class="vehiculo-specs">
        <div class="specs-title">Especificaciones del Vehículo</div>
        <div class="specs-grid">
          <div class="spec-item">
            <span class="spec-label">Vehículo:</span> ${vehiculo.nombreVehiculo || 'N/A'}
          </div>
          <div class="spec-item">
            <span class="spec-label">Marca:</span> ${vehiculo.marca || 'N/A'}
          </div>
          <div class="spec-item">
            <span class="spec-label">Modelo:</span> ${vehiculo.modelo || 'N/A'}
          </div>
          <div class="spec-item">
            <span class="spec-label">Año:</span> ${vehiculo.anio || 'N/A'}
          </div>
          <div class="spec-item">
            <span class="spec-label">Placa:</span> ${vehiculo.placa || 'N/A'}
          </div>
          <div class="spec-item">
            <span class="spec-label">Color:</span> ${vehiculo.color || 'N/A'}
          </div>
          <div class="spec-item">
            <span class="spec-label">Capacidad:</span> ${vehiculo.capacidad || 'N/A'} personas
          </div>
          <div class="spec-item">
            <span class="spec-label">No. Motor:</span> ${vehiculo.numeroMotor || 'N/A'}
          </div>
          <div class="spec-item">
            <span class="spec-label">No. Chasis:</span> ${vehiculo.numeroChasisGrabado || 'N/A'}
          </div>
          <div class="spec-item">
            <span class="spec-label">VIN:</span> ${vehiculo.numeroVinChasis || 'N/A'}
          </div>
        </div>
      </div>

      <div class="clausulas-section">
        <div class="clausulas-title">Contrato que se regirá por las cláusulas siguientes:</div>
        
        <div class="clausula">
          <span class="clausula-numero">I)</span> El/La arrendatario/a recibe en este acto de parte de la arrendante, en la ciudad de: _________________________________________________ a las ____________ horas del día _________________________________________, el vehículo automotor mencionado anteriormente, junto con sus llaves de encendido, tarjeta de circulación, en perfectas condiciones de funcionamiento y en las condiciones físicas y mecánicas que se describirán en el Anexo 1: "Hoja de entrega del vehículo" que se llenará en este acto ante la presencia de el/la arrendatario/a. El vehículo automotor antes descrito, también se encuentra equipado con todos sus accesorios que serán descritos al reverso del presente instrumento en el Anexo 1: "Hoja de entrega del Vehículo", de los cuales es totalmente responsable, obligándose a devolverlo en las mismas condiciones recibidas, comprometiéndose a conducirlo personalmente y mantenerlo solo en el territorio nacional de la República de El Salvador.
        </div>

        <div class="clausula">
          <span class="clausula-numero">II)</span> El arrendamiento del vehículo descrito en el apartado anterior será de: $ _____________________ diarios, siendo la cantidad total a cancelar de: $ ___________________________ de los Estados Unidos de América, lo que equivale al arrendamiento de _________________ días de uso del vehículo y se pagará por anticipado o en su defecto en la manera que expresamente consensuen las partes, pudiendo ser incluso semanal o mensualmente, si así lo acuerdan. Dicho precio podrá ser cancelado por el/la arrendatario, ya sea en efectivo, mediante depósito bancario, pago electrónico por tarjeta de débito o crédito mediante uso de POS o por medio de la plataforma Chivo Wallet que para cualquiera de los casos pondrá a disposición la arrendante.
        </div>

        <div class="clausula">
          <span class="clausula-numero">III)</span> El/La arrendatario/a cancelará un monto de $ ________________________ de los Estados Unidos de América en concepto de Depósito, para cubrir cualquier eventualidad o situación atinente al vehículo objeto de arrendamiento que no pudiera estar prevista en el Presente Contrato, cantidad que deberá ser pagada por anticipado y por cualquiera de las formas de pago antes indicadas en el momento de la entrega del vehículo aquí descrito.
        </div>

        <div class="clausula">
          <span class="clausula-numero">IV)</span> El Plazo pactado de este contrato es de ___________________ días, contados a partir de la hora y fecha mencionada en romano uno de este instrumento, el plazo puede ser prorrogado por períodos iguales, menores o mayores, los cuales serán detallados también al reverso de este contrato de arrendamiento y se tendrán como parte integral del mismo, siempre que la arrendante esté de acuerdo con las prórrogas.
        </div>

        <div class="clausula">
          <span class="clausula-numero">V)</span> El/La arrendatario/a se obliga a cumplir con el plazo pactado, acepta que éste contrato es irrevocable y NO se hacen devoluciones de dinero, aunque el automotor sea devuelto antes del tiempo establecido en este contrato de arrendamiento.
        </div>

        <div class="clausula">
          <span class="clausula-numero">VI)</span> El/La arrendatario/a además se compromete a NO hacer uso indebido o fuera del ordinario del vehículo automotor antes descrito y que pudiera transgredir las Leyes Secundarias Vigentes de la República de El Salvador, tales como: Actos de Delincuencia o comisión de Delitos, Actos de Terrorismo, tráfico ilícito de estupefacientes, carreras clandestinas o de alta velocidad, manejo y conducción en estado de ebriedad, entre otros de carácter ilegal; así como tampoco podrá subarrendarlo o permitir que otros terceros lo utilicen.
        </div>

        <div class="clausula">
          <span class="clausula-numero">VII)</span> El/La arrendatario/a acepta que si se pierde toda comunicación con su persona, transcurriendo así un periodo de 1 (1) días después de vencido el contrato de arrendamiento y no haber devuelto el vehículo automotor rentado, La arrendante queda totalmente autorizada por el/la arrendatario/a a dar aviso a las autoridades correspondientes de dicha situación, así mismo para que proporcione toda la información necesaria a cualquier autoridad competente como Tribunales de la República, Policía Nacional Civil y Fiscalía General de la República, cuando sea necesario esclarecer cualquier tipo de delito, accidente de tránsito o situación que involucre el automotor rentado por su persona.
        </div>

        <div class="clausula">
          <span class="clausula-numero">VIII)</span> El/La arrendatario/a se compromete a revisar periódicamente los niveles de agua, aceite, soluciones y presión de llantas, así mismo a estar pendiente de los controles de temperatura y que al presentar cualquier desperfecto mecánico deberá estacionarse y dar aviso a la arrendante o pedir auxilio mecánico, ya que cualquier gasto ocasionado por infringir esta cláusula correrá por cuenta del arrendatario/a.
        </div>

        <div class="clausula">
          <span class="clausula-numero">IX)</span> El/La arrendatario/a se compromete a cancelar a la arrendante por adelantado y a presencia de ésta, ya sea en efectivo, mediante depósito bancario, pago electrónico por tarjeta de débito o crédito mediante uso de POS o por medio de la plataforma Chivo Wallet, los cargos provenientes del arrendamiento, la gasolina, reparaciones por mal uso del vehículo rentado, impuestos legales, multas o infracciones de tránsito, depósito y la renta de los días que el vehículo automotor se encuentre en calidad de decomiso por cualquier tipo de problema legal (lucro cesante).
        </div>

        <div class="clausula">
          <span class="clausula-numero">X)</span> Queda expresamente establecido que la arrendante dará por terminado automáticamente este contrato de arrendamiento, cuando el/la arrendatario/a someta el vehículo rentado a las siguientes situaciones: a) Quebrantar grave o muy gravemente las leyes de tránsito terrestre; b) Involucrar el vehículo rentado en labores peligrosas o ilícitas; c) Conducirlo con licencia vencida; d) Transportar pasajeros públicos o de carga; e) Someterlo a carreras o competencias de alta velocidad; f) Conducirlo bajo los efectos del alcohol o drogas de cualquier tipo; g) No avisar inmediatamente a la Aseguradora, la Policía Nacional Civil y la arrendante en caso de accidente de tránsito o robo del vehículo rentado; h) Cometer actos contra la moral, el orden público y el régimen legal; i) No comunicarse con la arrendante y perder todo tipo de contacto telefónico o personal; j) Proporcionar direcciones o números telefónicos falsos o que no sean de su propiedad; k) No cancelar obligaciones de pago a la arrendante en el momento que éste se lo pida; l) Quebrantar cualquiera de las cláusulas de este contrato de arrendamiento.
        </div>

        <div class="clausula">
          <span class="clausula-numero">XI)</span> El/La arrendatario/a acepta cancelar a la arrendante en caso de mal uso del vehículo, ya sea en efectivo, mediante depósito bancario, pago electrónico por tarjeta de débito o crédito mediante uso de POS o por medio de la plataforma Chivo Wallet, la cantidad de $____________________ DÓLARES DE LOS ESTADOS UNIDOS DE AMÉRICA más IVA, siempre y cuando el vehículo no sea conducido bajo los efectos del alcohol o drogas, a excesiva velocidad, fuera del territorio nacional o en caminos no autorizados por las leyes de tránsito, ya que en cualquiera de estos casos o los mencionados en el numeral romano diez del presente instrumento el arrendatario será responsable por todos los gastos y daños ocasionados, y acepta que el depósito NO cubre daños a terceros ni tampoco cubre gastos médicos, ni los accesorios del vehículo, solo responde por el mal uso del vehículo arrendado.
        </div>

        <div class="clausula">
          <span class="clausula-numero">XII)</span> El/La arrendatario/a en este acto asume en sí mismo, toda responsabilidad civil, penal y de tránsito, exonerando totalmente a la arrendante, extendiéndole el más amplio FINIQUITO, responsabilizándose de los hechos ocurridos como también de los accidentes a terceros y las multas durante la vigencia de este instrumento.
        </div>

        <div class="page-break"></div>

        <div class="clausula-especial">
          <div class="clausula-especial-title">Cláusula Especial - Aplicación de Seguro</div>
          <div class="clausula">
            <strong>1.</strong> EN CASO DE ACCIDENTE DE TRÁNSITO EL ARRENDATARIO DEBERÁ LLAMAR AL SEGURO - POLICÍA Y A SU ARRENDANTE PARA NOTIFICAR ACCIDENTE DE TRÁNSITO, CASO CONTRARIO CAERÍA EN INCUMPLIMIENTO DE APLICACIÓN DE SEGURO.
          </div>
          <div class="clausula">
            <strong>2.</strong> EL DEDUCIBLE GENERADO POR EL SEGURO AUTOMOTOR ES A CUENTA DEL ARRENDATARIO.
          </div>
          <div class="clausula">
            <strong>3.</strong> EL SEGURO NO INCLUYE LA COBERTURA MÉDICA DE NINGÚN OCUPANTE DEL VEHÍCULO DEL ARRENDATARIO COMO EL VEHÍCULO AL QUE SE LE PUEDA GENERAR EL DAÑO.
          </div>
          <div class="clausula">
            <strong>4.</strong> EL SEGURO APLICA ÚNICAMENTE PARA LA COBERTURA DEL VEHÍCULO AUTOMOTOR.
          </div>
        </div>

        <div class="clausula">
          <span class="clausula-numero">XIII)</span> El/La arrendatario/a autoriza y faculta a la arrendante para recuperar el vehículo automotor rentado cuando el mismo quebrante cualquier cláusula de este instrumento, y renuncia al derecho de reclamar cualquier devolución, indemnización, depósito o reembolso de dinero.
        </div>

        <div class="clausula">
          <span class="clausula-numero">XIV)</span> En caso de ROBO del vehículo automotor rentado o pérdida total por causa de accidente de tránsito el/la arrendatario/a se obliga a cancelar a la arrendante, a presencia de ésta, ya sea en efectivo, mediante depósito bancario, pago electrónico por tarjeta de débito o crédito mediante uso de POS o por medio de la plataforma Chivo Wallet, el monto del deducible del Seguro de Cobertura del Vehículo Automotor antes descrito.
        </div>

        <div class="clausula">
          <span class="clausula-numero">XV)</span> El/La arrendatario/a se obliga con todas las cláusulas del presente instrumento, a cancelar todos los gastos y costas procesales ocasionadas por la ejecución de este contrato de arrendamiento y en caso de acción judicial, renuncia al derecho de apelar al decreto de embargo, sentencia de remate y a cualquier otra providencia alzable del juicio ejecutivo y sus incidentes, a exigir fianza al depositario de los bienes que se le embarguen, y renuncia así mismo a su domicilio, fijando como domicilio especial el de la ciudad de San Salvador, a cuyos tribunales se somete.
        </div>
      </div>

      <div class="firmas">
        <div class="content">
          <strong>Así nos expresamos, ratificando en todas sus partes el contenido del presente instrumento, en fe de lo cual firmamos en la ciudad de ________________________, a las ______________ horas del día _______________ de _________________________.</strong>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 200px;">
          <div style="text-align: center;">
            _____________________<br>
            Representante Vehicular<br>
            <strong>Saul Rigoberto Montes Villalta</strong>
          </div>
          <div style="text-align: center;">
            _______________________<br>
            <strong>Arrendatario</strong>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }
}

const pdfGenerator = new PdfGenerator();
export default pdfGenerator;
