import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgApexchartsModule, ApexOptions} from 'ng-apexcharts';

@Component({
  selector: 'app-income-vs-expense-stacked-bar',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div class="w-full h-full bg-white p-4 rounded-lg border flex flex-col">
      <div class="flex justify-between items-center mb-3">
        <div>
          <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wide">{{ title }}</h3>
          <p class="text-lg font-semibold text-slate-800">{{ subtitle }}</p>
        </div>
      </div>

      <!-- make chart container flexible so apx-chart can fill the space -->
      <div class="flex-1 min-h-[200px] flex">
        <apx-chart
          class="flex-1"
          [series]="options.series!"
          [chart]="options.chart!"
          [plotOptions]="options.plotOptions!"
          [xaxis]="options.xaxis!"
          [yaxis]="options.yaxis!"
          [colors]="options.colors!"
          [tooltip]="options.tooltip!"
          [dataLabels]="options.dataLabels!"
          [legend]="options.legend!"
          [grid]="options.grid!"
        ></apx-chart>
      </div>
    </div>
  `
})
export class IncomeVsExpenseStackedBarComponent implements OnChanges {
  @Input() title = 'Revenus vs Dépenses';
  @Input() subtitle = '';
  @Input() categories: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  @Input() income: number[] = [5000, 7000, 6500, 8000, 7200, 9000];
  @Input() expenses: number[] = [3000, 2500, 4200, 3100, 3800, 4300];

  public options: Partial<ApexOptions> = {
    series: [],
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: {show: false},
      fontFamily: 'Inter, sans-serif',

      height: '100%',
      parentHeightOffset: 0,
      animations: {enabled: true}
    },
    plotOptions: {bar: {horizontal: false, columnWidth: '50%'}},
    xaxis: {categories: [], labels: {style: {colors: '#94a3b8', fontSize: '11px'}}},
    yaxis: {
      labels: {style: {colors: '#94a3b8'}, formatter: (val: any) => `${Math.round(val)}€`}
    },
    colors: ['#10B981', '#EF4444'],
    tooltip: {y: {formatter: (val: any) => `${val} €`}},
    dataLabels: {enabled: false},
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      // reduce legend height impact
      floating: false
    },
    grid: {
      padding: {top: 6, right: 0, bottom: 0, left: 10},
      borderColor: '#f1f5f9',
      strokeDashArray: 4
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    this.options = {
      ...this.options,
      series: [
        {name: 'Revenus', data: this.income},
        {name: 'Dépenses', data: this.expenses}
      ],
      xaxis: {...this.options.xaxis, categories: this.categories}
    };
    if (!this.subtitle) {
      const totalIncome = this.income.reduce((s, v) => s + v, 0);
      const totalExpenses = this.expenses.reduce((s, v) => s + v, 0);
      const diff = totalIncome - totalExpenses;
      this.subtitle = `${new Intl.NumberFormat('fr-FR').format(diff)} € net`;
    }
  }
}
