import {Component, inject} from '@angular/core';
import {BrnSelect, BrnSelectImports} from '@spartan-ng/brain/select';
import {HlmButton} from '@spartan-ng/helm/button';
import {HlmInput} from '@spartan-ng/helm/input';
import {HlmLabel} from '@spartan-ng/helm/label';
import {HlmSelectImports} from '@spartan-ng/helm/select';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';

import {HlmTabsImports} from '@spartan-ng/helm/tabs';
import {BrnDialogRef} from '@spartan-ng/brain/dialog';
import {LucideAngularModule} from 'lucide-angular';

@Component({
  selector: 'app-do-transaction',
  imports: [
    BrnSelectImports,
    HlmButton,
    HlmSelectImports,
    ReactiveFormsModule,
    HlmTabsImports,
    LucideAngularModule,
    BrnSelect
  ],
  templateUrl: './do-transaction.html',
})
export class DoTransaction {
  private _dialogRef = inject<BrnDialogRef<DoTransaction>>(BrnDialogRef);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    CompteSource: ['', [Validators.required]],
    CompteDestination: ['', [Validators.required]],
    montant: [0, [Validators.required, Validators.min(0)]],
  });


  close() {
    this._dialogRef.close();
  }

  save() {
    if (this.form.valid) {
      console.log('Données du formulaire :', this.form.value);
      this._dialogRef.close();
    }
  }

  setAmount(value: number) {
    const currentAmount = this.form.get('montant')?.value || 0;
    this.form.patchValue({
      montant: Number(currentAmount) + value
    });
  }
}
