import { Route } from '@angular/router';
import { openIaApiGuard } from './guards/openia-api.guard';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'guess-word',
  },
  {
    path: 'guess-word',
    canActivate: [openIaApiGuard],
    loadComponent: () =>
      import('@binance/guess-word').then((m) => m.GuessWordComponent),
  },
  {
    path: 'api-key',
    loadComponent: () =>
      import('./components/api-key/api-key.component').then(
        (m) => m.ApiKeyComponent
      ),
  },
];
