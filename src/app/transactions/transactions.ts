import {Component, computed, inject, signal, ViewContainerRef, OnInit} from '@angular/core';
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
import {BrnDialogService} from '@spartan-ng/brain/dialog';
import {DoTransaction} from '../shared/components/do-transaction/do-transaction';
import {AccountService, Compte} from '../services/account';
import {AuthService} from '../services/auth';
import {switchMap, catchError, of} from 'rxjs';

type SortColumn = 'id' | 'date' | 'description' | 'amount' | 'status';
type TxType =
  | 'all'
  | 'deposit'
  | 'withdrawal'
  | 'transfer'
  | 'payment'
  | 'refund'
  | 'fee'
  | 'virement'
  | 'depot'
  | 'retrait';

interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD or ISO
  description: string;
  type: string;
  amount: number;
  status: string;
}

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
export class Transactions implements OnInit {
  private accountService = inject(AccountService);
  private authService = inject(AuthService);
  private _dialogService = inject(BrnDialogService);
  private _vcr = inject(ViewContainerRef);

  // static list of available types for the select
  protected readonly transactionTypes = [
    {value: 'all', label: 'Toutes les transactions'},
    {value: 'deposit', label: 'Dépôt'},
    {value: 'withdrawal', label: 'Retrait'},
    {value: 'transfer', label: 'Virement'},
    {value: 'payment', label: 'Paiement'},
    {value: 'refund', label: 'Remboursement'},
    {value: 'fee', label: 'Frais bancaires'}
  ];

  // signals & state
  protected accounts = signal<Compte[]>([]);
  protected selectedAccountId = signal<string | null>(null);
  protected transactions = signal<Transaction[]>([]);
  protected isLoadingTransactions = signal(false);
  protected transactionsError = signal<string | null>(null);

  // Pagination
  protected currentPage = signal(1);
  protected pageSize = signal(5);

  // Sorting
  protected sortColumn = signal<SortColumn>('date');
  protected sortDirection = signal<'asc' | 'desc'>('desc');

  // Filters (signals)
  protected startDate = signal<string | null>(null);
  protected endDate = signal<string | null>(null);
  protected typeFilter = signal<TxType>('all');
  protected searchTerm = signal<string>('');

  private normalizeType = (t?: string) => (t ?? '').toString().trim().toLowerCase();

