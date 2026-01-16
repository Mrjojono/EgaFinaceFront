import {Component, inject} from '@angular/core';
import {BrnSelect} from '@spartan-ng/brain/select';
import {HlmButton, HlmButtonImports} from '@spartan-ng/helm/button';
import {HlmSelectContent, HlmSelectOption, HlmSelectTrigger, HlmSelectValue} from '@spartan-ng/helm/select';
import {HlmTabs, HlmTabsContent, HlmTabsList, HlmTabsTrigger} from '@spartan-ng/helm/tabs';
import {LucideAngularModule} from 'lucide-angular';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {HlmInputImports} from '@spartan-ng/helm/input';

@Component({
  selector: 'app-settings',
  imports: [
    HlmTabs,
    HlmTabsContent,
    HlmTabsList,
    HlmTabsTrigger,
    LucideAngularModule,
    ReactiveFormsModule,
    HlmInputImports,
    HlmButtonImports
  ],
  templateUrl: './settings.html',
})
export class Settings {

  private fb = inject(FormBuilder);

  form = this.fb.group({
    CompteSource: ['', [Validators.required]],
    CompteDestination: ['', [Validators.required]],
    montant: [0, [Validators.required, Validators.min(0)]],
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    address: ['', [Validators.required]],
    phone: ['', [Validators.required]],
  });
}
