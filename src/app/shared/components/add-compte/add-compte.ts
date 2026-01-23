import {Component, inject, ChangeDetectorRef, OnInit} from '@angular/core';
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
import {ClientsService, Client} from '../../../services/client';
import {CommonModule} from '@angular/common';
import {HlmSpinnerImports} from '@spartan-ng/helm/spinner';
import {Role} from '../../../types/user.type';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-add-compte',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
export class AddCompte implements OnInit {

  private accountService = inject(AccountService);
  private authService = inject(AuthService);
  private clientsService = inject(ClientsService);
  private _dialogRef = inject<BrnDialogRef<AddCompte>>(BrnDialogRef);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  // États de gestion
  isLoading = false;
  isLoadingClients = false;
  errorMessage = '';
  successMessage = '';

  // Clients pour admin
  clients: Client[] = [];
  filteredClients: Client[] = [];
  searchClientTerm = '';
  showClientDropdown = false;
  selectedClient: Client | null = null;

  form = this.fb.group({
    libelle: ['', [Validators.required, Validators.minLength(3)]],
    typeCompte: ['', [Validators.required]],
    solde: [0, [Validators.required, Validators.min(0)]],
    proprietaireId: ['']
  });

  ngOnInit() {
    if (this.isAdmin()) {
      this.loadClients();
      this.form.get('proprietaireId')?.setValidators([Validators.required]);
      this.form.get('proprietaireId')?.updateValueAndValidity();
    } else {
      const clientId = this.authService.getCurrentUserId();
      this.form.patchValue({ proprietaireId: clientId || '' });
    }
  }

  isAdmin(): boolean {
    return this.authService.hasRole([Role.ADMIN, Role.SUPER_ADMIN, Role.AGENT_ADMIN]);
  }

  loadClients() {
    this.isLoadingClients = true;
    this.clientsService.getClients(1, 1000).subscribe({
      next: (clients) => {
        this.clients = clients;
        this.filteredClients = clients;
        this.isLoadingClients = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement clients:', err);
        this.isLoadingClients = false;
        this.errorMessage = 'Impossible de charger la liste des clients';
        this.cdr.detectChanges();
      }
    });
  }

  onSearchClient() {
    const term = this.searchClientTerm.toLowerCase().trim();
    if (!term) {
      this.filteredClients = this.clients;
    } else {
      this.filteredClients = this.clients.filter(client =>
        client.nom.toLowerCase().includes(term) ||
        client.prenom.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term) ||
        client.identifiant?.toLowerCase().includes(term)
      );
    }
    this.showClientDropdown = true;
  }

  selectClient(client: Client) {
    this.selectedClient = client;
    this.searchClientTerm = `${client.nom} ${client.prenom}`;
    this.form.patchValue({ proprietaireId: client.id });
    this.showClientDropdown = false;
  }

  clearClientSelection() {
    this.selectedClient = null;
    this.searchClientTerm = '';
    this.form.patchValue({ proprietaireId: '' });
    this.filteredClients = this.clients;
  }

  close() {
    this._dialogRef.close();
  }

  save() {
    if (this.form.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const {libelle, typeCompte, solde, proprietaireId} = this.form.value;

      if (!proprietaireId) {
        this.errorMessage = "Impossible de trouver l'ID du propriétaire";
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }

      this.accountService.createAccount(
        typeCompte as string,
        solde as number,
        proprietaireId as string,
        libelle as string
      ).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Compte créé avec succès !';
          this.cdr.detectChanges();

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
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }
}
