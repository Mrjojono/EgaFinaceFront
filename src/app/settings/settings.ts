import {Component, inject, signal} from '@angular/core';
import {BrnSelect, BrnSelectImports} from '@spartan-ng/brain/select';
import {HlmButton, HlmButtonImports} from '@spartan-ng/helm/button';
import {HlmSelectImports} from '@spartan-ng/helm/select';
import {HlmTabs, HlmTabsContent, HlmTabsList, HlmTabsTrigger} from '@spartan-ng/helm/tabs';
import {LucideAngularModule} from 'lucide-angular';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {HlmInputImports} from '@spartan-ng/helm/input';
import {HlmLabel} from '@spartan-ng/helm/label';
import {toast} from 'ngx-sonner';
import {Nationality} from '../types/user.type';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-settings',
  imports: [
    HlmTabs,
    HlmTabsContent,
    HlmTabsList,
    HlmTabsTrigger,
    LucideAngularModule,
    ReactiveFormsModule,
    HlmInputImports,
    HlmButtonImports,
    HlmLabel,
    HlmSelectImports,
    BrnSelectImports,
    BrnSelect,
  ],
  templateUrl: './settings.html',
})
export class Settings {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);


  ngOnInit() {
    this.loadNationalities();
    this.loadMe();
  }

  private loadMe(): void {
    this.authService.getMe().subscribe({
      next: (result: any) => {
        const user = result.data.me;

        this.form.patchValue({
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          phone: user.telephone,
          address: user.adresse,
          nationalite: user.nationalite,
        });
      },
      error: (err) => {
        console.error(err);
        toast.error('Erreur', {
          description: 'Impossible de charger les informations utilisateur',
          duration: 4000
        });
      }
    });
  }

  nationalites = signal<Nationality[]>([]);

  form = this.fb.group({
    CompteSource: ['', [Validators.required]],
    CompteDestination: ['', [Validators.required]],
    montant: [0, [Validators.required, Validators.min(0)]],
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    address: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    nationalite:['', Validators.required],
    adresse: ['', Validators.required],
  });


  constructor() {
    this.loadNationalities();
  }

  /**
   * Charge la liste des nationalités depuis l'API REST Countries
   */
  private loadNationalities(): void {
    fetch('https://restcountries.com/v3.1/all?fields=name,flags')
      .then(res => res.json())
      .then(data => {
        const mapped: Nationality[] = data
          .map((c: any) => ({
            name: c.name.common,
            flag: c.flags.svg
          }))
          .sort((a: Nationality, b: Nationality) => a.name.localeCompare(b.name));

        this.nationalites.set(mapped);
      })
      .catch(error => {
        console.error('Erreur lors du chargement des nationalités:', error);
        toast.error('Erreur', {
          description: 'Impossible de charger la liste des pays.',
          duration: 4000
        });
      });
  }
}
