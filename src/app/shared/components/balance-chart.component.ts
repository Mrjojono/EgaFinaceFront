import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {NgApexchartsModule, ApexOptions} from "ng-apexcharts";
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-balance-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  styles: [`
    :host {
      display: block;
      height: 100%; /* Le composant prend toute la place de la carte du dashboard */
      width: 100%;
    }
  `],
  template: `
    <div class="w-full h-full bg-white p-6 rounded-lg border flex flex-col">
      <!-- Header -->
      <div class="flex justify-between items-start mb-2">
        <div>
          <h2 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ title }}</h2>
          <p class="text-2xl font-black text-slate-800">{{ subtitle }}</p>
        </div>
        <div class="flex gap-2">
           <span
             class="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
             <span class="relative flex h-1.5 w-1.5">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
             </span>
             LIVE
           </span>
        </div>
      </div>


      <div class="flex-1 w-full overflow-hidden">
        <apx-chart
          [series]="options.series!"
          [chart]="options.chart!"
          [stroke]="options.stroke!"
          [colors]="options.colors!"
          [fill]="options.fill!"
          [tooltip]="options.tooltip!"
          [xaxis]="options.xaxis!"
          [grid]="options.grid!"
          [yaxis]="options.yaxis!"
          [dataLabels]="options.dataLabels!"
          [markers]="options.markers!"
        ></apx-chart>
      </div>
    </div>
  `
})
export class BalanceChartComponent implements OnChanges {
  @Input() title: string = "COMPTE COURANT";
  @Input() subtitle: string = "720,00 €";
  @Input() data: number[] = [450, 520, 480, 610, 590, 720, 680];

  public options: Partial<ApexOptions> = {
    series: [{name: "Solde", data: []}],
    chart: {
      type: "area",

      toolbar: {show: false},
      fontFamily: 'Inter, sans-serif',
      sparkline: {enabled: false},
      animations: { enabled: true }
    },
    dataLabels: {enabled: false},
    stroke: {curve: "smooth", width: 3, lineCap: 'round'},
    colors: ["#10b981"],
    markers: {
      size: 0,
      hover: {size: 5}
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100]
      }
    },
    xaxis: {
      categories: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
      labels: {
        show: true,
        style: {colors: '#94a3b8', fontSize: '11px', fontWeight: 500}
      },
      axisBorder: {show: false},
      axisTicks: {show: false}
    },
    yaxis: {
      show: true,
      tickAmount: 3,
      labels: {
        style: {colors: '#94a3b8', fontSize: '11px', fontWeight: 500},
        formatter: (val) => val.toFixed(0) + "€"
      }
    },
    grid: {
      show: true,
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      xaxis: {lines: {show: false}},
      yaxis: {lines: {show: true}},
      padding: {top: 0, right: 0, bottom: 0, left: 10}
    },
    tooltip: {
      theme: "light",
      x: {show: false},
      y: {formatter: (val) => val + " €"}
    }
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {

      this.options = {
        ...this.options,
        series: [{name: "Solde", data: this.data}]
      };
    }
  }
}
