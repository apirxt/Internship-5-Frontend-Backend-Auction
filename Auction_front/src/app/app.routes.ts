import { Routes } from '@angular/router';
import { AuctionCreateComponent } from './presentation/auction-create/auction-create.component';
import { AuctionListComponent } from './presentation/auction-list/auction-list.component';
import { AuctionDetailComponent } from './presentation/auction-detail/auction-detail.component';

export const routes: Routes = [
    { path: '', redirectTo: '/auction/list', pathMatch: 'full' },
    { path: 'auction/list', component: AuctionListComponent },
    { path: 'auction/detail/:id', component: AuctionDetailComponent },
    { path: 'auction/create', component: AuctionCreateComponent },
    { path: '**', redirectTo: '/auction/list' }
];
