import {Component, inject,ViewContainerRef} from '@angular/core';
import {HlmButton} from '@spartan-ng/helm/button';
import {LucideAngularModule} from 'lucide-angular';
import {BrnSelect} from '@spartan-ng/brain/select';
import {HlmCard, HlmCardContent, HlmCardImports} from '@spartan-ng/helm/card';
import {HlmInput} from '@spartan-ng/helm/input';
import {HlmLabel} from '@spartan-ng/helm/label';
import {HlmBadgeImports} from '@spartan-ng/helm/badge';
import {BrnSelectImports} from '@spartan-ng/brain/select';
import {HlmSelectImports} from '@spartan-ng/helm/select';
import {AddCompte} from '../../shared/components/add-compte/add-compte';
import {BrnDialogService} from '@spartan-ng/brain/dialog';


@Component({
  selector: 'app-comptes',
  standalone:true,
  imports: [
    HlmButton,
    LucideAngularModule,
    HlmCard,
    HlmCardContent,
    HlmCardImports,
    HlmBadgeImports,
    BrnSelectImports,
  ],
  templateUrl: './comptes.html',
})
export class Comptes {

  private _dialogService = inject(BrnDialogService);
  private _vcr = inject(ViewContainerRef);
  openAddCompte() {
    const dialogRef = this._dialogService.open(AddCompte);


    dialogRef.closed$.subscribe((result) => {
      console.log('Le dialogue est fermé', result);
    });
  }

}
