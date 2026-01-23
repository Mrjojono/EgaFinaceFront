import {Component, inject, signal} from '@angular/core';
import {HlmInputImports} from '@spartan-ng/helm/input';
import {HlmLabelImports} from '@spartan-ng/helm/label';
import {HlmButtonImports} from '@spartan-ng/helm/button';
import {BrnSelect, BrnSelectImports} from '@spartan-ng/brain/select';
import {HlmSelectImports} from '@spartan-ng/helm/select';
import {Router, RouterLink} from '@angular/router';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {LucideAngularModule} from 'lucide-angular';
import {Activation} from '../../services/activation';
import {toast} from 'ngx-sonner';
import {AuthService} from '../../services/auth';
import {CommonModule} from '@angular/common';
import {HlmToaster} from '@spartan-ng/helm/sonner';
import {Nationality, Sexe} from '../../types/user.type';



 enum StepEnum {
  Email = 'email',
  Username = 'username',
  Sexe = 'sexe',
  Nationalite = 'nationalite',
  Password = 'password',
  initiale = 'initiale',
  activation = 'activation'
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    HlmInputImports,
    HlmLabelImports,
    HlmButtonImports,
    BrnSelectImports,
    HlmSelectImports,
    BrnSelect,
    RouterLink,
    ReactiveFormsModule,
    LucideAngularModule,
    CommonModule,
    HlmToaster
  ],
  templateUrl: './register.html',
})
export class Register {

  private fb = inject(FormBuilder);
  private activationService = inject(Activation);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Signals
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  nationalites = signal<Nationality[]>([]);
  steps = signal<StepEnum>(StepEnum.initiale);


  readonly sexeOptions = [
    {value: Sexe.HOMME, label: 'Homme', icon: 'user'},
    {value: Sexe.FEMME, label: 'Femme', icon: 'user'}
  ];

  // Formulaire d'inscription (nouveau client)
  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    nom: ['', [Validators.required, Validators.minLength(2)]],
    prenom: ['', [Validators.required, Validators.minLength(2)]],
    sexe: this.fb.control<Sexe | null>(null, Validators.required),
    nationalite: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  activationForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    identifiant: ['', [Validators.required, Validators.pattern(/^CLT-[A-Z0-9]{8}$/)]], // ← Nouveau pattern
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

  /**
   * Navigation entre les étapes du formulaire
   */
  goToStep(step: StepEnum): void {
    this.errorMessage.set(null);
    this.steps.set(step);
  }

  /**
   * Sélection du sexe
   */
  selectSexe(sexe: Sexe): void {
    this.registerForm.patchValue({sexe});
    this.registerForm.get('sexe')?.markAsTouched();
  }

  /**
   * Soumission du formulaire d'inscription (nouveau client)
   */
  onSubmit(): void {

    // Marquer tous les champs comme touchés pour afficher les erreurs
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });

    if (!this.registerForm.valid) {

      toast.error('Erreur de validation', {
        description: 'Veuillez remplir correctement tous les champs requis.',
        duration: 4000
      });
      return;
    }

    const {email, password, nom, prenom, sexe, nationalite} = this.registerForm.getRawValue();

    // Double vérification
    if (!email || !password || !nom || !prenom || !sexe || !nationalite) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.register(email, password, nom, prenom, sexe, nationalite).subscribe({
      next: (res) => {

        this.isLoading.set(false);

        toast.success('Compte créé avec succès !', {
          description: 'Vous pouvez maintenant vous connecter.',
          duration: 5000
        });

        // Redirection vers la page de connexion
        this.router.navigate(['/login']).then(() => {
        });
      },

      error: (error) => {
        console.log(this.registerForm.value)
        console.log('Erreur lors de l\'inscription:', error);

        this.isLoading.set(false);
        const msg = this.extractErrorMessage(error);
        this.errorMessage.set(msg);

        toast.error('Erreur lors de l\'inscription', {
          description: msg,
          duration: 5000,
          closeButton: true
        });
      },

      complete: () => {
        console.log(' Processus d\'inscription terminé.');
      }
    });
  }

  /**
   * Soumission du formulaire d'activation (client existant)
   */
  onSubmitActivation(): void {
    // Marquer tous les champs comme touchés
    Object.keys(this.activationForm.controls).forEach(key => {
      this.activationForm.get(key)?.markAsTouched();
    });

    if (!this.activationForm.valid) {
      toast.error('Erreur de validation', {
        description: 'Veuillez remplir correctement tous les champs requis.',
        duration: 4000
      });
      return;
    }

    const {email, identifiant} = this.activationForm.getRawValue();

    if (!email || !identifiant) {
      console.error(' Email ou identifiant manquant');
      return;
    }


    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.activationService.initiateActivation(identifiant, email).subscribe({
      next: (res) => {

        this.isLoading.set(false);

        if (res?.success) {
          toast.success('Activation réussie !', {
            description: res.message || 'Vérifiez votre email pour finaliser l\'activation.',
            duration: 5000
          });
          this.router.navigate(['/login']).then(() => {
            console.log('Redirection vers /login effectuée');
          });
        } else {
          toast.warning('Attention', {
            description: 'L\'activation n\'a pas pu être complétée.',
            duration: 5000
          });
        }
      },

      error: (error) => {
        this.isLoading.set(false);

        const msg = this.extractErrorMessage(error);
        this.errorMessage.set(msg);

        toast.error('Erreur lors de l\'activation', {
          description: msg,
          duration: 5000,
          closeButton: true
        });
      }
    });
  }

  /**
   * Extrait le message d'erreur de différentes sources possibles
   */
  private extractErrorMessage(error: any): string {
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      return error.graphQLErrors[0].message;
    }

    if (error.networkError) {
      return "Le serveur est injoignable. Vérifiez votre connexion.";
    }

    return error.message || "Une erreur est survenue";
  }

  // Exposer l'enum au template
  protected readonly StepEnum = StepEnum;
  protected readonly Sexe = Sexe;
}
