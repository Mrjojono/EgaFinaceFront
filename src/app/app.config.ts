import { ApplicationConfig, importProvidersFrom, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { InMemoryCache } from '@apollo/client/core';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

import { routes } from './app.routes';
import {
  LucideAngularModule,
  Home, User, Settings, LogOut, Menu, Wallet, Settings2, UserCheck, CreditCard, Landmark,
  Search, Copy, Plus, ChevronRight
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(routes),

    provideApollo(() => {
      const httpLink = inject(HttpLink);
      return {
        link: httpLink.create({
          uri: 'http://localhost:8080/graphql',
        }),
        cache: new InMemoryCache(),
      };
    }),
    importProvidersFrom(
      LucideAngularModule.pick({
        Home, User, Settings, LogOut, Menu, Wallet, Settings2,
        UserCheck, Plus, CreditCard, Landmark, Search, Copy, ChevronRight
      })
    )
  ],
};
