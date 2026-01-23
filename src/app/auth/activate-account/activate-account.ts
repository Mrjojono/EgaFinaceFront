import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { LucideAngularModule } from 'lucide-angular';
import { Activation } from '../../services/activation';
import { toast } from 'ngx-sonner';
import { HlmToaster } from '@spartan-ng/helm/sonner';

@Component({
  selector: 'app-activate-account',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    HlmInputImports,
    HlmLabelImports,
    HlmButtonImports,
    LucideAngularModule,
    HlmToaster,
    FormsModule
  ],
  templateUrl: './activate-account.html'
})
export class ActivateAccountComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private activationService = inject(Activation);

  // UI state
  isLoading = signal(false);
  isSubmitting = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  // token from query param (if any)
  token: string | null = null;

  // forms
  completeForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  });

  initiateForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    identifiant: ['', [Validators.required]]
  });

  ngOnInit(): void {
    // read token from query param
    this.token = this.route.snapshot.queryParamMap.get('token');

    // If a token is present, prefill and focus on complete form by default
    if (this.token) {
      this.successMessage.set(null);
      this.errorMessage.set(null);
    }
  }

  submitComplete(): void {
    // validate
    Object.keys(this.completeForm.controls).forEach(k => this.completeForm.get(k)?.markAsTouched());
    if (this.completeForm.invalid) {
      this.errorMessage.set('Veuillez fournir un mot de passe valide (min. 8 caractères).');
      return;
    }

    const pw = this.completeForm.get('password')!.value;
    const confirm = this.completeForm.get('confirmPassword')!.value;
    if (pw !== confirm) {
      this.errorMessage.set('Les mots de passe ne correspondent pas.');
      return;
    }

    const token = this.token;
    if (!token) {
      this.errorMessage.set('Token d\'activation manquant.');
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    this.activationService.completeActivation(this.token!, pw!).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res?.success) {
          this.successMessage.set(res.message || 'Activation réussie. Vous pouvez vous connecter.');
          toast.success('Activation réussie', { description: res.message || '' });
          setTimeout(() => this.router.navigate(['/login']), 1200);
        } else {
          this.errorMessage.set(res?.message || 'Activation échouée.');
          toast.error('Erreur', { description: res?.message || 'Activation échouée' });
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = this.extractErrorMessage(err);
        this.errorMessage.set(msg);
        toast.error('Erreur', { description: msg });
      }
    });
  }

  // Initiate activation (no token) -> sends email with token
  submitInitiate(): void {
    Object.keys(this.initiateForm.controls).forEach(k => this.initiateForm.get(k)?.markAsTouched());
    if (this.initiateForm.invalid) {
      this.errorMessage.set('Veuillez fournir un email valide et votre identifiant.');
      return;
    }

    const { email, identifiant } = this.initiateForm.getRawValue();
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.activationService.initiateActivation(identifiant!, email!).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res?.success) {
          this.successMessage.set(res.message || 'Un email a été envoyé avec les instructions d\'activation.');
          toast.success('Email envoyé', { description: res.message || '' });
        } else {
          this.errorMessage.set(res?.message || 'Impossible d\'initier l\'activation.');
          toast.error('Erreur', { description: res?.message || '' });
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = this.extractErrorMessage(err);
        this.errorMessage.set(msg);
        toast.error('Erreur', { description: msg });
      }
    });
  }

  // helper to get control state in template
  get cf() { return this.completeForm.controls; }
  get ii() { return this.initiateForm.controls; }

  private extractErrorMessage(error: any): string {
    if (error?.graphQLErrors && error.graphQLErrors.length) return error.graphQLErrors[0].message;
    if (error?.networkError) return 'Le serveur est injoignable.';
    return error?.message || 'Une erreur est survenue';
  }
}
