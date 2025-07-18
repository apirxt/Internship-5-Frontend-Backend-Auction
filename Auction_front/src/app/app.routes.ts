import { Routes } from '@angular/router';
import { AuctionComponent } from './presentation/auction/auction.component';

export const routes: Routes = [
    { path: '', redirectTo: '/auction/create', pathMatch: 'full' },
    { path: 'auction/create', component: AuctionComponent },
    { path: '**', redirectTo: '/auction/create' }
];
