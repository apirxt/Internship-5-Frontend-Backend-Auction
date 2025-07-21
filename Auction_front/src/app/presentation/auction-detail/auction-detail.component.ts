import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuctionService } from '../../domain/services/auction.service';
import { Auction } from '../../models/auction.model';
import { MetaCategory } from '../../models/meta-category.model';
import { MetaCriteriaType } from '../../models/meta-criteria-type.model';
import { MetaUser } from '../../models/meta-user.model';
import { MetaMoneyType } from '../../models/meta-money-type.model';
import { MetaAuctionType } from '../../models/meta-auction-type.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-auction-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auction-detail.component.html',
  styleUrl: './auction-detail.component.css'
})
export class AuctionDetailComponent implements OnInit {
  auction: Auction | null = null;
  isLoading: boolean = false;
  auctionId: number = 0;

  // Lookup objects for displaying real data instead of IDs
  categories: { [key: number]: MetaCategory } = {};
  criteriaTypes: { [key: number]: MetaCriteriaType } = {};
  users: { [key: number]: MetaUser } = {};
  moneyTypes: { [key: number]: MetaMoneyType } = {};
  auctionTypes: { [key: number]: MetaAuctionType } = {};

  // Display categories structure like create page
  displayCategories: any[] = [];

  constructor(
    private auctionService: AuctionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.auctionId = +params['id'];
      if (this.auctionId) {
        this.loadAuctionDetail();
      }
    });
  }

  loadAuctionDetail(): void {
    this.isLoading = true;

    // Load all necessary data in parallel
    forkJoin({
      auction: this.auctionService.getById(this.auctionId),
      categories: this.auctionService.getAllMetaCategories(),
      criteriaTypes: this.auctionService.getAllMetaCriteriaTypes(),
      users: this.auctionService.getAllMetaUsers(),
      moneyTypes: this.auctionService.getAllMetaMoneyTypes(),
      auctionTypes: this.auctionService.getAllMetaAuctionTypes()
    }).subscribe({
      next: (result) => {
        this.auction = result.auction;
        
        // Create lookup objects
        this.categories = this.createLookup(result.categories);
        this.criteriaTypes = this.createLookup(result.criteriaTypes);
        this.users = this.createLookup(result.users);
        this.moneyTypes = this.createLookup(result.moneyTypes);
        this.auctionTypes = this.createLookup(result.auctionTypes);
        
        // Process categories for display
        this.processDisplayCategories();
        
        // Debug logging
        console.log('Auction data:', this.auction);
        console.log('Categories:', this.auction?.auctionCategories);
        if (this.auction?.auctionCategories) {
          this.auction.auctionCategories.forEach((category, catIndex) => {
            console.log(`Category ${catIndex}:`, category);
            if (category.criteria) {
              category.criteria.forEach((criteria, criteriaIndex) => {
                console.log(`  Criteria ${criteriaIndex}:`, criteria);
                if (criteria.criteriaUsers) {
                  criteria.criteriaUsers.forEach((user, userIndex) => {
                    console.log(`    User ${userIndex}:`, user);
                    console.log(`      Debits:`, user.debits);
                    console.log(`      Credits:`, user.credits);
                    console.log(`      MarginalCredits:`, user.marginalCredits);
                    console.log(`      AuctionAmounts:`, user.auctionAmounts);
                  });
                }
              });
            }
          });
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading auction detail:', error);
        this.isLoading = false;
        alert('เกิดข้อผิดพลาดในการโหลดรายละเอียดประมูล');
      }
    });
  }

  // Helper method to create lookup objects
  private createLookup<T extends { id: number }>(items: T[]): { [key: number]: T } {
    return items.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {} as { [key: number]: T });
  }

  goBack(): void {
    this.router.navigate(['/auction/list']);
  }

  editAuction(): void {
    this.router.navigate(['/auction/edit', this.auctionId]);
  }

  deleteAuction(): void {
    if (confirm('คุณต้องการลบประมูลนี้หรือไม่?')) {
      this.auctionService.delete(this.auctionId).subscribe({
        next: () => {
          alert('ลบประมูลเรียบร้อยแล้ว');
          this.router.navigate(['/auction/list']);
        },
        error: (error) => {
          console.error('Error deleting auction:', error);
          alert('เกิดข้อผิดพลาดในการลบประมูล');
        }
      });
    }
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number | null): string {
    if (!amount) return '-';
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  }

  formatPercent(percent: number | null): string {
    if (!percent) return '-';
    return `${percent}%`;
  }

  // Helper methods to get names from IDs
  getCategoryName(categoryId: number | null): string {
    if (!categoryId || !this.categories[categoryId]) return '-';
    return this.categories[categoryId].categoryName || '-';
  }

  getCriteriaTypeName(criteriaTypeId: number | null): string {
    if (!criteriaTypeId || !this.criteriaTypes[criteriaTypeId]) return '-';
    return this.criteriaTypes[criteriaTypeId].criteriaTypeName || '-';
  }

  getUserName(userId: number | null): string {
    if (!userId || !this.users[userId]) return '-';
    return this.users[userId].userName || '-';
  }

  getMoneyTypeName(moneyTypeId: number | null): string {
    if (!moneyTypeId || !this.moneyTypes[moneyTypeId]) return '-';
    return this.moneyTypes[moneyTypeId].moneyTypeName || '-';
  }

  // Additional methods for auction detail page to match create page layout

  getAuctionTypeName(auctionTypeId: number | null): string {
    if (!auctionTypeId || !this.auctionTypes[auctionTypeId]) return '-';
    return this.auctionTypes[auctionTypeId].auctionTypeName || '-';
  }

  processDisplayCategories(): void {
    if (!this.auction?.auctionCategories) {
      this.displayCategories = [];
      return;
    }

    const mainCategoryMap = new Map();
    
    // Group categories by main category (those without parent)
    this.auction.auctionCategories.forEach(auctionCategory => {
      const categoryId = auctionCategory.metaCategoryId;
      const category = this.categories[categoryId || 0];
      
      if (category) {
        if (!category.categoryHeaderId) {
          // This is a main category
          if (!mainCategoryMap.has(categoryId)) {
            mainCategoryMap.set(categoryId, {
              metaCategoryId: categoryId,
              categoryName: category.categoryName,
              subCategories: []
            });
          }
        } else {
          // This is a sub category
          const parentId = category.categoryHeaderId;
          if (!mainCategoryMap.has(parentId)) {
            const parentCategory = this.categories[parentId];
            mainCategoryMap.set(parentId, {
              metaCategoryId: parentId,
              categoryName: parentCategory?.categoryName || 'Unknown',
              subCategories: []
            });
          }
          
          mainCategoryMap.get(parentId).subCategories.push({
            metaCategoryId: categoryId,
            categoryName: category.categoryName
          });
        }
      }
    });

    this.displayCategories = Array.from(mainCategoryMap.values());
  }

  getDisplayCategories(): any[] {
    return this.displayCategories;
  }

  // Criteria checking methods
  hasDebitCriteria(): boolean {
    const debitUsers = this.getDebitUsers();
    console.log('Debit users found:', debitUsers.length);
    return debitUsers.length > 0;
  }

  hasCreditCriteria(): boolean {
    const creditUsers = this.getCreditUsers();
    console.log('Credit users found:', creditUsers.length);
    return creditUsers.length > 0;
  }

  hasMarginalCreditCriteria(): boolean {
    const marginalUsers = this.getMarginalCreditUsers();
    console.log('Marginal credit users found:', marginalUsers.length);
    return marginalUsers.length > 0;
  }

  hasAuctionAmountCriteria(): boolean {
    const auctionUsers = this.getAuctionAmountUsers();
    console.log('Auction amount users found:', auctionUsers.length);
    return auctionUsers.length > 0;
  }

  // User display methods
  getDisplayUserName(userType: string): string {
    const userTypes = ['General', 'Member', 'VIP'];
    const typeIndex = userTypes.indexOf(userType);
    
    if (typeIndex === -1) return 'ไม่มีผู้ใช้';
    
    // Try to get user name from any available criteria users
    const allUsers = this.getAllCriteriaUsers();
    
    // First, try to get from debit users
    const debitUsers = this.getDebitUsers();
    if (debitUsers.length > typeIndex) {
      const userId = debitUsers[typeIndex]?.metaUserId;
      if (userId) return this.getUserName(userId);
    }
    
    // Then try credit users
    const creditUsers = this.getCreditUsers();
    if (creditUsers.length > typeIndex) {
      const userId = creditUsers[typeIndex]?.metaUserId;
      if (userId) return this.getUserName(userId);
    }
    
    // Then try marginal credit users
    const marginalUsers = this.getMarginalCreditUsers();
    if (marginalUsers.length > typeIndex) {
      const userId = marginalUsers[typeIndex]?.metaUserId;
      if (userId) return this.getUserName(userId);
    }
    
    // Finally try auction amount users
    const auctionUsers = this.getAuctionAmountUsers();
    if (auctionUsers.length > typeIndex) {
      const userId = auctionUsers[typeIndex]?.metaUserId;
      if (userId) return this.getUserName(userId);
    }
    
    // Fallback to all users
    if (allUsers.length > typeIndex) {
      const userId = allUsers[typeIndex]?.metaUserId;
      if (userId) return this.getUserName(userId);
    }
    
    return 'ไม่มีผู้ใช้';
  }

  private getAllCriteriaUsers(): any[] {
    if (!this.auction?.auctionCategories) return [];
    
    const users: any[] = [];
    this.auction.auctionCategories.forEach(category => {
      category.criteria?.forEach(criteria => {
        criteria.criteriaUsers?.forEach(user => {
          users.push(user);
        });
      });
    });
    
    return users;
  }

  // Criteria data display methods
  getDebitMoneyType(userIndex: number): string {
    const debitUsers = this.getDebitUsers();
    if (debitUsers.length > userIndex && debitUsers[userIndex].debits && debitUsers[userIndex].debits.length > 0) {
      const debit = debitUsers[userIndex].debits[0];
      return this.getMoneyTypeName(debit.metaMoneyTypeId);
    }
    return '-';
  }

  getDebitAmount(userIndex: number): string {
    const debitUsers = this.getDebitUsers();
    if (debitUsers.length > userIndex && debitUsers[userIndex].debits && debitUsers[userIndex].debits.length > 0) {
      const debit = debitUsers[userIndex].debits[0];
      return this.formatCurrency(debit.cash);
    }
    return '-';
  }

  getCreditAmount(userIndex: number): string {
    const creditUsers = this.getCreditUsers();
    if (creditUsers.length > userIndex && creditUsers[userIndex].credits && creditUsers[userIndex].credits.length > 0) {
      const credit = creditUsers[userIndex].credits[0];
      return this.formatCurrency(credit.credit1);
    }
    return '-';
  }

  getMarginalCreditPercent(userIndex: number): string {
    const marginalUsers = this.getMarginalCreditUsers();
    if (marginalUsers.length > userIndex && marginalUsers[userIndex].marginalCredits && marginalUsers[userIndex].marginalCredits.length > 0) {
      const marginal = marginalUsers[userIndex].marginalCredits[0];
      if (marginal.isNonLimit) {
        return 'ไม่จำกัด';
      }
      return this.formatPercent(marginal.percent);
    }
    return '-';
  }

  getMarginalCreditNonLimit(userIndex: number): boolean {
    const marginalUsers = this.getMarginalCreditUsers();
    if (marginalUsers.length > userIndex && marginalUsers[userIndex].marginalCredits && marginalUsers[userIndex].marginalCredits.length > 0) {
      const marginal = marginalUsers[userIndex].marginalCredits[0];
      return marginal.isNonLimit || false;
    }
    return false;
  }

  getAuctionAmountValue(userIndex: number): string {
    const auctionUsers = this.getAuctionAmountUsers();
    if (auctionUsers.length > userIndex && auctionUsers[userIndex].auctionAmounts && auctionUsers[userIndex].auctionAmounts.length > 0) {
      const amount = auctionUsers[userIndex].auctionAmounts[0];
      return amount.amount?.toString() || '-';
    }
    return '-';
  }

  // Helper methods to get users by criteria type
  private getDebitUsers(): any[] {
    if (!this.auction?.auctionCategories) return [];
    
    const users: any[] = [];
    this.auction.auctionCategories.forEach(category => {
      category.criteria?.forEach(criteria => {
        criteria.criteriaUsers?.forEach(user => {
          if (user.debits && user.debits.length > 0) {
            users.push(user);
          }
        });
      });
    });
    
    return users;
  }

  private getCreditUsers(): any[] {
    if (!this.auction?.auctionCategories) return [];
    
    const users: any[] = [];
    this.auction.auctionCategories.forEach(category => {
      category.criteria?.forEach(criteria => {
        criteria.criteriaUsers?.forEach(user => {
          if (user.credits && user.credits.length > 0) {
            users.push(user);
          }
        });
      });
    });
    
    return users;
  }

  private getMarginalCreditUsers(): any[] {
    if (!this.auction?.auctionCategories) return [];
    
    const users: any[] = [];
    this.auction.auctionCategories.forEach(category => {
      category.criteria?.forEach(criteria => {
        criteria.criteriaUsers?.forEach(user => {
          if (user.marginalCredits && user.marginalCredits.length > 0) {
            users.push(user);
          }
        });
      });
    });
    
    return users;
  }

  private getAuctionAmountUsers(): any[] {
    if (!this.auction?.auctionCategories) return [];
    
    const users: any[] = [];
    this.auction.auctionCategories.forEach(category => {
      category.criteria?.forEach(criteria => {
        criteria.criteriaUsers?.forEach(user => {
          if (user.auctionAmounts && user.auctionAmounts.length > 0) {
            users.push(user);
          }
        });
      });
    });
    
    return users;
  }
}
