import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BalanceChartComponent } from '../shared/components/balance-chart.component';
import { TransactionTypeDonutComponent } from '../shared/components/app-transaction-type-donut';
import { IncomeVsExpenseStackedBarComponent } from '../shared/components/app-income-vs-expense-stacked-bar';
import { Account } from '../types/compte.type';
import { Transaction } from '../types/transaction.type';

@Component({
  selector: 'app-graphs',
  standalone: true,
  imports: [
    CommonModule,
    BalanceChartComponent,
    TransactionTypeDonutComponent,
    IncomeVsExpenseStackedBarComponent
  ],
  templateUrl: './graphs.html',
})
export class Graphs implements OnInit {
  accounts: Account[] = [];
  transactions: Transaction[] = [];
  selectedAccount = signal<Account | null>(null);
  chartData = signal<number[]>([450, 520, 480, 610, 590, 720, 680]);

  // fallback sample data
  private sampleAccounts: Account[] = [
    { id: 1, type: "Compte courant", etat: 'Actif' as any, solde: 4250000, Iban: "FR76 3000 6000 0123 4567 8901 234", devise: "FCFA" },
    { id: 2, type: "Épargne Projet", etat: 'Bloqué' as any, solde: 150000, Iban: "FR76 3000 6000 0987 6543 2109 888", devise: "FCFA" }
  ];

  private sampleTransactions: Transaction[] = [
    { id: 'TXN-1', date: '21.03.2024', label: 'Salaire', receiver: 'Moi', sender: 'Acme', senderAccount: 'FR76 0000', receiverAccount: 'FR76 3000 6000 0123 4567 8901 234', amount: 250000, fees: 0, status: 'Effectué' } as any,
    { id: 'TXN-2', date: '20.03.2024', label: 'Courses', receiver: 'Carrefour', sender: 'Moi', senderAccount: 'FR76 3000 6000 0123 4567 8901 234', receiverAccount: 'FR76 2222', amount: -120.5, fees: 0, status: 'Effectué' } as any
  ];

  ngOnInit(): void {
    // Read router state (if Home navigated with state). Fallback to sample data.
    const s = (window && (window.history && window.history.state)) || null;
    this.accounts = s?.accounts ?? this.sampleAccounts;
    this.transactions = s?.transactions ?? this.sampleTransactions;

    if (this.accounts && this.accounts.length) {
      this.selectAccountInternal(this.accounts[0]);
    }
  }

  selectAccount(idOrAcc: number | Account) {
    const acc = typeof idOrAcc === 'number' ? this.accounts.find(a => a.id === idOrAcc) : idOrAcc as Account;
    if (!acc) return;
    this.selectAccountInternal(acc);
  }

  private selectAccountInternal(acc: Account) {
    this.selectedAccount.set(acc);
    this.updateChartForSelectedAccount();
  }

  private updateChartForSelectedAccount() {
    const acc = this.selectedAccount();
    if (!acc) return;
    const series = this.generateBalanceSeriesForAccount(acc, this.transactions ?? [], 7);
    this.chartData.set(series);
  }

