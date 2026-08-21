// export const environment = {
//   production: false,
//   apiGateway: 'http://localhost:8080',

//   // ✅ AÑADIR: URL para el servicio de voz
//   voiceEndpoint: '/voice',  // El backend de voz estará en /api/voice

//   authEndpoint: '/api/auth',
//   healthUrl: '/actuator/health',  
//   enableLogs: true,

//   initPageUrl: '/init-page'  // Cuando exista, redirigirá aquí
// };






export const environment = {
  production: false,
  apiGateway: 'http://localhost:8080',
  healthUrl: 'http://localhost:8080/actuator/health',
  authEndpoint: '/api/auth',
  apiV1: '/api/v1',              // ✅ NUEVA: base para endpoints de la API v1 (usuarios, etc.)
  voiceEndpoint: '/voice',
  enableLogs: true,
  initPageUrl: '/init-page'
};