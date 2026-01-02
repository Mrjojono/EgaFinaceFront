import {Component, signal} from '@angular/core';
import {HlmCardImports} from '@spartan-ng/helm/card';
import {LucideAngularModule} from 'lucide-angular';
import {HlmButtonImports} from '@spartan-ng/helm/button';

enum Etat {
  Actifs = "Actifs",
  Suspendu = "Suspendu"
}


type Account = {
  id: number;
  type: string;
  etat: string;
  solde: string;
  Iban: string
}

@Component({
  selector: 'app-home',
  imports: [HlmCardImports, LucideAngularModule, HlmButtonImports],
  templateUrl: './home.html',
})
export class Home {

  clickAccount = signal<Account>(
    {
      id: 1,
      type: "Compte courant",
      etat: "Actif",
      solde: "2500023",
      Iban: "FR76 3000 6000 0123 4567 8901 234"
    }
  )

  protected readonly Accounts: Account[] = [
    {
      id: 1,
      type: "Compte courant",
      etat: "Actif",
      solde: "2500023",
      Iban: "FR76 3000 6000 0123 4567 8901 234"
    }
  ]

  setClickAccount(id:number){
      this.Accounts.map((item)=>{
        if (item.id === id){
          this.clickAccount.set(item)
        }
      })
  }


}
