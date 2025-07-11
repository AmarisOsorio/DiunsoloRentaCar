// Logo base64 del logo de Diunsolo (creado desde la imagen proporcionada)
// Este es un placeholder - en producción deberías usar la imagen real convertida a base64

const diunsoloLogoBetter = `data:image/svg+xml;base64,${Buffer.from(`
<svg width="300" height="80" xmlns="http://www.w3.org/2000/svg">
  <!-- Fondo azul oscuro -->
  <rect x="0" y="0" width="150" height="80" fill="#1f3a93"/>
  <!-- Fondo azul claro -->
  <rect x="150" y="0" width="150" height="80" fill="#00bcd4"/>
  
  <!-- Texto DIUN en amarillo -->
  <text x="15" y="50" font-family="Arial Black, sans-serif" font-size="28" font-weight="bold" fill="#ffeb3b">DIUN</text>
  
  <!-- Texto SOLO en blanco -->
  <text x="170" y="50" font-family="Arial Black, sans-serif" font-size="28" font-weight="bold" fill="white">SOLO</text>
  
  <!-- Texto RENTA CAR más pequeño -->
  <text x="190" y="65" font-family="Arial, sans-serif" font-size="10" fill="white">RENTA CAR</text>
</svg>
`).toString('base64')}`;

export default diunsoloLogoBetter;
