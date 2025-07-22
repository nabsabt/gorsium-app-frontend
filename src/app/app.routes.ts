import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./@Component/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'map',
    loadComponent: () =>
      import('./@Component/map/map.component').then((m) => m.MapComponent),
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
