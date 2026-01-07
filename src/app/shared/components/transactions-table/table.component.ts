import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmButtonImports} from '@spartan-ng/helm/button';
import { HlmCollapsibleImports } from '@spartan-ng/helm/collapsible';
import { Transaction } from '../../../types/transaction.type';

@Component({
  selector: 'app-transaction-table',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    HlmTableImports,
    HlmButtonImports,
    HlmCollapsibleImports
  ],
  templateUrl: './table.component.html'
})
export class TransactionTableComponent {

  transactions = input.required<Transaction[]>();


  download = output<Transaction>();

  onDownload(t: Transaction) {
    this.download.emit(t);
  }

}
