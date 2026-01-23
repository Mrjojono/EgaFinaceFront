import {ChangeDetectorRef, Component, computed, inject, NgZone, OnInit, signal, ViewContainerRef} from '@angular/core';
import {HlmButtonImports} from '@spartan-ng/helm/button';
import {LucideAngularModule} from 'lucide-angular';
import {HlmCardImports} from '@spartan-ng/helm/card';
import {HlmInputImports} from '@spartan-ng/helm/input';
import {BrnSelect, BrnSelectImports} from '@spartan-ng/brain/select';
import {HlmSelectImports} from '@spartan-ng/helm/select';
import {ReactiveFormsModule} from '@angular/forms';
import {HlmLabelImports} from '@spartan-ng/helm/label';
import {HlmTableImports} from '@spartan-ng/helm/table';
import {CommonModule, DecimalPipe} from '@angular/common';
import {BrnDialogService} from '@spartan-ng/brain/dialog';
import {DoTransaction} from '../shared/components/do-transaction/do-transaction';
import {AccountService, Compte} from '../services/account';
import {AuthService} from '../services/auth';
import {catchError, of} from 'rxjs';
import {TransactionService, TransactionType} from '../services/transaction';

type SortColumn = 'id' | 'date' | 'description' | 'amount';
type TxType =
  | 'all' | 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'refund' | 'fee' | 'virement' | 'depot' | 'retrait';