  // Derived lists
  protected filteredTransactions = computed(() => {
    const start = this.startDate();
    const end = this.endDate();
    const type = this.typeFilter();
    const q = this.searchTerm().trim().toLowerCase();

    return this.transactions().filter(tx => {
      // Date filter
      if (start) {
        const txTime = new Date(tx.date).setHours(0, 0, 0, 0);
        const startTime = new Date(start).setHours(0, 0, 0, 0);
        if (txTime < startTime) return false;
      }
      if (end) {
        const txTime = new Date(tx.date).setHours(23, 59, 59, 999);
        const endTime = new Date(end).setHours(23, 59, 59, 999);
        if (txTime > endTime) return false;
      }

      if (type && type !== 'all') {
        const txType = this.normalizeType(tx.type);
        const allowed =
          type === 'deposit' ? ['deposit', 'depot'] :
            type === 'withdrawal' ? ['withdrawal', 'retrait'] :
              type === 'transfer' ? ['transfer', 'virement'] :
                type === 'payment' ? ['payment'] :
                  type === 'refund' ? ['refund'] :
                    type === 'fee' ? ['fee', 'frais bancaires'] :
                      [type];
        if (!allowed.some(a => a === txType)) return false;
      }

      // Search filter (id, description, status)
      if (q) {
        const hay = `${tx.id} ${tx.description} ${tx.status}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  });

  protected sortedTransactions = computed(() => {
    const column = this.sortColumn();
    const direction = this.sortDirection();
    const arr = [...this.filteredTransactions()];

    arr.sort((a, b) => {
      let res = 0;
      if (column === 'amount') {
        res = a.amount - b.amount;
      } else if (column === 'date') {
        res = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        const aVal = String((a as any)[column] ?? '').toLowerCase();
        const bVal = String((b as any)[column] ?? '').toLowerCase();
        res = aVal.localeCompare(bVal, 'fr', {numeric: true, sensitivity: 'base'});
      }
      return direction === 'asc' ? res : -res;
    });

    return arr;
  });

  protected paginatedTransactions = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return this.sortedTransactions().slice(startIndex, startIndex + this.pageSize());
  });

  protected totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.sortedTransactions().length / this.pageSize()));
  });

  ngOnInit(): void {
    this.loadAccounts();
    // optionally, you could auto-load transactions for a default account if present
  }

  // Load accounts for current user so user can choose which account to filter by
  loadAccounts() {
    const clientId = this.authService.getCurrentUserId();
    if (!clientId) {
      this.accounts.set([]);
      return;
    }
    this.accountService.getAccountsByClientId(clientId).subscribe({
      next: (accts) => {
        this.accounts.set(accts);
        // if only one account, select it by default
        if (accts.length === 1) {
          this.onAccountChange(accts[0].id);
        }
      },
      error: (err) => {
        console.error('Erreur chargement comptes:', err);
        this.accounts.set([]);
      }
    });
  }

  // Called when user selects another account
  onAccountChange(accountId: string | null) {
    this.selectedAccountId.set(accountId);
    this.currentPage.set(1);
    this.loadTransactions();
  }

  // call the GraphQL service to get transactions for the selected account and date range
  loadTransactions() {
    const accountId = this.selectedAccountId();
    if (!accountId) {
      // clear transactions if no account selected
      this.transactions.set([]);
      return;
    }

    this.isLoadingTransactions.set(true);
    this.transactionsError.set(null);

    this.accountService.getTransactionsByAccountId(
      accountId,
      this.startDate() ?? undefined,
      this.endDate() ?? undefined
    ).pipe(
      catchError(err => {
        console.error('Erreur récupération transactions:', err);
        this.transactionsError.set(err?.message || 'Erreur lors du chargement des transactions');
        this.isLoadingTransactions.set(false);
        return of([] as any[]);
      })
    ).subscribe((txs: any[]) => {
      // Normalise le format si nécessaire — on suppose que txs est déjà compatible avec Transaction
      const normalized: Transaction[] = txs.map(t => ({
        id: t.id ?? t._id ?? String(Math.random()),
        date: t.date ?? t.createdAt ?? '',
        description: t.description ?? t.libelle ?? '',
        type: t.type ?? t.txType ?? '',
        amount: typeof t.amount === 'number' ? t.amount : Number(t.amount ?? 0),
        status: t.status ?? (t.completed ? 'Complété' : 'En attente')
      }));
      this.transactions.set(normalized);
      this.isLoadingTransactions.set(false);
      // reset pagination
      this.currentPage.set(1);
    });
  }

  // handlers for filters to also trigger re-load
  setStartDate(d: string | null) {
    this.startDate.set(d ? d : null);
    this.currentPage.set(1);
    // reload from server because we want server-side date filtering
    this.loadTransactions();
  }

  setEndDate(d: string | null) {
    this.endDate.set(d ? d : null);
    this.currentPage.set(1);
    this.loadTransactions();
  }

  setTypeFilter(value: string | null) {
    const v = (value ?? 'all') as TxType;
    this.typeFilter.set(v);
    this.currentPage.set(1);
    // type filter can be client-side; we don't need to re-request server if server has no type filter.
    // If you want server-side type filtering, call loadTransactions() here.
  }

  setSearchTerm(v: string) {
    this.searchTerm.set(v ?? '');
    this.currentPage.set(1);
  }

  clearFilters() {
    this.startDate.set(null);
    this.endDate.set(null);
    this.typeFilter.set('all');
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadTransactions();
  }

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

  sort(column: SortColumn) {
    if (this.sortColumn() === column) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.currentPage.set(1);
  }

  trackById(index: number, item: Transaction) {
    return item.id;
  }

  // ouvre le dialogue de transaction (inchangé)
  openAddCompte() {
    const dialogRef = this._dialogService.open(DoTransaction);

    dialogRef.closed$.subscribe((result) => {
      console.log('Le dialogue est fermé', result);
      // si une transaction a été faite, reload transactions pour le compte selectionné
      if (result && this.selectedAccountId()) {
        this.loadTransactions();
      }
    });
  }
}
