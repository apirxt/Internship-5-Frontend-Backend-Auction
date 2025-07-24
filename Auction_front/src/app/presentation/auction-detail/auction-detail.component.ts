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
  
  // For criteria display per category like create page
  selectedCategoryIndex: number | null = null;
  selectedSubCategoryIndex: number | null = null;
  showCriteriaForCategory: string | null = null;

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
              subCategories: [],
              hasData: true // Mark that this category has auction data
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
              subCategories: [],
              hasData: false // Parent might not have direct data
            });
          }
          
          mainCategoryMap.get(parentId).subCategories.push({
            metaCategoryId: categoryId,
            categoryName: category.categoryName,
            hasData: true // Mark that this subcategory has auction data
          });
        }
      }
    });

    this.displayCategories = Array.from(mainCategoryMap.values());
  }

  getDisplayCategories(): any[] {
    return this.displayCategories;
  }
  
  // Category click handlers for criteria display (read-only version)
  onMainCategoryClick(mainIndex: number): void {
    this.selectedCategoryIndex = mainIndex;
    this.selectedSubCategoryIndex = null;
    this.showCriteriaForCategory = `main-${mainIndex}`;
  }

  onSubCategoryClick(mainIndex: number, subIndex: number): void {
    this.selectedCategoryIndex = mainIndex;
    this.selectedSubCategoryIndex = subIndex;
    this.showCriteriaForCategory = `sub-${mainIndex}-${subIndex}`;
  }

  // Get criteria data for specific category (similar to create page)
  isCriteriaSelectedForCategory(criteriaType: string): boolean {
    if (!this.showCriteriaForCategory) return false;
    
    const categoryData = this.getCategoryDataForCurrentSelection();
    if (!categoryData) return false;

    // Check if this category has the specified criteria type
    const criteriaData = this.getCriteriaDataForCategory(categoryData.metaCategoryId, criteriaType);
    return criteriaData.length > 0;
  }

  private getCategoryDataForCurrentSelection(): any {
    if (!this.showCriteriaForCategory || this.selectedCategoryIndex === null) return null;
    
    if (this.showCriteriaForCategory.startsWith('main-')) {
      return this.displayCategories[this.selectedCategoryIndex];
    } else if (this.showCriteriaForCategory.startsWith('sub-') && this.selectedSubCategoryIndex !== null) {
      return this.displayCategories[this.selectedCategoryIndex].subCategories[this.selectedSubCategoryIndex];
    }
    
    return null;
  }

  private getCriteriaDataForCategory(categoryId: number, criteriaType: string): any[] {
    if (!this.auction?.auctionCategories) return [];
    
    const auctionCategory = this.auction.auctionCategories.find(ac => ac.metaCategoryId === categoryId);
    if (!auctionCategory || !auctionCategory.criteria) return [];
    
    const users: any[] = [];
    auctionCategory.criteria.forEach(criteria => {
      criteria.criteriaUsers?.forEach(user => {
        const hasData = this.userHasCriteriaType(user, criteriaType);
        if (hasData) {
          users.push(user);
        }
      });
    });
    
    return users;
  }

  private userHasCriteriaType(user: any, criteriaType: string): boolean {
    switch (criteriaType) {
      case 'debit':
        return user.debits && user.debits.length > 0;
      case 'credit':
        return user.credits && user.credits.length > 0;
      case 'marginalCredit':
        return user.marginalCredits && user.marginalCredits.length > 0;
      case 'auctionAmount':
        return user.auctionAmounts && user.auctionAmounts.length > 0;
      default:
        return false;
    }
  }

  // Criteria checking methods
  hasDebitCriteria(): boolean {
    if (this.showCriteriaForCategory) {
      return this.isCriteriaSelectedForCategory('debit');
    }
    const debitUsers = this.getDebitUsers();
    return debitUsers.length > 0;
  }

  hasCreditCriteria(): boolean {
    if (this.showCriteriaForCategory) {
      return this.isCriteriaSelectedForCategory('credit');
    }
    const creditUsers = this.getCreditUsers();
    return creditUsers.length > 0;
  }

  hasMarginalCreditCriteria(): boolean {
    if (this.showCriteriaForCategory) {
      return this.isCriteriaSelectedForCategory('marginalCredit');
    }
    const marginalUsers = this.getMarginalCreditUsers();
    return marginalUsers.length > 0;
  }

  hasAuctionAmountCriteria(): boolean {
    if (this.showCriteriaForCategory) {
      return this.isCriteriaSelectedForCategory('auctionAmount');
    }
    const auctionUsers = this.getAuctionAmountUsers();
    return auctionUsers.length > 0;
  }

  // Updated methods for category-specific display
  getDisplayUserNameForCategory(userType: string): string {
    if (!this.showCriteriaForCategory) return 'ไม่มีผู้ใช้';
    
    const userTypes = ['General', 'Member', 'VIP'];
    const typeIndex = userTypes.indexOf(userType);
    
    if (typeIndex === -1) return 'ไม่มีผู้ใช้';
    
    const categoryData = this.getCategoryDataForCurrentSelection();
    if (!categoryData) return 'ไม่มีผู้ใช้';

    // Try to get user from any available criteria for this category
    const allUsers = this.getAllCriteriaUsersForCategory(categoryData.metaCategoryId);
    
    if (allUsers.length > typeIndex) {
      const userId = allUsers[typeIndex]?.metaUserId;
      if (userId) return this.getUserName(userId);
    }
    
    return 'ไม่มีผู้ใช้';
  }

  getDebitMoneyTypeForCategory(userIndex: number): string {
    if (!this.showCriteriaForCategory) return '-';
    
    const categoryData = this.getCategoryDataForCurrentSelection();
    if (!categoryData) return '-';
    
    const debitUsers = this.getCriteriaDataForCategory(categoryData.metaCategoryId, 'debit');
    if (debitUsers.length > userIndex && debitUsers[userIndex].debits && debitUsers[userIndex].debits.length > 0) {
      const debit = debitUsers[userIndex].debits[0];
      return this.getMoneyTypeName(debit.metaMoneyTypeId);
    }
    return '-';
  }

  getDebitAmountForCategory(userIndex: number): string {
    if (!this.showCriteriaForCategory) return '-';
    
    const categoryData = this.getCategoryDataForCurrentSelection();
    if (!categoryData) return '-';
    
    const debitUsers = this.getCriteriaDataForCategory(categoryData.metaCategoryId, 'debit');
    if (debitUsers.length > userIndex && debitUsers[userIndex].debits && debitUsers[userIndex].debits.length > 0) {
      const debit = debitUsers[userIndex].debits[0];
      return this.formatCurrency(debit.cash);
    }
    return '-';
  }

  getCreditAmountForCategory(userIndex: number): string {
    if (!this.showCriteriaForCategory) return '-';
    
    const categoryData = this.getCategoryDataForCurrentSelection();
    if (!categoryData) return '-';
    
    const creditUsers = this.getCriteriaDataForCategory(categoryData.metaCategoryId, 'credit');
    if (creditUsers.length > userIndex && creditUsers[userIndex].credits && creditUsers[userIndex].credits.length > 0) {
      const credit = creditUsers[userIndex].credits[0];
      return this.formatCurrency(credit.credit1);
    }
    return '-';
  }

  getMarginalCreditPercentForCategory(userIndex: number): string {
    if (!this.showCriteriaForCategory) return '-';
    
    const categoryData = this.getCategoryDataForCurrentSelection();
    if (!categoryData) return '-';
    
    const marginalUsers = this.getCriteriaDataForCategory(categoryData.metaCategoryId, 'marginalCredit');
    if (marginalUsers.length > userIndex && marginalUsers[userIndex].marginalCredits && marginalUsers[userIndex].marginalCredits.length > 0) {
      const marginal = marginalUsers[userIndex].marginalCredits[0];
      if (marginal.isNonLimit) {
        return 'ไม่จำกัด';
      }
      return this.formatPercent(marginal.percent);
    }
    return '-';
  }

  getMarginalCreditNonLimitForCategory(userIndex: number): boolean {
    if (!this.showCriteriaForCategory) return false;
    
    const categoryData = this.getCategoryDataForCurrentSelection();
    if (!categoryData) return false;
    
    const marginalUsers = this.getCriteriaDataForCategory(categoryData.metaCategoryId, 'marginalCredit');
    if (marginalUsers.length > userIndex && marginalUsers[userIndex].marginalCredits && marginalUsers[userIndex].marginalCredits.length > 0) {
      const marginal = marginalUsers[userIndex].marginalCredits[0];
      return marginal.isNonLimit || false;
    }
    return false;
  }

  getAuctionAmountValueForCategory(userIndex: number): string {
    if (!this.showCriteriaForCategory) return '-';
    
    const categoryData = this.getCategoryDataForCurrentSelection();
    if (!categoryData) return '-';
    
    const auctionUsers = this.getCriteriaDataForCategory(categoryData.metaCategoryId, 'auctionAmount');
    if (auctionUsers.length > userIndex && auctionUsers[userIndex].auctionAmounts && auctionUsers[userIndex].auctionAmounts.length > 0) {
      const amount = auctionUsers[userIndex].auctionAmounts[0];
      return amount.amount?.toString() || '-';
    }
    return '-';
  }

  private getAllCriteriaUsersForCategory(categoryId: number): any[] {
    if (!this.auction?.auctionCategories) return [];
    
    const auctionCategory = this.auction.auctionCategories.find(ac => ac.metaCategoryId === categoryId);
    if (!auctionCategory || !auctionCategory.criteria) return [];
    
    const users: any[] = [];
    auctionCategory.criteria.forEach(criteria => {
      criteria.criteriaUsers?.forEach(user => {
        users.push(user);
      });
    });
    
    return users;
  }

  // User display methods (legacy - fallback when no category selected)
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
