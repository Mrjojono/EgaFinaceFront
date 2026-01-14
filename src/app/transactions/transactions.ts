import {Component, computed, signal} from '@angular/core';
import {HlmButtonImports} from '@spartan-ng/helm/button';
import {LucideAngularModule} from 'lucide-angular';
import {HlmCardImports} from '@spartan-ng/helm/card';
import {HlmInputImports} from '@spartan-ng/helm/input';
import {BrnSelect, BrnSelectImports} from '@spartan-ng/brain/select';
import {
  HlmSelectContent,
  HlmSelectImports,
  HlmSelectOption,
  HlmSelectTrigger,
  HlmSelectValue
} from '@spartan-ng/helm/select';
import {ReactiveFormsModule} from '@angular/forms';
import {HlmLabelImports} from '@spartan-ng/helm/label';
import {HlmTableImports} from '@spartan-ng/helm/table';
import {CommonModule, DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    HlmButtonImports,
    LucideAngularModule,
    HlmCardImports,
    HlmInputImports,
    BrnSelectImports, HlmSelectImports,
    ReactiveFormsModule, BrnSelect, HlmLabelImports, HlmTableImports, DecimalPipe, CommonModule,
  ],
  templateUrl: './transactions.html',
})
export class Transactions {

  protected readonly transactionTypes = [
    {value: 'all', label: 'Toutes les transactions'},
    {value: 'deposit', label: 'Dépôt'},
    {value: 'withdrawal', label: 'Retrait'},
    {value: 'transfer', label: 'Virement'},
    {value: 'payment', label: 'Paiement'},
    {value: 'refund', label: 'Remboursement'},
    {value: 'fee', label: 'Frais bancaires'}
  ];
  protected readonly transactions = signal([
    {
      id: 'TXN-001',
      date: '2024-03-21',
      description: 'Virement Salaire',
      type: 'virement',
      amount: 250000,
      status: 'Complété'
    },
    {
      id: 'TXN-002',
      date: '2024-03-20',
      description: 'Achat Carrefour',
      type: 'Retrait',
      amount: -15400,
      status: 'Complété'
    },
    {id: 'TXN-003', date: '2024-03-19', description: 'Netflix', type: 'Retrait', amount: -5000, status: 'En attente'},
    {
      id: 'TXN-004',
      date: '2024-03-18',
      description: 'Remboursement prêt',
      type: 'depot',
      amount: 25000,
      status: 'Complété'
    },
    {
      id: 'TXN-005',
      date: '2024-03-15',
      description: 'Frais bancaires',
      type: 'retrait',
      amount: -2500,
      status: 'Échoué'
    }
  ]);
  protected currentPage = signal(1);
  protected pageSize = signal(5);


  protected paginatedTransactions = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return this.transactions().slice(startIndex, startIndex + this.pageSize());
  });

  protected totalPages = computed(() =>
    Math.ceil(this.transactions().length / this.pageSize())
  );

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

}
