import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HlmButton} from '@spartan-ng/helm/button';
import {LucideAngularModule} from 'lucide-angular';
import {HlmCard, HlmCardContent, HlmCardImports} from '@spartan-ng/helm/card';
import {HlmBadgeImports} from '@spartan-ng/helm/badge';
import {AddCompte} from '../../shared/components/add-compte/add-compte';
import {BrnDialogService} from '@spartan-ng/brain/dialog';
import {AccountService, Compte} from '../../services/account';
import {AuthService} from '../../services/auth';
import {Router} from '@angular/router';
import {finalize} from 'rxjs/operators';
import { NgZone, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-comptes',
  standalone: true,
  imports: [
    CommonModule,
    HlmButton,
    LucideAngularModule,
    HlmCard,
    HlmCardContent,
    HlmCardImports,
    HlmBadgeImports,
  ],
  templateUrl: './comptes.html',
})
export class Comptes implements OnInit {
  private _dialogService = inject(BrnDialogService);
  private accountService = inject(AccountService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  comptes: Compte[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit() {
    this.loadComptes();
  }


  loadComptes() {
    const clientId = this.authService.getCurrentUserId();
    if (!clientId) {
      this.errorMessage = "Impossible de charger les comptes";
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.accountService.getAccountsByClientId(clientId)
      .pipe(finalize(() => {
        // garantit que le loader est désactivé (on le fait dans la zone aussi)
        this.ngZone.run(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        });
      }))
      .subscribe({
        next: (comptes) => {
          this.ngZone.run(() => {
            this.comptes = Array.isArray(comptes) ? comptes : [];
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          console.error('Erreur chargement comptes:', err);
          this.ngZone.run(() => {
            this.errorMessage = "Erreur lors du chargement des comptes";
          });
        }
      });
  }



  openAddCompte() {
    const dialogRef = this._dialogService.open(AddCompte);

    dialogRef.closed$.subscribe((result) => {
      if (result) {
        console.log('Compte créé:', result);
        this.loadComptes();
      }
    });
  }

  viewCompteDetails(compteId: string) {
    this.router.navigate(['dashboard/comptes', compteId]);
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

  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}
