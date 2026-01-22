export enum Role {
  CLIENT = 'CLIENT',
  AGENT_ADMIN = 'AGENT_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum Sexe {
  HOMME = 'HOMME',
  FEMME = 'FEMME',
  AUTRE = 'AUTRE',
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: Role;
  adresse?: string;
  sexe?: string;
  nationality?: string;
  password?: string;
}


export interface AuthResponse {
  token: string;
  user: User;
}

export interface ActivationResponse {
  success: boolean;
  message: string;
}


 export  type Nationality = {
  code?: string;
  name: string;
  flag: string;
};
