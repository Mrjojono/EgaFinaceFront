export enum Role {
  CLIENT = 'CLIENT',
  AGENT_ADMIN = 'AGENT_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: Role;
}



export interface AuthResponse {
  token: string;
  user: User;
}
