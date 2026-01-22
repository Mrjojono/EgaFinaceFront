import {Component, inject, signal, computed, OnInit, ViewContainerRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HlmButton} from '@spartan-ng/helm/button';
import {LucideAngularModule} from 'lucide-angular';
import {HlmCard, HlmCardContent} from '@spartan-ng/helm/card';
import {HlmLabel} from '@spartan-ng/helm/label';
import {HlmInput} from '@spartan-ng/helm/input';
import {HlmTableImports} from '@spartan-ng/helm/table';
import {ClientsService, Client} from '../services/client';
import {DecimalPipe} from '@angular/common';
import {BrnDialogService} from '@spartan-ng/brain/dialog';
import {AddClientComponent} from '../shared/components/add-clients/add-client';

type SortColumn = 'id' | 'nom' | 'prenom' | 'email' | 'telephone';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule,
    HlmButton,
    LucideAngularModule,
    HlmCard,
    HlmCardContent,
    HlmLabel,
    HlmInput,
    HlmTableImports,
  ],
  templateUrl: './clients.html'
})
export class ClientsComponent implements OnInit {
  private clientsService = inject(ClientsService);

  // state
  protected clients = signal<Client[]>([]);
  protected isLoading = signal(false);
  protected errorMessage = signal<string | null>(null);

  // pagination server-side
  protected page = signal(1);
  protected size = signal(10);
  protected totalPages = signal(1); // approximative unless API returns count

  // local filtering & sorting (applied to current page data)
  protected searchTerm = signal('');
  protected sortColumn = signal<SortColumn>('nom');
  protected sortDirection = signal<'asc' | 'desc'>('asc');

  // derived list after search & sort
  protected filteredClients = computed(() => {
    const q = this.searchTerm().trim().toLowerCase();
    let arr = this.clients().slice();

    if (q) {
      arr = arr.filter(c =>
        `${c.nom} ${c.prenom} ${c.email} ${c.telephone} ${c.identifiant}`.toLowerCase().includes(q)
      );
    }

    const col = this.sortColumn();
    const dir = this.sortDirection();
    arr.sort((a, b) => {
      const aVal = String((a as any)[col] ?? '').toLowerCase();
      const bVal = String((b as any)[col] ?? '').toLowerCase();
      const res = aVal.localeCompare(bVal, 'fr', {numeric: true, sensitivity: 'base'});
      return dir === 'asc' ? res : -res;
    });

    return arr;
  });

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(page: number = this.page()) {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.clientsService.getClients(page, this.size()).subscribe({
      next: (items) => {
        this.clients.set(items);
        this.isLoading.set(false);
        // If fewer items than size and page > 1, we might adjust totalPages conservatively
        this.totalPages.set(Math.max(1, Math.ceil((items.length ? items.length : 0) / this.size())));
        // keep page signal consistent
        this.page.set(page);
      },
      error: (err) => {
        console.error('Erreur loadClients', err);
        this.errorMessage.set('Erreur lors du chargement des clients');
        this.isLoading.set(false);
      }
    });
  }

  // ... dans la classe ClientsComponent
  private _dialogService = inject(BrnDialogService);
  private _vcr = inject(ViewContainerRef);

  openCreateClient() {
    const dialogRef = this._dialogService.open(AddClientComponent);
    dialogRef.closed$.subscribe((result: any) => {
      // result contient { client, tempPassword } si succès, ou undefined si annulé
      if (result && result.client) {
        // recharge la liste des clients
        this.loadClients(1);

        // Optionnel: afficher le mot de passe temporaire à l'opérateur (copie/can copy)
        const temp = result.tempPassword;
        if (temp) {
          // Utilise ton système de notification/alert. Exemple basique :
          alert(`Client créé. Mot de passe temporaire : ${temp}\nCommuniquez ce mot de passe via un canal sécurisé.`);
        }
      }
    });
  }

  // edit client (simple prompt fallback)
  openEditClient(client: Client) {
    const nom = prompt('Nom', client.nom) ?? client.nom;
    const prenom = prompt('Prénom', client.prenom) ?? client.prenom;
    const email = prompt('Email', client.email ?? '') ?? (client.email ?? '');
    const telephone = prompt('Téléphone', client.telephone ?? '') ?? (client.telephone ?? '');

    this.isLoading.set(true);
    this.clientsService.updateClient(client.id, {nom, prenom, email, telephone}).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.loadClients(this.page());
      },
      error: (err) => {
        console.error('Erreur updateClient', err);
        this.isLoading.set(false);
        this.errorMessage.set('Impossible de modifier le client');
      }
    });
  }

  confirmAndDelete(client: Client) {
    const ok = confirm(`Supprimer le client ${client.nom} ${client.prenom} ? Cette opération est irréversible.`);
    if (!ok) return;

    this.isLoading.set(true);
    this.clientsService.deleteClient(client.id).subscribe({
      next: () => {
        this.isLoading.set(false);
        // reload current page
        this.loadClients(this.page());
      },
      error: (err) => {
        console.error('Erreur deleteClient', err);
        this.isLoading.set(false);
        this.errorMessage.set('Impossible de supprimer le client');
      }
    });
  }

  setSearchTerm(v: string) {
    this.searchTerm.set(v ?? '');
  }

  sort(column: SortColumn) {
    if (this.sortColumn() === column) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  prevPage() {
    if (this.page() > 1) {
      this.loadClients(this.page() - 1);
    }
  }

  nextPage() {
    // naive next page, API may return empty page -> you can check length and avoid increment
    this.loadClients(this.page() + 1);
  }

  trackById(index: number, item: Client) {
    return item.id;
  }
}
