import {Component, inject, input, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {HlmInputImports} from '@spartan-ng/helm/input';
import {HlmLabelImports} from '@spartan-ng/helm/label';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../services/auth';
import {HlmButtonImports} from '@spartan-ng/helm/button';
import {HlmSpinnerImports} from '@spartan-ng/helm/spinner';
import {toast} from 'ngx-sonner';
import {HlmToasterImports} from '@spartan-ng/helm/sonner';

@Component({
  selector: 'app-auth',
  imports: [HlmInputImports, HlmLabelImports,
    RouterLink, ReactiveFormsModule,
    HlmButtonImports, HlmSpinnerImports,
    HlmToasterImports
  ],
  templateUrl: './auth.html',
})
export class Auth {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);


  isLoading = signal(false);
  errorMessage = signal<string | null>(null);


  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  })


  onSubmit() {
    if (this.form.valid) {
      const {email, password} = this.form.getRawValue();

      this.isLoading.set(true);
      this.errorMessage.set(null);
      this.authService.login(email, password).subscribe({
        next: (res) => {
          console.log("Connexion reussi");
          this.router.navigate(['/dashboard/home']).then(r => (""));
        },

        error: (error) => {
          this.isLoading.set(false);
          let msg = "Une erreur est survenue";
          if (error.graphQLErrors && error.graphQLErrors.length > 0) {
            msg = error.graphQLErrors[0].message;
          } else if (error.networkError) {
            msg = "Le serveur est injoignable.";
          } else {
            msg = error.message || msg;
          }
          this.errorMessage.set(msg);
          toast.error('Erreur de connexion', {
            description: msg,
            duration: 5000,
            closeButton: true
          });
        }
      })
    } else {
      console.log("formulaire invalide")
    }

  }


}
