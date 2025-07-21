import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuctionService } from '../../domain/services/auction.service';
import { Auction } from '../../models/auction.model';

@Component({
  selector: 'app-auction-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auction-list.component.html',
  styleUrl: './auction-list.component.css'
})
export class AuctionListComponent implements OnInit {
  auctions: Auction[] = [];
  filteredAuctions: Auction[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;

  constructor(
    private auctionService: AuctionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAuctions();
  }

  loadAuctions(): void {
    this.isLoading = true;
    this.auctionService.getAll().subscribe({
      next: (data) => {
        this.auctions = data;
        this.filteredAuctions = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading auctions:', error);
        this.isLoading = false;
      }
    });
  }

  search(): void {
    if (!this.searchTerm.trim()) {
      this.filteredAuctions = this.auctions;
    } else {
      this.filteredAuctions = this.auctions.filter(auction =>
        auction.auctionName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        auction.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        auction.metaAuctionType?.auctionTypeName?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  createNew(): void {
    this.router.navigate(['/auction/create']);
  }

  viewDetails(id: number): void {
    this.router.navigate(['/auction/detail', id]);
  }

  editAuction(id: number): void {
    // Navigate to edit form
    console.log('Edit auction ID:', id);
  }

  deleteAuction(id: number): void {
    if (confirm('คุณต้องการลบประมูลนี้หรือไม่?')) {
      this.auctionService.delete(id).subscribe({
        next: () => {
          this.loadAuctions(); // Reload data after deletion
          console.log('Auction deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting auction:', error);
        }
      });
    }
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH');
  }
}
