import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/pokedex/pokedex-catalog/pokedex-catalog.component').then(
        (module) => module.PokedexCatalogComponent,
      ),
  },
  { path: 'pokedex', pathMatch: 'full', redirectTo: '' },
  { path: '**', redirectTo: '' },
];
