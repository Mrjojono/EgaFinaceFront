import { Component, inject, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {BrnSelect, BrnSelectImports} from '@spartan-ng/brain/select';
import { BrnTabsImports } from '@spartan-ng/brain/tabs';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { LucideAngularModule } from 'lucide-angular';
import { AccountService, Compte, Client, ComptePublicInfo } from '../../../services/account';
import { TransactionService } from '../../../services/transaction';
import { debounceTime, distinctUntilChanged, switchMap, catchError, finalize } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

type TransactionResult =
  | { type: 'depot'; payload: { compteDestinationId: string; montant: number } }
  | { type: 'retrait'; payload: { compteSourceId: string; montant: number } }
  | { type: 'virement'; payload: { source: string; destination: string; montant: number } };

@Component({
  selector: 'app-do-transaction',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BrnSelectImports,
    BrnTabsImports,
    HlmSelectImports,
    HlmInputImports,
    HlmLabelImports,
    HlmTabsImports,
    HlmButtonImports,
    LucideAngularModule,
    BrnSelect,
  ],
  templateUrl: './do-transaction.html',
})
export class DoTransaction implements OnInit {
  private _dialogRef = inject<BrnDialogRef<DoTransaction>>(BrnDialogRef);
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  isSaving = false;
  isLoadingAccounts = false;
  isSearching = false;
  errorMessage = '';

  // Comptes de l'utilisateur actuel
  myAccounts: Compte[] = [];

  // Résultats de recherche pour les destinataires
  searchResults: Client[] = [];

  // Utiliser ComptePublicInfo au lieu de Compte
  selectedDestinataireComptes: ComptePublicInfo[] = [];

  // Subject pour la recherche
  private searchSubject = new Subject<string>();

