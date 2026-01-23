import {ApplicationConfig, importProvidersFrom, inject} from '@angular/core';
import {provideRouter} from '@angular/router';
import {HttpInterceptorFn, provideHttpClient, withInterceptors} from '@angular/common/http';
import {InMemoryCache} from '@apollo/client/core';
import {provideApollo} from 'apollo-angular';
import {HttpLink} from 'apollo-angular/http';
import {provideAnimations} from '@angular/platform-browser/animations';

import {routes} from './app.routes';
import {
  AlertCircle,
  AlertCircleIcon,
  AlertTriangle,
  ArrowLeftToLine,
  ArrowRight,
  ArrowRightLeft,
  ArrowUpRight,
  BarChart2,
  Bell,
  Briefcase,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  Download,
  Edit2,
  Globe,
  HelpCircle,
  Home,
  Info,
  Key,
  Landmark,
  Loader2,
  Lock,
  LogOut,
  LucideAngularModule,
  Mail,
  MapPin,
  Megaphone,
  Menu,
  PauseCircle,
  Phone,
  PiggyBank,
  Plus,
  RefreshCw,
  Save,
  Search,
  SendHorizontal,
  Settings,
  Settings2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
  Wallet2,
  Waves,
  TrendingUp,
  Layers,
  ArrowUp,
  SearchX,
  ArrowDown,
  X,
  BarChart,
  Pencil,
  ArrowLeft,
  Check,
  Sun,
  Moon,
  TrendingDown
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
        Smartphone, Waves, Loader2, UserPlus, AlertCircle, BarChart2, RefreshCw, Trash2,
        Edit2,
        AlertCircleIcon,
        Wallet2,
        PiggyBank,
        Briefcase,
        Shield, Bell,
        AlertTriangle,
        Users,
        Mail,
        MapPin,
        Phone,
        Info,
        Save,
        Lock,
        Key,
        CheckCircle,
        ShieldCheck,
        Globe,
        ShieldAlert,
        Megaphone,
        PauseCircle,
        HelpCircle,
        TrendingUp,
        Layers,
        ArrowUp,
        SearchX,
        ArrowDown,
        X,
        BarChart,
        Pencil,
        ArrowLeft,
        Check,
        Sun,
        Moon,
        TrendingDown
      })
    )
  ],
};
