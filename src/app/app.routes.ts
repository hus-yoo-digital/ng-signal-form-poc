import { Routes } from '@angular/router';
import { NewSignalFormComponent } from './new-signal-form/new-signal-form.component';
import { OldReactiveFormComponent } from './old-reactive-form/old-reactive-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/old-reactive', pathMatch: 'full' },
  { path: 'old-reactive', component: OldReactiveFormComponent },
  { path: 'new-signal', component: NewSignalFormComponent },
];
