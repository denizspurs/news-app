import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SearchComponent } from './search/search.component';
import { CategoriesComponent } from './categories/categories.component';
import { AboutComponent } from './about/about.component';

export const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent,
    title: 'Ana Sayfa'
  },
  { 
    path: 'arama', 
    component: SearchComponent,
    title: 'Arama'
  },
  { 
    path: 'kategoriler', 
    component: CategoriesComponent,
    title: 'Kategoriler'
  },
  { 
    path: 'hakkimda', 
    component: AboutComponent,
    title: 'Hakkımda'
  }
];
