import {Component, OnInit, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {AccountService, Compte} from '../../../services/account';
import {LucideAngularModule} from 'lucide-angular';
import {HlmBadgeImports} from '@spartan-ng/helm/badge';
import {HlmButton} from '@spartan-ng/helm/button';
import {ReactiveFormsModule, FormBuilder, Validators} from '@angular/forms';
import {HlmLabelImports} from '@spartan-ng/helm/label';
import {HlmInputImports} from '@spartan-ng/helm/input';
import {BrnSelect, BrnSelectImports} from '@spartan-ng/brain/select';
import {HlmSelectImports} from '@spartan-ng/helm/select';
import {finalize} from 'rxjs/operators';
import {NgZone, ChangeDetectorRef} from '@angular/core';


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
    BrnSelect
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

  compte: Compte | null = null;
  isLoading = true;
  errorMessage = '';

  // edit mode state
  editMode = false;
  isSaving = false;
  saveMessage = '';
  form = this.fb.group({
    typeCompte: ['', [Validators.required]]
  });

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
        console.log('loadCompte -> compte reçu:', c);
        this.ngZone.run(() => {
          this.compte = c;
          if (c) {
            this.form.patchValue({typeCompte: c.typeCompte});
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
      this.form.patchValue({typeCompte: this.compte.typeCompte});
    } else {
      this.saveMessage = '';
      this.form.reset({typeCompte: this.compte?.typeCompte ?? ''});
    }
  }

  saveChanges() {
    if (!this.compte) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    this.saveMessage = '';
    const updates = {typeCompte: this.form.value.typeCompte} as Partial<Compte>;

    this.accountService.updateAccount(this.compte.id, updates).subscribe({
      next: (res: any) => {
        this.isSaving = false;

        if (this.compte) {
          this.compte.typeCompte = updates.typeCompte!;
        }
        this.saveMessage = 'Modifications enregistrées';
        this.editMode = false;
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
    this.router.navigate(['/comptes']);
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

  getTypeCompteLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'COURANT': 'Compte Courant',
      'EPARGNE': 'Compte Épargne',
      'PROFESSIONNEL': 'Compte Business'
    };
    return labels[type] || type;
  }

  getTypeCompteIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'COURANT': 'wallet',
      'EPARGNE': 'piggy-bank',
      'PROFESSIONNEL': 'briefcase'
    };
    return icons[type] || 'wallet';
  }


}
