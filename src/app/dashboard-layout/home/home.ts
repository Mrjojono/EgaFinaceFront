import {Component, signal, OnInit, inject} from '@angular/core';
import {HlmCardImports} from '@spartan-ng/helm/card';
import {LucideAngularModule} from 'lucide-angular';
import {HlmButtonImports} from '@spartan-ng/helm/button';
import {CommonModule} from '@angular/common';
import {HlmTableImports} from '@spartan-ng/helm/table';
import {Account, EtatCompte} from '../../types/compte.type';
import {HlmCollapsibleImports} from '@spartan-ng/helm/collapsible';
import {TransactionTableComponent} from '../../shared/components/transactions-table/table.component';
import {Transaction} from '../../types/transaction.type';
import {Router} from '@angular/router';
import {AccountService, Compte} from '../../services/account';
import {AuthService} from '../../services/auth';
import {toast} from 'ngx-sonner';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HlmCardImports,
    LucideAngularModule,
    HlmButtonImports,
    CommonModule,
    TransactionTableComponent
  ],
  templateUrl: './home.html',
})
export class Home implements OnInit {

  private router = inject(Router);
  private accountService = inject(AccountService);
  private authService = inject(AuthService);

  isLoading = signal(false);
  accounts = signal<Account[]>([]);
  clickAccount = signal<Account | null>(null);
  totalSolde = signal<number>(0);

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

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    const clientId = this.authService.getCurrentUserId();

    if (!clientId) {
      toast.error('Erreur', {
        description: 'Vous devez être connecté pour voir vos comptes.',
        duration: 4000
      });
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading.set(true);

    this.accountService.getAccountsByClientId(clientId).subscribe({
      next: (comptes) => {
        const accounts: Account[] = comptes.map(compte => this.mapCompteToAccount(compte));

        this.accounts.set(accounts);
        this.totalSolde.set(accounts.reduce((acc, curr) => acc + curr.solde, 0));

        if (accounts.length > 0) {
          this.clickAccount.set(accounts[0]);
        }

        this.isLoading.set(false);

        if (accounts.length > 0) {
          toast.success('Comptes chargés', {
            description: `${accounts.length} compte(s) trouvé(s).`,
            duration: 3000
          });
        }
      },
      error: (error) => {
        this.isLoading.set(false);

        toast.error('Erreur', {
          description: 'Impossible de charger vos comptes.',
          duration: 5000
        });
      }
    });
  }

  private mapCompteToAccount(compte: Compte): Account {
    return {
      id: parseInt(compte.id),
      type: this.getTypeLabel(compte.typeCompte),
      etat: this.getEtatCompte(compte.solde),
      solde: compte.solde,
      Iban: compte.numero,
      devise: 'FCFA'
    };
  }

  private getTypeLabel(typeCompte: string): string {
    const types: Record<string, string> = {
      'COURANT': 'Compte courant',
      'EPARGNE': 'Compte épargne',
      'LIVRET': 'Livret A',
      'PLACEMENT': 'Placement Immo'
    };
    return types[typeCompte] || typeCompte;
  }

  private getEtatCompte(solde: number): EtatCompte {
    if (solde > 0) {
      return EtatCompte.ACTIF;
    } else if (solde === 0) {
      return EtatCompte.SUSPENDU;
    } else {
      return EtatCompte.BLOQUE;
    }
  }

  setClickAccount(id: number) {
    const found = this.accounts().find(acc => acc.id === id);
    if (found) {
      this.clickAccount.set(found);
    }
  }

  isSelected(id: number): boolean {
    return this.clickAccount()?.id === id;
  }

  genererPDF(t: Transaction) {
    toast.info('PDF', {
      description: `Génération du reçu pour ${t.id}...`,
      duration: 3000
    });
  }

  openGraphs() {
    this.router.navigate(['dashboard/graphs'], {
      state: {
        accounts: this.accounts(),
        transactions: this._transactions
      }
    });
  }

  refreshAccounts() {
    this.loadAccounts();
  }
}
