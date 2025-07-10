import express from 'express';
import https from 'https';
import dotenv from 'dotenv';
import pdfGenerator from '../utils/pdfGenerator.js';
import Vehiculos from '../models/Vehiculos.js';

dotenv.config();

const router = express.Router();

// Function to fetch PDF from Cloudinary
function fetchPdfFromCloudinary(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'DiunsoloRentaCar/1.0'
      }
    };

    const req = https.request(options, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Route to serve PDFs inline from Cloudinary
router.get('/view/contratos/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    console.log('🔍 Buscando PDF:', filename);
    
    // Construct the Cloudinary URL for the PDF using environment variable
    const cloudName = process.env.CLOUDINARY_NAME || 'dziypvsar';
    const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/contratos/${filename}`;
    
    console.log('🔗 URL de Cloudinary construida:', cloudinaryUrl);
    
    // Fetch the PDF from Cloudinary
    const pdfBuffer = await fetchPdfFromCloudinary(cloudinaryUrl);
    
    console.log('✅ PDF obtenido exitosamente, tamaño:', pdfBuffer.length, 'bytes');
    
    // Set headers to display PDF inline in browser
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="' + filename + '"',
      'Content-Length': pdfBuffer.length,
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      'X-Content-Type-Options': 'nosniff'
    });
    
    // Send the PDF buffer
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('❌ Error serving PDF:', {
      filename: req.params.filename,
      error: error.message,
      stack: error.stack
    });
    
    if (error.message.includes('HTTP 404')) {
      res.status(404).json({ 
        error: 'PDF not found',
        message: `Could not retrieve PDF: ${req.params.filename}`,
        debug: {
          filename: req.params.filename,
          cloudinaryUrl: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME || 'dziypvsar'}/raw/upload/contratos/${req.params.filename}`,
          suggestion: 'Verifica que el PDF fue subido correctamente a Cloudinary'
        }
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to serve PDF',
        debug: error.message
      });
    }
  }
});

// Route to generate and serve PDF for a vehicle
router.get('/generate/contrato/:vehicleId', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    
    console.log('🚗 Generando contrato para vehículo ID:', vehicleId);
    
    // Buscar el vehículo en la base de datos
    const vehiculo = await Vehiculos.findById(vehicleId);
    
    if (!vehiculo) {
      return res.status(404).json({
        error: 'Vehicle not found',
        message: `No se encontró el vehículo con ID: ${vehicleId}`
      });
    }
    
    console.log('✅ Vehículo encontrado:', vehiculo.nombreVehiculo);
    
    // Generar el PDF
    console.log('📄 Generando PDF...');
    const pdfUrl = await pdfGenerator.generateContratoArrendamiento(vehiculo);
    
    // Actualizar el vehículo con la URL del PDF
    vehiculo.contratoArrendamientoPdf = pdfUrl;
    await vehiculo.save();
    
    console.log('✅ PDF generado y guardado:', pdfUrl);
    
    // Como ahora devolvemos la URL directa de Cloudinary, redirigir directamente
    res.redirect(pdfUrl);
    
  } catch (error) {
    console.error('❌ Error generando PDF:', {
      vehicleId: req.params.vehicleId,
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      error: 'PDF generation failed',
      message: 'No se pudo generar el contrato de arrendamiento',
      debug: error.message
    });
  }
});

// Route to generate PDF with vehicle data (for testing or direct generation)
router.post('/generate/contrato', async (req, res) => {
  try {
    const vehiculoData = req.body;
    
    console.log('📄 Generando PDF con datos proporcionados...');
    console.log('🚗 Vehículo:', vehiculoData.nombreVehiculo);
    
    // Validar que los datos necesarios están presentes
    if (!vehiculoData.nombreVehiculo) {
      return res.status(400).json({
        error: 'Missing vehicle data',
        message: 'Se requiere al menos el nombre del vehículo'
      });
    }
    
    // Generar el PDF
    const pdfUrl = await pdfGenerator.generateContratoArrendamiento(vehiculoData);
    
    console.log('✅ PDF generado:', pdfUrl);
    
    // Devolver la URL directa de Cloudinary
    res.json({
      success: true,
      message: 'PDF generado exitosamente',
      pdfUrl: pdfUrl,
      cloudinaryUrl: pdfUrl // La URL directa de Cloudinary
    });
    
  } catch (error) {
    console.error('❌ Error generando PDF:', {
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      error: 'PDF generation failed',
      message: 'No se pudo generar el contrato de arrendamiento',
      debug: error.message
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'PDF viewer service is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
