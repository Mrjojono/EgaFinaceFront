import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Apollo} from 'apollo-angular';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {GET_CLIENT_BY_ID, GET_COMPTES_BY_CLIENT} from '../../../graphql/queries';
import {HlmCard} from '@spartan-ng/helm/card';
import {HlmButton} from '@spartan-ng/helm/button';
import {LucideAngularModule} from 'lucide-angular';
import {HlmLabel} from '@spartan-ng/helm/label';
import {TransactionService} from '../../../services/transaction';
import {HlmInputImports} from '@spartan-ng/helm/input';

@Component({
  selector: 'app-client-details',
  standalone: true,
  imports: [CommonModule, RouterModule, HlmCard, HlmButton, LucideAngularModule, HlmLabel, HlmInputImports],
  templateUrl: './client-details.html'
})
export class ClientDetailsComponent implements OnInit {
  private apollo = inject(Apollo);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private transactionService = inject(TransactionService);

  protected client = signal<any | null>(null);
  protected comptes = signal<any[]>([]);
  protected selectedCompteId = signal<string | null>(null);
  protected transactions = signal<any[]>([]);

  protected isLoading = signal(true);
  protected error = signal<string | null>(null);

  protected startDate = signal<string | null>(null); // 'YYYY-MM-DD'
  protected endDate = signal<string | null>(null);

  protected isExporting = signal(false);
  protected isLoadingTransactions = signal(false);

  // derived
  protected fullName = computed(() => {
    const c = this.client();
    return c ? `${c.prenom || ''} ${c.nom || ''}`.trim() : '';
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Identifiant client manquant');
      this.isLoading.set(false);
      return;
    }
    this.loadClient(id);
    this.loadComptes(id);
  }

  private loadClient(id: string) {
    this.isLoading.set(true);
    this.error.set(null);
    this.apollo.query<{ client: any }>({
      query: GET_CLIENT_BY_ID,
      variables: {id},
      fetchPolicy: 'network-only'
    }).subscribe({
      next: res => {
        const data = res?.data;
        this.client.set(data?.client ?? null);
        this.isLoading.set(false);
      },
      error: err => {
        console.error('GET_CLIENT_BY_ID failed', err);
        this.error.set('Impossible de charger le client');
        this.isLoading.set(false);
      }
    });
  }

  private loadComptes(clientId: string) {
    this.apollo.query<{ comptesParClientId: any[] }>({
      query: GET_COMPTES_BY_CLIENT,
      variables: {clientId},
      fetchPolicy: 'network-only'
    }).subscribe({
      next: res => {
        const data = res?.data;
        this.comptes.set(data?.comptesParClientId ?? []);
      },
      error: err => {
        console.error('GET_COMPTES_BY_CLIENT failed', err);
        this.comptes.set([]);
      }
    });
  }

  /**
   * Sélectionne un compte : met à jour selectedCompteId, initialise l'intervalle par défaut
   * et charge automatiquement les transactions (30 derniers jours).
   */
  selectCompte(compteId: string | null) {
    this.selectedCompteId.set(compteId);
    this.transactions.set([]);
    this.error.set(null);

    if (!compteId) {
      this.startDate.set(null);
      this.endDate.set(null);
      return;
    }

    // Défaut : 30 derniers jours
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 30);
    const toYmd = (d: Date) => d.toISOString().slice(0, 10); // 'YYYY-MM-DD' local-ish
    this.startDate.set(toYmd(past));
    this.endDate.set(toYmd(today));

    // Charger automatiquement
    this.fetchTransactions();
  }

  // inside ClientDetailsComponent

  fetchTransactions() {
    const compteId = this.selectedCompteId();
    const start = this.startDate();
    const end = this.endDate();
    if (!compteId || !start || !end) {
      this.error.set('Sélectionnez un compte et une période (début + fin)');
      return;
    }
    this.error.set(null);
    this.isLoadingTransactions.set(true);
    const startIso = this.toIsoLocalStartOfDay(start);
    const endIso = this.toIsoLocalEndOfDay(end);

    this.transactionService.getTransactionsByAccountId(compteId, startIso, endIso).subscribe({
      next: txs => {
        // debug: inspect server response shape in console
        console.debug('getTransactionsByAccountId response:', txs);

        // store raw transactions, but ensure downstream template can show fallback labels
        this.transactions.set((txs ?? []).map(tx => tx ?? {}));
        this.isLoadingTransactions.set(false);
      },
      error: err => {
        console.error('getTransactionsByAccountId failed', err);
        this.error.set('Impossible de charger les transactions');
        this.transactions.set([]);
        this.isLoadingTransactions.set(false);
      }
    });
  }

  /**
   * Retourne un label lisible pour un compte : priorité numero, sinon propriétaire (prenom nom), sinon '—'
   */

  getAccountLabel(c?: any): string {
    if (!c) return '—';
    if (c.numero) return c.numero;
    const p = c.proprietaire;
    if (p) {
      const name = `${p.prenom ?? ''} ${p.nom ?? ''}`.trim();
      if (name) return name;
    }
    return '—';
  }

  /**
   * Exporter / Télécharger le relevé PDF pour le compte sélectionné et la période choisie.
   */
  exportRelevePdf() {
    const compteId = this.selectedCompteId();
    const start = this.startDate();
    const end = this.endDate();
    if (!compteId || !start || !end) {
      this.error.set('Sélectionnez un compte et une période (début + fin) pour l\'export');
      return;
    }
    this.error.set(null);
    this.isExporting.set(true);
    const startIso = this.toIsoLocalStartOfDay(start);
    const endIso = this.toIsoLocalEndOfDay(end);

    this.transactionService.downloadRelevePdf(compteId, startIso, endIso).subscribe({
      next: () => {
        this.isExporting.set(false);
      },
      error: err => {
        console.error('downloadRelevePdf failed', err);
        this.error.set('Erreur lors de la génération du PDF');
        this.isExporting.set(false);
      }
    });
  }

  // Helpers: formatters + ISO local helpers
  formatDate(s?: string) {
    if (!s) return '—';
    try {
      return new Date(s).toLocaleString('fr-FR', {dateStyle: 'short', timeStyle: 'short'});
    } catch {
      return s;
    }
  }

  formatMontant(n?: number) {
    if (n == null) return '0';
    return `${n.toLocaleString('fr-FR')} FCFA`;
  }

  goBack() {
    this.router.navigate(['/clients']);
  }

  private pad(n: number) {
    return n < 10 ? '0' + n : '' + n;
  }

  private toIsoLocalStartOfDay(dateStr: string): string {
    // dateStr expected 'YYYY-MM-DD'
    const parts = dateStr.split('-').map(p => parseInt(p, 10));
    const d = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1, 0, 0, 0, 0);
    const Y = d.getFullYear();
    const M = this.pad(d.getMonth() + 1);
    const D = this.pad(d.getDate());
    return `${Y}-${M}-${D}T00:00:00`;
  }

  private toIsoLocalEndOfDay(dateStr: string): string {
    const parts = dateStr.split('-').map(p => parseInt(p, 10));
    const d = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1, 23, 59, 59, 999);
    const Y = d.getFullYear();
    const M = this.pad(d.getMonth() + 1);
    const D = this.pad(d.getDate());
    return `${Y}-${M}-${D}T23:59:59`;
  }
}
