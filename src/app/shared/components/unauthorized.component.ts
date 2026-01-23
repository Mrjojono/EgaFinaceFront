import { Component } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';


@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule,  NgOptimizedImage],
  template: `
    <div class="flex flex-row mx-auto ">
      <img ngSrc="/unauthorized.svg" class="w-80 h-80" alt="unauthorized" fill>
    </div>
  `,
})
export class UnauthorizedComponent {}