interface Transaction {
  id: string;
  date: string;
  sender: string;
  receiver: string;
  senderAccount: string;
  receiverAccount: string;
  label: string;
  accountType: string;
  // now typed with enum
  type: TransactionType;
  amount: number;
  sens: 'CREDIT' | 'DEBIT';
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    HlmButtonImports, LucideAngularModule, HlmCardImports, HlmInputImports,
    BrnSelectImports, HlmSelectImports, ReactiveFormsModule, BrnSelect,
    HlmLabelImports, HlmTableImports, DecimalPipe, CommonModule
  ],
  templateUrl: './transactions.html',
})
export class Transactions implements OnInit {
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);
  private authService = inject(AuthService);
  private _dialog_service = inject(BrnDialogService);
  private _vcr = inject(ViewContainerRef);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  protected readonly transactionTypes = [
    {value: 'all', label: 'Toutes les transactions'},
    {value: 'deposit', label: 'Dépôt'},
    {value: 'withdrawal', label: 'Retrait'},
    {value: 'transfer', label: 'Virement'},
    {value: 'payment', label: 'Paiement'},
    {value: 'refund', label: 'Remboursement'},
    {value: 'fee', label: 'Frais bancaires'}
  ];

  protected isExporting = signal(false);

  protected accounts = signal<Compte[]>([]);
  protected selectedAccountId = signal<string | null>(null);
  protected transactions = signal<Transaction[]>([]);
  protected isLoadingTransactions = signal(false);
  protected transactionsError = signal<string | null>(null);

  protected currentPage = signal(1);
  protected pageSize = signal(5);
  protected sortColumn = signal<SortColumn>('date');
  protected sortDirection = signal<'asc' | 'desc'>('desc');

  protected startDate = signal<string | null>(null);
  protected endDate = signal<string | null>(null);
  protected typeFilter = signal<TxType>('all');
  protected searchTerm = signal<string>('');
  protected useServerPagination = signal<boolean>(true);

  exportToPdf() {
    const accountId = this.selectedAccountId();
    const start = this.startDate();
    const end = this.endDate();

    if (!accountId || !start || !end) {
      console.warn("Compte et période requis pour l'export PDF");
      return;
    }

    this.isExporting.set(true);

    const formattedStart = this.toIsoLocalStartOfDay(start);
    const formattedEnd = this.toIsoLocalEndOfDay(end);

    this.transactionService.downloadRelevePdf(accountId, formattedStart, formattedEnd).subscribe({
      next: () => {
        this.isExporting.set(false);
      },
      error: (err) => {
        console.error('Erreur PDF:', err);
        this.isExporting.set(false);
      }
    });
  }

  // expanded row id
  protected expanded = signal<string | null>(null);

  private normalizeType = (t?: string) => (t ?? '').toString().trim().toLowerCase();

  protected filteredTransactions = computed(() => {
    const start = this.startDate();
    const end = this.endDate();
    const type = this.typeFilter();
    const q = this.searchTerm().trim().toLowerCase();
    return this.transactions().filter(tx => {
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
        const txType = this.normalizeType(tx.type as unknown as string);
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
      if (q) {
        const hay = `${tx.sender} ${tx.receiver} ${tx.label} ${tx.accountType}`.toLowerCase();
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
      if (column === 'amount') res = a.amount - b.amount;
      else if (column === 'date') res = new Date(a.date).getTime() - new Date(b.date).getTime();
      else {
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

  protected totalPages = computed(() => Math.max(1, Math.ceil(this.sortedTransactions().length / this.pageSize())));

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts() {
    const clientId = this.authService.getCurrentUserId();
    if (!clientId) {
      this.accounts.set([]);
      return;
    }
    this.accountService.getAccountsByClientId(clientId).subscribe({
      next: accts => {
        this.accounts.set(accts);
        if (accts.length === 1) this.onAccountChange(accts[0].id);
      },
      error: err => {
        console.error('Erreur chargement comptes:', err);
        this.accounts.set([]);
      }
    });
  }

  onAccountChange(accountId: string | null) {
    this.selectedAccountId.set(accountId);
    this.currentPage.set(1);
    if (this.useServerPagination()) {
      this.loadTransactions();
    } else if (this.startDate() && this.endDate()) {
      this.loadTransactions();
    } else {
      this.transactions.set([]);
      this.transactionsError.set(null);
    }
  }

  toggleExpand(id: string) {
    this.expanded.set(this.expanded() === id ? null : id);
  }

  /**
   * Retourne l'icône selon le type ET le sens de la transaction
   */
  getTxIcon(type?: TransactionType, sens?: 'CREDIT' | 'DEBIT'): string {
    if (!type) return 'circle';
    const t = type;

    switch (t) {
      case TransactionType.DEPOT:
        return 'trending-up';
      case TransactionType.RETRAIT:
        return 'trending-down';
      case TransactionType.VIREMENT:
        return sens === 'CREDIT' ? 'arrow-down-left' : 'arrow-up-right';
      case TransactionType.PAIEMENT:
        return 'credit-card';
      case TransactionType.REMBOURSEMENT:
        return 'repeat';
      default:
        return 'circle';
    }
  }

  /**
   * Retourne la classe CSS de couleur selon le sens OU type (fallback)
   */
  getTxColorClass(sens?: 'CREDIT' | 'DEBIT', type?: TransactionType): string {
    if (sens) return sens === 'CREDIT' ? 'text-green-600' : 'text-red-600';
    // fallback by type
    if (type === TransactionType.DEPOT || type === TransactionType.REMBOURSEMENT) return 'text-green-600';
    if (type === TransactionType.RETRAIT || type === TransactionType.PAIEMENT) return 'text-red-600';
    return 'text-slate-700';
  }

  /**
   * Formate le montant avec signe selon le sens
   */
  formatAmount(amount: number, sens?: 'CREDIT' | 'DEBIT'): string {
    const addSign = sens === 'CREDIT' ? '+' : '-';
    return `${addSign} ${Math.abs(amount).toLocaleString('fr-FR')} FCFA`;
  }

  // Helpers
  private pad(n: number) {
    return n < 10 ? '0' + n : '' + n;
  }

  private toIsoLocalStartOfDay(dateStr: string): string {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    const Y = d.getFullYear();
    const M = this.pad(d.getMonth() + 1);
    const D = this.pad(d.getDate());
    const hh = this.pad(d.getHours());
    const mm = this.pad(d.getMinutes());
    const ss = this.pad(d.getSeconds());
    return `${Y}-${M}-${D}T${hh}:${mm}:${ss}`;
  }

  private toIsoLocalEndOfDay(dateStr: string): string {
    const d = new Date(dateStr);
    d.setHours(23, 59, 59, 999);
    const Y = d.getFullYear();
    const M = this.pad(d.getMonth() + 1);
    const D = this.pad(d.getDate());
    const hh = this.pad(d.getHours());
    const mm = this.pad(d.getMinutes());
    const ss = this.pad(d.getSeconds());
    return `${Y}-${M}-${D}T${hh}:${mm}:${ss}`;
  }

  loadTransactions() {
    const accountId = this.selectedAccountId();
    if (!accountId) {
      this.transactions.set([]);
      return;
    }

    this.isLoadingTransactions.set(true);
    this.transactionsError.set(null);

    const startDateInput = this.startDate();
    const endDateInput = this.endDate();

    if (this.useServerPagination() && !startDateInput && !endDateInput) {
      const page = 0, size = 1000;
      this.transactionService.getPagedTransactions(page, size).pipe(
        catchError(err => {
          console.error('getPagedTransactions failed', err);
          this.transactionsError.set(err?.message || 'Erreur paginée');
          this.isLoadingTransactions.set(false);
          return of([] as any[]);
        })
      ).subscribe(txs => {
        console.debug('getPagedTransactions raw', txs);
        const relevant = (txs ?? []).filter(t =>
          (t.compteSource?.id && t.compteSource.id === accountId) ||
          (t.compteDestination?.id && t.compteDestination.id === accountId)
        );
        const normalized = relevant.map(t => this.normalizeServerTx(t, accountId));
        this.ngZone.run(() => {
          this.transactions.set(normalized);
          this.isLoadingTransactions.set(false);
          this.currentPage.set(1);
          this.cdr.detectChanges();
        });
        if (normalized.length === 0) console.warn('Aucune transaction trouvée via paged pour', accountId);
      });
      return;
    }

    if (!this.useServerPagination() && (!startDateInput || !endDateInput)) {
      this.isLoadingTransactions.set(false);
      this.transactionsError.set('Veuillez sélectionner les deux dates pour la recherche par période.');
      this.transactions.set([]);
      return;
    }

    const start = startDateInput ? this.toIsoLocalStartOfDay(startDateInput) : undefined;
    const end = endDateInput ? this.toIsoLocalEndOfDay(endDateInput) : undefined;

    console.info('Calling getTransactionsByAccountId', {accountId, start, end});

    this.accountService.getTransactionsByAccountId(accountId, start, end).pipe(
      catchError(err => {
        console.error('getTransactionsByAccountId failed', err);
        this.transactionsError.set(err?.message || 'Erreur lors du chargement des transactions');
        this.isLoadingTransactions.set(false);
        return of([] as any[]);
      })
    ).subscribe(txs => {
      console.debug('getTransactionsByAccountId raw', txs);
      const normalized = (txs ?? []).map(t => this.normalizeServerTx(t, accountId));
      this.ngZone.run(() => {
        this.transactions.set(normalized);
        this.isLoadingTransactions.set(false);
        this.currentPage.set(1);
        this.cdr.detectChanges();
      });
      if (normalized.length === 0) console.warn('Aucune transaction retournée; vérifie Network/serveur.');
    });
  }

  /**
   * Normalise les données de transaction du serveur
   * Détermine automatiquement le sens (CREDIT/DEBIT) selon le compte actuel
   */
  private normalizeServerTx(t: any, currentAccountId: string): Transaction {
    const src = t.compteSource;
    const dst = t.compteDestination;

    const senderName = src?.proprietaire ? `${src.proprietaire.prenom} ${src.proprietaire.nom}`.trim() : (src ? (src.numero ?? '—') : '—');
    const receiverName = dst?.proprietaire ? `${dst.proprietaire.prenom} ${dst.proprietaire.nom}`.trim() : (dst ? (dst.numero ?? '—') : '—');

    const maskNumber = (num?: string) => {
      if (!num) return '—';
      const last = num.slice(-4);
      return `•••${last}`;
    };
    const senderAccount = src?.proprietaire?.identifiant ?? src?.proprietaire?.email ?? maskNumber(src?.numero) ?? '—';
    const receiverAccount = dst?.proprietaire?.identifiant ?? dst?.proprietaire?.email ?? maskNumber(dst?.numero) ?? '—';

    const rawAmount = Number(t.montant ?? 0);
    const amount = Math.abs(rawAmount);
    const date = t.dateCreation ?? t.dateUpdate ?? new Date().toISOString();
    const description = `${senderName} → ${receiverName}`;
    const accountType = src?.typeCompte ?? dst?.typeCompte ?? '';

    // normalize transactionType into enum TransactionType (safe)
    const rawTypeStr = (t.transactionType ?? '').toString().toUpperCase();
    let txType: TransactionType;
    switch (rawTypeStr) {
      case 'DEPOT': txType = TransactionType.DEPOT; break;
      case 'RETRAIT': txType = TransactionType.RETRAIT; break;
      case 'VIREMENT': txType = TransactionType.VIREMENT; break;
      case 'PAIEMENT': txType = TransactionType.PAIEMENT; break;
      case 'REMBOURSEMENT': txType = TransactionType.REMBOURSEMENT; break;
      default: txType = TransactionType.VIREMENT; // fallback safe default
    }

    // determine sens
    let sens: 'CREDIT' | 'DEBIT' = 'CREDIT';
    if (txType === TransactionType.DEPOT || txType === TransactionType.REMBOURSEMENT) {
      sens = 'CREDIT';
    } else if (txType === TransactionType.RETRAIT || txType === TransactionType.PAIEMENT) {
      sens = 'DEBIT';
    } else if (txType === TransactionType.VIREMENT) {
      // if destination is current account => credit, if source is current account => debit
      if (dst?.id === currentAccountId) sens = 'CREDIT';
      else if (src?.id === currentAccountId) sens = 'DEBIT';
      else sens = 'DEBIT'; // fallback assume debit
    }

    return {
      id: String(t.id ?? ''),
      date,
      sender: senderName,
      receiver: receiverName,
      senderAccount,
      receiverAccount,
      label: description,
      accountType,
      type: txType,
      amount,
      sens
    } as Transaction;
  }

  setStartDate(d: string | null) {
    this.startDate.set(d ? d : null);
    this.currentPage.set(1);
    if (this.useServerPagination() || (this.startDate() && this.endDate())) {
      this.loadTransactions();
    } else {
      this.transactions.set([]);
      this.transactionsError.set(null);
    }
  }

  setEndDate(d: string | null) {
    this.endDate.set(d ? d : null);
    this.currentPage.set(1);
    if (this.useServerPagination() || (this.startDate() && this.endDate())) {
      this.loadTransactions();
    } else {
      this.transactions.set([]);
      this.transactionsError.set(null);
    }
  }

  setTypeFilter(value: string | null) {
    this.typeFilter.set((value ?? 'all') as TxType);
    this.currentPage.set(1);
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
    this.transactionsError.set(null);

    this.useServerPagination.set(true);
    this.loadTransactions();
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1);
  }

  prevPage() {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }

  sort(column: SortColumn) {
    if (this.sortColumn() === column) this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.currentPage.set(1);
  }

  trackById(index: number, item: Transaction) {
    return item.id;
  }

  openAddCompte() {
    const dialogRef = this._dialog_service.open(DoTransaction);
    dialogRef.closed$.subscribe(result => {
      if (result && this.selectedAccountId()) this.loadTransactions();
    });
  }
}
