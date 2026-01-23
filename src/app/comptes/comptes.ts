import {ChangeDetectorRef, Component, inject, NgZone, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HlmButton} from '@spartan-ng/helm/button';
import {LucideAngularModule} from 'lucide-angular';
import {HlmCard, HlmCardContent, HlmCardImports} from '@spartan-ng/helm/card';
import {HlmBadgeImports} from '@spartan-ng/helm/badge';
import {AddCompte} from '../shared/components/add-compte/add-compte';
import {BrnDialogService} from '@spartan-ng/brain/dialog';
import {AccountService,Compte} from '../services/account';
import {AuthService} from '../services/auth';
import {Router} from '@angular/router';
import {finalize} from 'rxjs/operators';
import {Role} from '../types/user.type';


@Component({
  selector: 'app-comptes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
  filteredComptes: Compte[] = [];
  isLoading = false;
  errorMessage = '';

  // Filtres
  searchTerm = '';
  selectedTypeCompte = '';
  sortBy: 'solde' | 'date' | 'numero' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Pagination
  currentPage = 1;
  itemsPerPage = 9;
  paginatedComptes: Compte[] = [];

  isAdmin(): boolean {
    return this.authService.hasRole([Role.ADMIN, Role.SUPER_ADMIN, Role.AGENT_ADMIN]);
  }

  ngOnInit() {
    this.loadComptes();
  }

  loadComptes() {
    this.isLoading = true;
    this.errorMessage = '';

    this.accountService.getComptes()
      .pipe(finalize(() => {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        });
      }))
      .subscribe({
        next: (comptes) => {
          this.ngZone.run(() => {
            this.comptes = Array.isArray(comptes) ? comptes : [];
            this.applyFilters();
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

  applyFilters() {
    let filtered = [...this.comptes];

    // Filtre par recherche (numero, proprietaire)
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(compte =>
        compte.numero.toLowerCase().includes(term) ||
        (compte.proprietaire?.nom?.toLowerCase().includes(term)) ||
        (compte.proprietaire?.prenom?.toLowerCase().includes(term)) ||
        (compte.proprietaire?.identifiant?.toLowerCase().includes(term))
      );
    }

    // Filtre par type de compte
    if (this.selectedTypeCompte) {
      filtered = filtered.filter(compte => compte.typeCompte === this.selectedTypeCompte);
    }

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy) {
        case 'solde':
          comparison = a.solde - b.solde;
          break;
        case 'date':
          comparison = new Date(a.dateCreation).getTime() - new Date(b.dateCreation).getTime();
          break;
        case 'numero':
          comparison = a.numero.localeCompare(b.numero);
          break;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    this.filteredComptes = filtered;
  }

  onSearchChange() {
    this.applyFilters();
  }

  onTypeCompteChange() {
    this.applyFilters();
  }

  onSortChange() {
    this.applyFilters();
  }

  toggleSortOrder() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedTypeCompte = '';
    this.sortBy = 'date';
    this.sortOrder = 'desc';
    this.applyFilters();
  }

  updatePaginatedComptes() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedComptes = this.filteredComptes.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredComptes.length / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({length: this.totalPages}, (_, i) => i + 1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedComptes();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedComptes();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedComptes();
    }
  }

  get totalComptes(): number {
    return this.filteredComptes.length;
  }

  get soldeTotal(): number {
    if (!this.isAdmin()) return 0;
    return this.filteredComptes.reduce((sum, compte) => sum + compte.solde, 0);
  }

  get moyenneSolde(): number {
    if (this.filteredComptes.length === 0) return 0;
    return this.soldeTotal / this.filteredComptes.length;
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
