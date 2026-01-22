import {Component, inject, ChangeDetectorRef} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {BrnDialogRef} from '@spartan-ng/brain/dialog';
import {HlmDialogImports} from '@spartan-ng/helm/dialog';
import {HlmLabelImports} from '@spartan-ng/helm/label';
import {HlmInputImports} from '@spartan-ng/helm/input';
import {HlmButtonImports} from '@spartan-ng/helm/button';
import {BrnSelect, BrnSelectImports} from '@spartan-ng/brain/select';
import {HlmSelectImports} from '@spartan-ng/helm/select';
import {AccountService} from '../../../services/account';
import {AuthService} from '../../../services/auth';
import {CommonModule} from '@angular/common';
import {HlmSpinnerImports} from '@spartan-ng/helm/spinner';

@Component({
  selector: 'app-add-compte',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmDialogImports,
    HlmLabelImports,
    HlmInputImports,
    HlmButtonImports,
    BrnSelectImports,
    HlmSelectImports,
    BrnSelect,
    HlmSpinnerImports
  ],
  templateUrl: './add-compte.html',
})
export class AddCompte {

  private accountService = inject(AccountService);
  private authService = inject(AuthService);
  private _dialogRef = inject<BrnDialogRef<AddCompte>>(BrnDialogRef);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  // États de gestion
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  form = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(3)]],
    typeCompte: ['', [Validators.required]],
    solde: [0, [Validators.required, Validators.min(0)]],
  });

  close() {
    this._dialogRef.close();
  }

  save() {
    if (this.form.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const clientId = this.authService.getCurrentUserId();
      const {nom, typeCompte, solde} = this.form.value;

      if (!clientId) {
        this.errorMessage = "Impossible de trouver l'ID de l'utilisateur";
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }

      this.accountService.createAccount(
        typeCompte as string,
        solde as number,
        clientId
      ).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Compte créé avec succès !';
          this.cdr.detectChanges();

          // Fermer le dialog après 1 seconde pour laisser voir le message
          setTimeout(() => {
            this._dialogRef.close(response.data.createCompte);
          }, 1000);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Une erreur est survenue lors de la création du compte';
          this.cdr.detectChanges();
          console.error('Erreur création compte:', err);
        }
      });
    } else {
      // Marquer tous les champs comme touched pour afficher les erreurs
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }
}
