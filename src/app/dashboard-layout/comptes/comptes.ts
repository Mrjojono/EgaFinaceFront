import { Component } from '@angular/core';
import {HlmButton} from '@spartan-ng/helm/button';
import {LucideAngularModule} from 'lucide-angular';
import {BrnSelect} from '@spartan-ng/brain/select';
import {HlmCard, HlmCardContent} from '@spartan-ng/helm/card';
import {HlmInput} from '@spartan-ng/helm/input';
import {HlmLabel} from '@spartan-ng/helm/label';
import {HlmSelectContent, HlmSelectOption, HlmSelectTrigger, HlmSelectValue} from '@spartan-ng/helm/select';

@Component({
  selector: 'app-comptes',
  imports: [
    HlmButton,
    LucideAngularModule,
    BrnSelect,
    HlmCard,
    HlmCardContent,
    HlmInput,
    HlmLabel,
    HlmSelectContent,
    HlmSelectOption,
    HlmSelectTrigger,
    HlmSelectValue
  ],
  templateUrl: './comptes.html',
})
export class Comptes {

}
