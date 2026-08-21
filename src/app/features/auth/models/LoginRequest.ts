// export interface LoginRequest {
//   username: string;      // Cambiado de username a email
//   password: string;
// }


// src/core/models/auth/LoginRequest.ts

export interface LoginRequest {
  usernameOrEmail: string;  // ✅ Cambiar de 'username' a 'usernameOrEmail'
  password: string;
}