import {Component, inject, signal} from '@angular/core';
import {HlmInputImports} from '@spartan-ng/helm/input';
import {HlmLabelImports} from '@spartan-ng/helm/label';
import {HlmButtonImports} from '@spartan-ng/helm/button';
import {BrnSelect, BrnSelectImports} from '@spartan-ng/brain/select';
import {HlmSelectImports} from '@spartan-ng/helm/select';
import {RouterLink} from '@angular/router';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {email} from '@angular/forms/signals';

enum StepEnum {
  Email = 'email',
  Username = 'username',
  Password = 'password',
  Nationalite = 'nationalite',
}

type Nationality = {
  code: string;
  name: string;
  flag: string;
};


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [HlmInputImports, HlmLabelImports, HlmButtonImports, BrnSelectImports, HlmSelectImports, BrnSelect, RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
})
export class Register {

  private fb = inject(FormBuilder);
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    nationalite: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor() {
    fetch('https://restcountries.com/v3.1/all?fields=name,flags')
      .then(res => res.json()).then(data => {
      const mapped = data.map((c: any) => ({
        name: c.name.common,
        flag: c.flags.svg
      }));
      this.nationalites.set(mapped);
    });
  }

  nationalites = signal<Nationality[]>([]);
  steps = signal<StepEnum>(StepEnum.Email);

  goToStep(step: StepEnum) {
    this.steps.set(step);
  }

  onSubmit() {
    if (this.form.invalid) return;

    console.log(this.form.value);
  }


  protected readonly StepEnum = StepEnum;

}
