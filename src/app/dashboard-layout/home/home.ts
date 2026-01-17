import {Component, signal} from '@angular/core';
import {HlmCardImports} from '@spartan-ng/helm/card';
import {LucideAngularModule} from 'lucide-angular';
import {HlmButtonImports} from '@spartan-ng/helm/button';
import {CommonModule} from '@angular/common';
import {HlmTableImports} from '@spartan-ng/helm/table';
import {Account, EtatCompte} from '../../types/compte.type';
import {HlmCollapsibleImports} from '@spartan-ng/helm/collapsible';
import {TransactionTableComponent} from '../../shared/components/transactions-table/table.component';
import {Transaction} from '../../types/transaction.type';
import { BalanceChartComponent } from '../../shared/components/balance-chart.component'; // Chemin à adapter

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HlmCardImports, LucideAngularModule,
    HlmCollapsibleImports,
    HlmButtonImports, CommonModule, HlmTableImports,
    TransactionTableComponent,
    BalanceChartComponent
  ],
  templateUrl: './home.html',
})
export class Home {


  protected chartData = [450, 520, 480, 610, 590, 720, 680];

  protected _transactions: Transaction[] = [
    {
      id: 'TXN-99283-AX',
      date: '21.03.2024',
      label: 'Abonnement Netflix',
      receiver: 'Netflix France',
      sender: 'Jean Dupont',
      senderAccount: 'FR76 1234 5678 9012',
      receiverAccount: 'NL04 9876 5432 1098',
      amount: -15.99,
      fees: 0.00,
      status: 'Effectué'
    },
    {
      id: 'TXN-88172-BC',
      date: '20.03.2024',
      label: 'Virement Salaire',
      receiver: 'Jean Dupont',
      sender: 'Ega Finance S.A.',
      senderAccount: 'FR76 0000 1111 2222',
      receiverAccount: 'FR76 1234 5678 9012',
      amount: 2450.00,
      fees: 0.00,
      status: 'Effectué'
    },
    {
      id: 'TXN-77361-DL',
      date: '19.03.2024',
      label: 'Loyer Mars 2024',
      receiver: 'ImmoGestion SNC',
      sender: 'Jean Dupont',
      senderAccount: 'FR76 1234 5678 9012',
      receiverAccount: 'FR76 5555 4444 3333',
      amount: -850.00,
      fees: 1.50,
      status: 'En attente'
    },
    {
      id: 'TXN-66450-EP',
      date: '18.03.2024',
      label: 'Remboursement Resto',
      receiver: 'Jean Dupont',
      sender: 'Marie Legrand',
      senderAccount: 'FR76 9999 8888 7777',
      receiverAccount: 'FR76 1234 5678 9012',
      amount: 35.50,
      fees: 0.00,
      status: 'Effectué'
    },
    {
      id: 'TXN-55240-FZ',
      date: '17.03.2024',
      label: 'Courses Carrefour',
      receiver: 'Carrefour Market',
      sender: 'Jean Dupont',
      senderAccount: 'FR76 1234 5678 9012',
      receiverAccount: 'FR76 2222 3333 4444',
      amount: -112.30,
      fees: 0.00,
      status: 'Effectué'
    }
  ];

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

  genererPDF(t: Transaction) {
    console.log("Génération du reçu pour :", t.id);
  }
}
