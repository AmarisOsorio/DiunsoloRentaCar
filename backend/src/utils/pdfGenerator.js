import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';
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
  /*
   * Genera un contrato de arrendamiento en PDF y lo sube a Cloudinary.
   */
  async generateLeaseContract(vehicleData) {
    let browser;
    try {
      // Detectar si está en AWS Lambda/serverless
      const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
      let launchOptions;
      if (isLambda) {
        launchOptions = {
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
        };
      } else {
        launchOptions = {
          headless: true,
          args: [],
        };
      }
      try {
        browser = await puppeteer.launch(launchOptions);
      } catch (err) {
        // Lanzar el error original para que el controlador lo capture y lo envíe al frontend
        throw new Error('No se pudo iniciar Chromium para generar el PDF: ' + (err?.message || err));
      }
      // 1. Crear una nueva página en el navegador headless (Puppeteer)
      const page = await browser.newPage();

      // 2. Generar el HTML del contrato usando la plantilla y los datos del vehículo
      const htmlTemplate = this.getHtmlTemplate(vehicleData);
      await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });

      // 3. Generar el PDF en memoria (como buffer) a partir del HTML cargado
      const pdfBuffer = await page.pdf({
        format: 'A4', // Formato de hoja A4
        printBackground: true, // Incluir fondos y colores
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      // 4. Limpiar el nombre del vehículo para crear un nombre de archivo seguro y descriptivo
      //    - Quita caracteres especiales, reemplaza espacios por guiones y convierte a mayúsculas
      const cleanName = vehicleData.vehicleName
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .toUpperCase();

      let cleanPlate = '';
      if (vehicleData.plate) {
        cleanPlate = vehicleData.plate
          .replace(/ /g, '-')
          .replace(/[^a-zA-Z0-9-]/g, '')
          .toUpperCase();
      } else {
        cleanPlate = 'NOPLATE';
      }
      const publicId = `${cleanName}-CONTRATO-ARRENDAMIENTO-${cleanPlate}`;

      // 8. Subir el PDF a Cloudinary como archivo "raw" (no imagen, no video)
      //    Se usa upload_stream para enviar el buffer directamente
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'vehicle-contracts', // Carpeta en Cloudinary (contratos de vehículos)
            resource_type: 'raw', // Tipo de recurso: archivo genérico
            public_id: publicId, // Nombre público del archivo
            use_filename: false,
            unique_filename: false // Usar exactamente el public_id especificado
          },
          (error, result) => {
            if (error) {
              // Log corto y claro
              console.error('Cloudinary upload error:', error?.message || error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        ).end(pdfBuffer); // Enviar el buffer del PDF
      });

      // 11. Devolver la URL directa del PDF en Cloudinary
      return uploadResult.secure_url;

    } finally {
      // 12. Cerrar el navegador de Puppeteer para liberar recursos
      if (browser) await browser.close();
    }
  }

  getHtmlTemplate(vehicle) {
    // Usar la URL pública de Cloudinary para el logo
    const logoElement = `<img src="https://res.cloudinary.com/dziypvsar/image/upload/v1753638778/diunsolo-logo_k1p5pm.png">`;
    // Mapear los datos del vehículo correctamente
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; margin: 0; padding: 15px; color: #000; }
        .logo-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1f3a93; padding-bottom: 12px; }
        .logo-container { margin-bottom: 12px; }
        .logo-image { max-width: 350px; height: auto; margin-bottom: 12px; display: block; margin-left: auto; margin-right: auto; }
        .title { font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 20px; text-transform: uppercase; color: #1f3a93; }
        .content { text-align: justify; margin-bottom: 15px; line-height: 1.5; font-size: 12px; }
        .vehiculo-specs { border: 2px solid #1f3a93; padding: 12px; margin: 15px 0; background-color: #f8f9fa; border-radius: 5px; }
        .specs-title { font-weight: bold; font-size: 14px; text-align: center; margin-bottom: 12px; color: #1f3a93; text-transform: uppercase; }
        .specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .spec-item { font-size: 11px; padding: 6px; background-color: white; border-radius: 3px; border-left: 3px solid #00bcd4; }
        .spec-label { font-weight: bold; color: #1f3a93; }
        .clausulas-section { margin-top: 15px; }
        .clausulas-title { font-weight: bold; font-size: 14px; margin-bottom: 12px; color: #1f3a93; }
        .clausula { margin-bottom: 10px; text-align: justify; line-height: 1.4; font-size: 12px; }
        .clausula-numero { font-weight: bold; color: #1f3a93; }
        .clausula-especial { background-color: #fff3cd; border: 1px solid #ffc107; padding: 8px; margin: 10px 0; border-radius: 3px; font-size: 11px; }
        .clausula-especial-title { font-weight: bold; text-align: center; margin-bottom: 8px; color: #856404; text-transform: uppercase; font-size: 12px; }
        .firmas { margin-top: 25px; border-top: 2px solid #1f3a93; padding-top: 15px; }
        .firma-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px; }
        .firma-box { text-align: center; padding-top: 15px; margin-top: 50px; font-size: 14px; }
        .page-break { page-break-before: always; }
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
            <span class="spec-label">Vehículo:</span> ${vehicle.vehicleName || 'N/A'}
          </div>
          <div class="spec-item">
            <span class="spec-label">Marca:</span> ${vehicle.brand || vehicle.brandName || 'N/A'}
          </div>
          <div class="spec-item">
            <span class="spec-label">Modelo:</span> ${vehicle.model || 'N/A'}
          </div>
          <div class="spec-item">
            <span class="spec-label">Año:</span> ${vehicle.year || 'N/A'}
          </div>
          <div class="spec-item">
            <span class="spec-label">Placa:</span> ${vehicle.plate || 'N/A'}
          </div>
          <div class="spec-item">
            <span class="spec-label">Color:</span> ${vehicle.color || 'N/A'}
          </div>
          <div class="spec-item">
            <span class="spec-label">Capacidad:</span> ${vehicle.capacity || 'N/A'} personas
          </div>
          <div class="spec-item">
            <span class="spec-label">No. Motor:</span> ${vehicle.engineNumber || 'N/A'}
          </div>
          <div class="spec-item">
            <span class="spec-label">No. Chasis:</span> ${vehicle.chassisNumber || 'N/A'}
          </div>
          <div class="spec-item">
            <span class="spec-label">VIN:</span> ${vehicle.vinNumber || 'N/A'}
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