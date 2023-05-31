import { Routes, Route } from '@angular/router';

export const routes: Routes = [
    { path: '', loadChildren: './examples/index#DemoDndModule' },
];
