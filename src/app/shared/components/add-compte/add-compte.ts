import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import {BrnSelect, BrnSelectImports} from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';

@Component({
  selector: 'app-add-compte',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HlmDialogImports,
    HlmLabelImports,
    HlmInputImports,
    HlmButtonImports,
    BrnSelectImports,
    HlmSelectImports,
    BrnSelect
  ],
  templateUrl: './add-compte.html',
})
export class AddCompte {
  private _dialogRef = inject<BrnDialogRef<AddCompte>>(BrnDialogRef);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    typeCompte: ['', [Validators.required]],
    solde: [0, [Validators.required, Validators.min(0)]],
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
}
