import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProfileComponent } from './features/profile/profile.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, title: 'Real-time Dashboard | Platform' },
  { path: 'profile', component: ProfileComponent, title: 'Profile Management | Platform' },
  { path: '**', redirectTo: 'dashboard' },
];
