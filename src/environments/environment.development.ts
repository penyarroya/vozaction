// export const environment = {
//   production: false,
//   apiGateway: 'http://localhost:8080',
//   healthUrl: 'http://localhost:8080/actuator/health',
//   authEndpoint: '/api/auth',
//   enableLogs: true,
//   voiceEndpoint: '/voice',
//   initPageUrl: '/init-page'
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