  form = this.fb.group({
    // Dépôt
    compteDestination: ['', Validators.required],
    searchEmail: [''],
    montant: [0, [Validators.required, Validators.min(1)]],

    // Retrait
    compteRetrait: ['', Validators.required],
    montantRetrait: [0, [Validators.required, Validators.min(1)]],

    // Virement
    compteVirementSource: ['', Validators.required],
    compteVirementDestination: ['', Validators.required],
    searchEmailVirement: [''],
    referenceVirement: [''],
    montantVirement: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit() {
    this.loadMyComptes();

    // Configurer la recherche avec debounce
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(email => {
          if (!email || email.length < 3) {
            return of([]);
          }
          this.isSearching = true;
          return this.accountService.searchClientsByEmail(email).pipe(
            catchError(err => {
              console.error('Erreur de recherche:', err);
              this.ngZone.run(() => {
                this.errorMessage = 'Erreur lors de la recherche';
              });
              return of([]);
            }),
            finalize(() => {
              this.ngZone.run(() => {
                this.isSearching = false;
                this.cdr.markForCheck();
              });
            })
          );
        })
      )
      .subscribe(clients => {
        this.ngZone.run(() => {
          this.searchResults = Array.isArray(clients) ? clients : [];
          this.cdr.detectChanges();
        });
      });

    this.form.get('searchEmail')?.valueChanges.subscribe(email => {
      if (email) {
        this.searchSubject.next(email);
      }
    });

    this.form.get('searchEmailVirement')?.valueChanges.subscribe(email => {
      if (email) {
        this.searchSubject.next(email);
      }
    });
  }

  loadMyComptes() {
    this.isLoadingAccounts = true;
    this.errorMessage = '';

    this.accountService.getComptes()
      .pipe(finalize(() => {
        this.ngZone.run(() => {
          this.isLoadingAccounts = false;
          this.cdr.markForCheck();
        });
      }))
      .subscribe({
        next: (comptes) => {
          this.ngZone.run(() => {
            this.myAccounts = Array.isArray(comptes) ? comptes : [];

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

  /**
   * Sélectionne un client destinataire et charge ses comptes
   */
  selectDestinataire(client: Client) {
    this.isSearching = true;
    this.errorMessage = '';

    this.accountService.searchComptesForTransfer(client.email)
      .pipe(
        finalize(() => {
          this.ngZone.run(() => {
            this.isSearching = false;
            this.cdr.markForCheck();
          });
        })
      )
      .subscribe({
        next: (comptes) => {
          this.ngZone.run(() => {
            this.selectedDestinataireComptes = Array.isArray(comptes) ? comptes : [];

            if (this.selectedDestinataireComptes.length > 0) {
              this.form.patchValue({
                compteDestination: this.selectedDestinataireComptes[0].id
              });
            } else {
              this.errorMessage = 'Aucun compte actif trouvé pour ce destinataire';
            }
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          console.error('Erreur lors du chargement des comptes du destinataire:', err);
          this.ngZone.run(() => {
            this.errorMessage = 'Impossible de charger les comptes du destinataire';
            this.selectedDestinataireComptes = [];
          });
        }
      });
  }

  /**
   * Sélectionne un destinataire pour le virement
   */
  selectDestinataireVirement(client: Client) {
    this.isSearching = true;
    this.errorMessage = '';

    this.accountService.searchComptesForTransfer(client.email)
      .pipe(
        finalize(() => {
          this.ngZone.run(() => {
            this.isSearching = false;
            this.cdr.markForCheck();
          });
        })
      )
      .subscribe({
        next: (comptes) => {
          this.ngZone.run(() => {
            this.selectedDestinataireComptes = Array.isArray(comptes) ? comptes : [];

            if (this.selectedDestinataireComptes.length > 0) {
              this.form.patchValue({
                compteVirementDestination: this.selectedDestinataireComptes[0].id
              });
            } else {
              this.errorMessage = 'Aucun compte actif trouvé pour ce destinataire';
            }
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          console.error('Erreur lors du chargement des comptes du destinataire:', err);
          this.ngZone.run(() => {
            this.errorMessage = 'Impossible de charger les comptes du destinataire';
            this.selectedDestinataireComptes = [];
          });
        }
      });
  }

  setAmount(value: number) {
    const current = Number(this.form.get('montant')?.value) || 0;
    const next = value === 0 ? 0 : current + value;
    this.form.patchValue({ montant: next });
  }

  setRetraitAmount(value: number) {
    const current = Number(this.form.get('montantRetrait')?.value) || 0;
    const next = value === 0 ? 0 : current + value;
    this.form.patchValue({ montantRetrait: next });
  }

  setVirementAmount(value: number) {
    const current = Number(this.form.get('montantVirement')?.value) || 0;
    const next = value === 0 ? 0 : current + value;
    this.form.patchValue({ montantVirement: next });
  }

  close() {
    this._dialogRef.close();
  }

  confirmDepot() {
    this.form.get('compteDestination')?.markAsTouched();
    this.form.get('montant')?.markAsTouched();

    if (this.form.get('compteDestination')?.invalid || this.form.get('montant')?.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs requis';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const compteDestinationId = String(this.form.value.compteDestination);
    const montant = Number(this.form.value.montant);

    this.transactionService.depot(compteDestinationId, montant)
      .pipe(
        finalize(() => {
          this.ngZone.run(() => {
            this.isSaving = false;
            this.cdr.markForCheck();
          });
        })
      )
      .subscribe({
        next: (result) => {
          this.ngZone.run(() => {
            console.log('Dépôt réussi:', result);
            const payload: TransactionResult = {
              type: 'depot',
              payload: { compteDestinationId, montant }
            };
            this._dialogRef.close();
          });
        },
        error: (err) => {
          console.error('Erreur lors du dépôt:', err);
          this.ngZone.run(() => {
            this.errorMessage = err?.message || 'Erreur lors du dépôt. Veuillez réessayer.';
          });
        }
      });
  }

  confirmRetrait() {
    this.form.get('compteRetrait')?.markAsTouched();
    this.form.get('montantRetrait')?.markAsTouched();

    if (this.form.get('compteRetrait')?.invalid || this.form.get('montantRetrait')?.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs requis';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const compteSourceId = String(this.form.value.compteRetrait);
    const montant = Number(this.form.value.montantRetrait);

    this.transactionService.retrait(compteSourceId, montant)
      .pipe(
        finalize(() => {
          this.ngZone.run(() => {
            this.isSaving = false;
            this.cdr.markForCheck();
          });
        })
      )
      .subscribe({
        next: (result) => {
          this.ngZone.run(() => {
            console.log('Retrait réussi:', result);
            const payload: TransactionResult = {
              type: 'retrait',
              payload: { compteSourceId, montant }
            };
            this._dialogRef.close();
          });
        },
        error: (err) => {
          console.error('Erreur lors du retrait:', err);
          this.ngZone.run(() => {
            this.errorMessage = err?.message || 'Erreur lors du retrait. Veuillez réessayer.';
          });
        }
      });
  }

  confirmVirement() {
    this.form.get('compteVirementSource')?.markAsTouched();
    this.form.get('compteVirementDestination')?.markAsTouched();
    this.form.get('montantVirement')?.markAsTouched();

    if (
      this.form.get('compteVirementSource')?.invalid ||
      this.form.get('compteVirementDestination')?.invalid ||
      this.form.get('montantVirement')?.invalid
    ) {
      this.errorMessage = 'Veuillez remplir tous les champs requis';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const source = String(this.form.value.compteVirementSource);
    const destination = String(this.form.value.compteVirementDestination);
    const montant = Number(this.form.value.montantVirement);

    this.transactionService.virement(source, destination, montant)
      .pipe(
        finalize(() => {
          this.ngZone.run(() => {
            this.isSaving = false;
            this.cdr.markForCheck();
          });
        })
      )
      .subscribe({
        next: (result) => {
          this.ngZone.run(() => {
            console.log('Virement réussi:', result);
            const payload: TransactionResult = {
              type: 'virement',
              payload: { source, destination, montant }
            };
            this._dialogRef.close();
          });
        },
        error: (err) => {
          console.error('Erreur lors du virement:', err);
          this.ngZone.run(() => {
            this.errorMessage = err?.message || 'Erreur lors du virement. Veuillez réessayer.';
          });
        }
      });
  }

  /**
   * Formate l'affichage d'un compte
   */
  formatCompte(compte: Compte | ComptePublicInfo): string {
    if ('solde' in compte && compte.solde !== undefined) {
      // C'est un Compte complet (mes comptes)
      return `${compte.libelle || compte.typeCompte} - ${compte.numero} (${this.formatMontant(compte.solde)} FCFA)`;
    } else {
      // C'est un ComptePublicInfo (comptes des autres)
      const info = compte as ComptePublicInfo;
      return `${info.libelle || info.typeCompte} - ${info.numero}`;
    }
  }

  formatClient(client: Client): string {
    return `${client.prenom} ${client.nom} - ${client.email}`;
  }

  /**
   * Formate un montant avec séparateurs de milliers
   */
  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant);
  }

  /**
   * Vérifie si mes comptes sont chargés
   */
  get hasMyAccounts(): boolean {
    return this.myAccounts.length > 0;
  }

  /**
   * Vérifie si des comptes destinataires sont sélectionnés
   */
  get hasDestinataireAccounts(): boolean {
    return this.selectedDestinataireComptes.length > 0;
  }
}
