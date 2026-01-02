import {Component, signal} from '@angular/core';
import {HlmCardImports} from '@spartan-ng/helm/card';
import {LucideAngularModule} from 'lucide-angular';
import {HlmButtonImports} from '@spartan-ng/helm/button';
import {CommonModule} from '@angular/common'; // Pour le pipe currency si besoin

// Utilisation d'un Enum propre
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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HlmCardImports, LucideAngularModule, HlmButtonImports, CommonModule],
  templateUrl: './home.html',
})
export class Home {


  protected readonly Accounts: Account[] = [
    {
      id: 1,
      type: "Compte courant",
      etat: EtatCompte.ACTIF,
      solde: 4250000,
      Iban: "FR76 3000 6000 0123 4567 8901 234",
      devise: "FCFA"
    },
    {
      id: 2,
      type: "Épargne Projet",
      etat: EtatCompte.BLOQUE,
      solde: 150000,
      Iban: "FR76 3000 6000 0987 6543 2109 888",
      devise: "FCFA"
    },
    {
      id: 3,
      type: "Livret A",
      etat: EtatCompte.ACTIF,
      solde: 50000,
      Iban: "FR76 3000 6000 0000 1111 2222 333",
      devise: "FCFA"
    },
    {
      id: 4,
      type: "Placement Immo",
      etat: EtatCompte.SUSPENDU,
      solde: 12500000,
      Iban: "FR76 3000 6000 9999 8888 7777 666",
      devise: "FCFA"
    }
  ];


  clickAccount = signal<Account>(this.Accounts[0]);


  totalSolde = signal<number>(
    this.Accounts.reduce((acc, curr) => acc + curr.solde, 0)
  );

  setClickAccount(id: number) {
    const found = this.Accounts.find(acc => acc.id === id);
    if (found) {
      this.clickAccount.set(found);
    }
  }


  isSelected(id: number): boolean {
    return this.clickAccount().id === id;
  }
}
