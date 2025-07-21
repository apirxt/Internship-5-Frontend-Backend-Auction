import { Routes } from '@angular/router';
import { AuctionCreateComponent } from './presentation/auction-create/auction-create.component';

export const routes: Routes = [
    { path: '', redirectTo: '/auction/create', pathMatch: 'full' },
    { path: 'auction/create', component: AuctionCreateComponent },
    { path: '**', redirectTo: '/auction/create' }
];
