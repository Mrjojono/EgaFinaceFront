import {Component, input} from '@angular/core';


import {HlmInputImports} from '@spartan-ng/helm/input';
import {HlmLabelImports} from '@spartan-ng/helm/label';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [HlmInputImports, HlmLabelImports, RouterLink],
  templateUrl: './auth.html',
})
export class Auth {

}
