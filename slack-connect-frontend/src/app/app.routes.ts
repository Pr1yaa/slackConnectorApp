import { Routes } from '@angular/router';
import { InstallComponent } from './install.component';
import { CallbackComponent } from './callback.component';
import { ComposeComponent } from './compose.component';
import { ScheduledListComponent } from './scheduled-list.component';

export const AppRoutes: Routes = [
  { path: '', redirectTo: 'compose', pathMatch: 'full' },
  { path: 'install', component: InstallComponent },
  { path: 'auth/callback', component: CallbackComponent },
  { path: 'compose', component: ComposeComponent },
  { path: 'scheduled', component: ScheduledListComponent }
];
