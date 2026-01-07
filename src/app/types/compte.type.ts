
export enum EtatCompte {
  ACTIF = "Actif",
  BLOQUE = "Bloqué",
  SUSPENDU = "Suspendu"
}

export type Account = {
  id: number;
  type: string;
  etat: EtatCompte;
  solde: number;
  Iban: string;
  devise: string;
};

