
export interface LoginResponse {
  token: string;
  refreshToken: string | null;
  type: string;        // En Java es "Bearer" por defecto
  id: number;          // Long en Java equivale a number en TS
  username: string;
  email: string;
  roles: string[];     // List<String> se traduce como un array de strings
}