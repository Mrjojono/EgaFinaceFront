import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';

@Component({
  selector: 'app-transaction-type-donut',
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

      <div class="flex-1 min-h-[160px] flex">
        <apx-chart
          class="flex-1"
          [series]="options.series!"
          [chart]="options.chart!"
          [labels]="options.labels!"
          [colors]="options.colors!"
          [legend]="options.legend!"
          [tooltip]="options.tooltip!"
          [dataLabels]="options.dataLabels!"
          [plotOptions]="options.plotOptions!"
        ></apx-chart>
      </div>
    </div>
  `
})
export class TransactionTypeDonutComponent implements OnChanges {
  @Input() title = 'Répartition par type';
  @Input() subtitle = '';
  @Input() data: { label: string; value: number }[] = [
    { label: 'Dépôt', value: 250000 },
    { label: 'Retrait', value: 18000 },
    { label: 'Virement', value: 50000 },
    { label: 'Frais', value: 2500 },
  ];

  public options: Partial<ApexOptions> = {
    series: [],
    chart: {
      type: 'donut',
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
      // let the chart grow to fill the parent container
      height: '100%',
      parentHeightOffset: 0
    },
    labels: [],
    colors: ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6'],
    legend: { position: 'bottom', horizontalAlign: 'center' },
    tooltip: { y: { formatter: (val: any) => `${val} FCFA` } },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: { size: '58%', labels: { show: true, name: { show: true }, value: { show: true } } }
      }
    } as any,
    grid: { padding: { top: 6, right: 0, bottom: 0, left: 0 } }
  };

  ngOnChanges(changes: SimpleChanges): void {
    this.options = {
      ...this.options,
      series: this.data.map(d => d.value),
      labels: this.data.map(d => d.label)
    };
    if (!this.subtitle) {
      const total = this.data.reduce((s, d) => s + d.value, 0);
      this.subtitle = new Intl.NumberFormat('fr-FR').format(total) + ' FCFA';
    }
  }
}
