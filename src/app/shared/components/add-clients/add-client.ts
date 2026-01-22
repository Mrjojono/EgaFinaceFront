import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { BrnSelect, BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { CommonModule } from '@angular/common';
import {ClientsService} from '../../../services/client';


@Component({
  selector: 'app-add-client',
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
  templateUrl: './add-client.html'
})
export class AddClientComponent {
  private clientsService = inject(ClientsService);
  private _dialogRef = inject<BrnDialogRef<AddClientComponent>>(BrnDialogRef);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  sexes = [
    { value: 'HOMME', label: 'Homme' },
    { value: 'FEMME', label: 'Femme' },
    { value: 'AUTRE', label: 'Autre' }
  ];

  form = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(2)]],
    prenom: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    nationalite: ['', [Validators.required]],
    telephone: [''],
    adresse: [''],
    dateNaissance: [''],
    sexe: [''],
    password: [''] // optional: if empty we will generate one
  });

  close() {
    this._dialogRef.close();
  }

  private generateTempPassword(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
    let pass = '';
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  }

  save() {
    if (!this.form.valid) {
      // mark all as touched to show validation
      Object.keys(this.form.controls).forEach(k => this.form.get(k)?.markAsTouched());
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const val = this.form.value;
    const password = val.password && String(val.password).trim().length > 0 ? val.password : this.generateTempPassword();

    const payload: any = {
      email: val.email,
      nom: val.nom,
      prenom: val.prenom,
      nationalite: val.nationalite,
      password
    };

    // Optional fields: backend mutation may ignore them if not expected by REGISTER_MUTATION,
    // but we pass them to the service method in case server accepts extras.
    if (val.telephone) payload.telephone = val.telephone;
    if (val.adresse) payload.adresse = val.adresse;
    if (val.dateNaissance) payload.dateNaissance = val.dateNaissance;
    if (val.sexe) payload.sexe = val.sexe;

    this.clientsService.createClient(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const created = res?.data?.createClient ?? null;
        this.successMessage = 'Client créé avec succès';
        this.cdr.detectChanges();

        // Fermer en renvoyant le client créé (incluant le mot de passe temporaire pour affichage si besoin)
        setTimeout(() => {
          // On peut renvoyer aussi le mot de passe temporaire si utile pour l'opérateur
          this._dialogRef.close();
        }, 800);
      },
      error: (err) => {
        console.error('Erreur création client:', err);
        this.isLoading = false;
        this.errorMessage = err?.error?.message || err?.message || 'Une erreur est survenue';
        this.cdr.detectChanges();
      }
    });
  }
}
