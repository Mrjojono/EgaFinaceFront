import {ApplicationConfig, importProvidersFrom, inject} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideHttpClient, withInterceptors, HttpInterceptorFn} from '@angular/common/http';
import {InMemoryCache} from '@apollo/client/core';
import {provideApollo} from 'apollo-angular';
import {HttpLink} from 'apollo-angular/http';
import {provideAnimations} from '@angular/platform-browser/animations';

import {routes} from './app.routes';
import {
  LucideAngularModule,
  Home,
  User,
  Settings,
  LogOut,
  Menu,
  Wallet,
  Settings2,
  UserCheck,
  CreditCard,
  Landmark,
  ArrowRight,
  ChevronDown,
  Search,
  Copy,
  Plus,
  ChevronRight,
  Download,
  SendHorizontal,
  ArrowLeftToLine,
  ArrowRightLeft,
  ChevronLeft,
  ArrowUpRight,
  Smartphone,
  Waves
} from 'lucide-angular';

// Creation d'un intercepteur
const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }
  return next(req);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor])),
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
        UserCheck, Plus, CreditCard, Landmark, Search, Copy, ChevronRight, Download,
        SendHorizontal, ArrowLeftToLine, ArrowRightLeft, ChevronLeft, ArrowUpRight, ArrowRight, ChevronDown,
        Smartphone, Waves
      })
    )
  ],
};
