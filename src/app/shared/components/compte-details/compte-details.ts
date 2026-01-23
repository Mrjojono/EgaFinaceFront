import {ChangeDetectorRef, Component, inject, NgZone, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {AccountService, Compte, StatutCompte} from '../../../services/account';
import {LucideAngularModule} from 'lucide-angular';
import {HlmBadgeImports} from '@spartan-ng/helm/badge';
import {HlmButton} from '@spartan-ng/helm/button';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {HlmLabelImports} from '@spartan-ng/helm/label';
import {BrnSelectImports, BrnSelect} from '@spartan-ng/brain/select';
import {HlmSelectImports} from '@spartan-ng/helm/select';
import {HlmInputImports} from '@spartan-ng/helm/input';
import {finalize} from 'rxjs/operators';
import {Role} from '../../../types/user.type';
import {AuthService} from '../../../services/auth';


@Component({
  selector: 'app-compte-details-page',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    HlmBadgeImports,
    HlmButton,
    ReactiveFormsModule,
    HlmLabelImports,
    BrnSelectImports,
    HlmSelectImports,
    BrnSelect,
    HlmInputImports
  ],
  templateUrl: './compte-details.html',
})
export class CompteDetailsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private accountService = inject(AccountService);
  private fb = inject(FormBuilder);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);

  compte: Compte | null = null;
  isLoading = true;
  errorMessage = '';

  // edit mode state
  editMode = false;
  isSaving = false;
  saveMessage = '';
  form = this.fb.group({
    typeCompte: ['', [Validators.required]],
    libelle: ['']
  });

  isAdmin(): boolean {
    return this.authService.hasRole([Role.ADMIN, Role.SUPER_ADMIN, Role.AGENT_ADMIN]);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Identifiant de compte manquant';
      this.isLoading = false;
      return;
    }
    this.loadCompte(id);
  }

  loadCompte(id: string) {
    this.isLoading = true;
    this.errorMessage = '';
    this.compte = null;

    this.accountService.getCompteById(id).pipe(finalize(() => {
      this.ngZone.run(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      });
    })).subscribe({
      next: (c: Compte | null) => {
        this.ngZone.run(() => {
          this.compte = c;
          if (c) {
            this.form.patchValue({
              typeCompte: c.typeCompte,
              libelle: c.libelle || ''
            });
          } else {
            this.errorMessage = 'Compte introuvable';
          }
          this.cdr.detectChanges();
        });
      },
      error: (err: { message: string; }) => {
        console.error('Erreur getAccount/getCompte:', err);
        this.ngZone.run(() => {
          this.errorMessage = err?.message || 'Impossible de charger le compte';
        });
      }
    });
  }

  toggleEdit() {
    if (!this.compte) return;
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.form.patchValue({
        typeCompte: this.compte.typeCompte,
        libelle: this.compte.libelle || ''
      });
    } else {
      this.saveMessage = '';
      this.form.reset({
        typeCompte: this.compte?.typeCompte ?? '',
        libelle: this.compte?.libelle ?? ''
      });
    }
  }

  /**
   * Save changes: use server response when available; never mutate the original object.
   */
  saveChanges() {
    if (!this.compte) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    this.saveMessage = '';
    const updates = {
      typeCompte: this.form.value.typeCompte,
      libelle: this.form.value.libelle
    } as Partial<Compte>;

    this.accountService.updateAccount(this.compte.id, updates).subscribe({
      next: (res: any) => {
        this.isSaving = false;

        // If server returns updated object use it, else merge immutably
        const returnedCompte = res?.data?.updateCompte ?? res?.updateCompte ?? res?.data?.updateAccount ?? res?.updateAccount ?? res;
        if (returnedCompte && typeof returnedCompte === 'object' && (returnedCompte.id || returnedCompte.numero)) {
          this.compte = returnedCompte as Compte;
        } else {
          this.compte = this.compte ? ({ ...this.compte, ...(updates as any) }) : this.compte;
        }

        this.saveMessage = 'Modifications enregistrées avec succès';
        this.editMode = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur updateAccount', err);
        this.isSaving = false;
        this.saveMessage = err?.message || 'Erreur lors de l\'enregistrement';
      }
    });
  }

  confirmAndDelete() {
    if (!this.compte) return;
    const ok = confirm(`Voulez-vous vraiment supprimer le compte ${this.compte.numero} ? Cette action est irréversible.`);
    if (!ok) return;
    this.isSaving = true;
    this.accountService.deleteAccount(this.compte.id).subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['dashboard/accounts']);
      },
      error: (err) => {
        console.error('Erreur deleteAccount', err);
        this.isSaving = false;
        this.errorMessage = 'Impossible de supprimer le compte';
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/accounts']);
  }

  formatMontant(montant: number | undefined): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant ?? 0);
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Accept undefined and return a safe label
  getTypeCompteLabel(type?: string): string {
    const labels: { [key: string]: string } = {
      'COURANT': 'Compte Courant',
      'EPARGNE': 'Compte Épargne',
      'PROFESSIONNEL': 'Compte Business'
    };
    if (!type) return '—';
    return labels[type] || type;
  }

  // Accept undefined and return a safe icon name
  getTypeCompteIcon(type?: string): string {
    const icons: { [key: string]: string } = {
      'COURANT': 'wallet',
      'EPARGNE': 'piggy-bank',
      'PROFESSIONNEL': 'briefcase'
    };
    if (!type) return 'wallet';
    return icons[type] || 'wallet';
  }

  isSuspended(): boolean {
    return this.compte?.statutCompte === StatutCompte.SUSPENDU;
  }

  toggleStatus() {
    if (!this.compte) return;

    const action = this.isSuspended() ? 'réactiver' : 'suspendre';
    const ok = confirm(`Voulez-vous ${action} ce compte ?`);
    if (!ok) return;

    this.isSaving = true;

    this.accountService.updateAccount(this.compte.id, {
      statutCompte: this.isSuspended() ? StatutCompte.ACTIF : StatutCompte.SUSPENDU
    }).subscribe({
      next: (res: any) => {
        const returned = res?.data?.updateCompte ?? res?.updateCompte ?? null;
        if (returned) {
          this.compte = returned as Compte;
        } else {
          const newStatut = this.isSuspended() ? StatutCompte.ACTIF : StatutCompte.SUSPENDU;
          this.compte = this.compte ? ({ ...this.compte, statutCompte: newStatut }) : this.compte;
        }
        this.isSaving = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'Impossible de modifier le statut du compte';
      }
    });
  }
}