  private generateBalanceSeriesForAccount(account: Account, txs: Transaction[], points = 7): number[] {
    if (!txs || txs.length === 0) return Array(points).fill(Math.round((account.solde ?? 0) / points));

    const normalizeDate = (d: string) => {
      if (!d) return new Date();
      if (d.includes('.')) {
        const [dd, mm, yyyy] = d.split('.');
        return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      }
      return new Date(d);
    };

    const matched = txs
      .map(t => ({ ...t, _date: normalizeDate(t.date) }))
      .filter(t => t.senderAccount === account.Iban || t.receiverAccount === account.Iban)
      .sort((a, b) => +a._date - +b._date);

    if (matched.length > 0) {
      const totalMatched = matched.reduce((s, t) => s + (t.amount ?? 0), 0);
      const startBalance = (account.solde ?? 0) - totalMatched;
      const cumul: number[] = [];
      let running = startBalance;
      for (const t of matched) {
        running += t.amount ?? 0;
        cumul.push(Math.round(running * 100) / 100);
      }
      const padCount = Math.max(0, points - cumul.length);
      const padded = [...Array(padCount).fill(Math.round(startBalance * 100) / 100), ...cumul];
      return padded.length > points ? padded.slice(-points) : padded;
    }

    const global = txs.map(t => ({ ...t, _date: normalizeDate(t.date) })).sort((a, b) => +a._date - +b._date);
    const last = global.slice(-points);
    const sumLast = last.reduce((s, t) => s + (t.amount ?? 0), 0);
    let start = (account.solde ?? 0) - sumLast;
    const res: number[] = [];
    for (const t of last) {
      start += t.amount ?? 0;
      res.push(Math.round(start * 100) / 100);
    }
    const padCount = Math.max(0, points - res.length);
    if (padCount > 0) {
      const pad = Array(padCount).fill(Math.round(((account.solde ?? 0) - sumLast) * 100) / 100);
      return [...pad, ...res];
    }
    return res;
  }

  // Donut data for selected account (or global if no selected)
  computeDonutDataForSelectedAccount(): { label: string; value: number }[] {
    const acc = this.selectedAccount();
    const txs = (this.transactions ?? []).filter(t => {
      if (!acc) return true;
      return t.senderAccount === acc.Iban || t.receiverAccount === acc.Iban;
    });
    const sums = txs.reduce((s, t) => {
      if ((t.amount ?? 0) >= 0) s.revenu += t.amount ?? 0;
      else s.depense += Math.abs(t.amount ?? 0);
      return s;
    }, { revenu: 0, depense: 0 });
    return [
      { label: 'Revenus', value: Math.round(sums.revenu * 100) / 100 },
      { label: 'Dépenses', value: Math.round(sums.depense * 100) / 100 }
    ];
  }

  // Monthly grouped data for stacked bar for selected account (or global)
  computeMonthlyCategoriesForSelectedAccount(): { categories: string[]; income: number[]; expenses: number[] } {
    const acc = this.selectedAccount();
    const txs = (this.transactions ?? []).filter(t => {
      if (!acc) return true;
      return t.senderAccount === acc.Iban || t.receiverAccount === acc.Iban;
    });

    const parseDate = (d: string) => {
      if (!d) return new Date();
      if (d.includes('.')) {
        const [dd, mm, yyyy] = d.split('.');
        return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      }
      return new Date(d);
    };

    const map = new Map<string, { income: number; expense: number; date: Date }>();
    for (const t of txs) {
      const dt = parseDate(t.date);
      const key = dt.toLocaleString('fr-FR', { month: 'short', year: 'numeric' });
      const label = key.charAt(0).toUpperCase() + key.slice(1);
      const curr = map.get(label) ?? { income: 0, expense: 0, date: dt };
      if ((t.amount ?? 0) >= 0) curr.income += t.amount ?? 0;
      else curr.expense += Math.abs(t.amount ?? 0);
      map.set(label, curr);
    }

    const entries = Array.from(map.entries())
      .map(([label, v]) => ({ label, income: v.income, expense: v.expense, date: v.date }))
      .sort((a, b) => +a.date - +b.date);

    const categories = entries.map(e => e.label);
    const income = entries.map(e => Math.round(e.income * 100) / 100);
    const expenses = entries.map(e => Math.round(e.expense * 100) / 100);

    // If no monthly buckets (no txs), return some defaults
    if (!categories.length) {
      return { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], income: [500, 700, 650, 800, 720], expenses: [300, 250, 420, 310, 380] };
    }
    return { categories, income, expenses };
  }

  // wrappers for template
  selectedAccountId() {
    return this.selectedAccount()?.id ?? null;
  }
  chartDataValue() {
    return this.chartData();
  }
}
