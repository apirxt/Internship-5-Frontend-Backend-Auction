import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Auction } from '../../models/auction.model';
import { MetaAuctionType } from '../../models/meta-auction-type.model';
import { MetaCategory } from '../../models/meta-category.model';
import { MetaCriteriaType } from '../../models/meta-criteria-type.model';
import { MetaUser } from '../../models/meta-user.model';
import { MetaMoneyType } from '../../models/meta-money-type.model';
import { Debit } from '../../models/debit.model';
import { Credit } from '../../models/credit.model';
import { MarginalCredit } from '../../models/marginal-credit.model';
import { AuctionAmount } from '../../models/auction-amount.model';
import { AuctionService } from '../../domain/services/auction.service';

@Component({
  selector: 'app-auction-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './auction-edit.component.html',
  styleUrl: './auction-edit.component.css'
})
export class AuctionEditComponent implements OnInit {
  auction: Auction = {
    id: 0,
    metaAuctionTypeId: 0,
    auctionName: '',
    status: true,
    description: '',
    startDate: '',
    endDate: '',
    isDelete: false,
    createBy: 'system',
    createDate: new Date().toISOString(),
    updateBy: null,
    updateDate: null
  };

  auctionId: number = 0;
  isLoading: boolean = false;
  auctionTypes: MetaAuctionType[] = [];
  metaCategories: MetaCategory[] = [];
  mainCategories: MetaCategory[] = [];
  subCategories: MetaCategory[] = [];
  auctionCategories: any[] = [];
  metaCriteriaTypes: MetaCriteriaType[] = [];
  metaUsers: MetaUser[] = [];
  metaMoneyTypes: MetaMoneyType[] = [];
  debits: Debit[] = [];
  credits: Credit[] = [];
  marginalCredits: MarginalCredit[] = [];
  auctionAmounts: AuctionAmount[] = [];
  selectedCriteria: { [key: string]: boolean } = {};
  criteriaUsersData: { [key: string]: any[] } = {};
  showMainCategoryForm: boolean = false;
  message: string = '';
  isSuccess: boolean = false;

  private apiUrl = 'http://localhost:5186/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private auctionService: AuctionService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.auctionId = +params['id'];
      if (this.auctionId) {
        this.loadAuctionData();
      }
    });
    
    this.loadAuctionTypes();
    this.loadMetaCategories();
    this.loadMetaCriteriaTypes();
    this.loadMetaUsers();
    this.loadMetaMoneyTypes();
  }

  loadAuctionData(): void {
    this.isLoading = true;
    this.auctionService.getById(this.auctionId).subscribe({
      next: (auction) => {
        this.auction = auction;
        this.processExistingData();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading auction:', error);
        this.showMessage('เกิดข้อผิดพลาดในการโหลดข้อมูลประมูล', false);
        this.isLoading = false;
      }
    });
  }

  processExistingData(): void {
    // Process existing categories
    if (this.auction.auctionCategories) {
      this.auctionCategories = [];
      const mainCategoryMap = new Map();

      this.auction.auctionCategories.forEach(auctionCategory => {
        // For now, just add all as main categories
        // TODO: Implement proper main/sub category logic when meta data is loaded
        this.auctionCategories.push({
          id: auctionCategory.id,
          metaCategoryId: auctionCategory.metaCategoryId,
          categoryName: `Category ${auctionCategory.metaCategoryId}`, // Will be updated when meta data loads
          isMainCategory: true,
          subCategories: []
        });
      });
    }

    // Process existing criteria
    if (this.auction.auctionCategories) {
      this.auction.auctionCategories.forEach(category => {
        if (category.criteria) {
          category.criteria.forEach(criteria => {
            if (criteria.criteriaUsers) {
              criteria.criteriaUsers.forEach(user => {
                // Check for debits
                if (user.debits && user.debits.length > 0) {
                  this.selectedCriteria['debit'] = true;
                }
                // Check for credits
                if (user.credits && user.credits.length > 0) {
                  this.selectedCriteria['credit'] = true;
                }
                // Check for marginal credits
                if (user.marginalCredits && user.marginalCredits.length > 0) {
                  this.selectedCriteria['marginalCredit'] = true;
                }
                // Check for auction amounts
                if (user.auctionAmounts && user.auctionAmounts.length > 0) {
                  this.selectedCriteria['auctionAmount'] = true;
                }
              });
            }
          });
        }
      });
    }

    // Initialize criteria users data for selected criteria
    Object.keys(this.selectedCriteria).forEach(criteriaKey => {
      if (this.selectedCriteria[criteriaKey]) {
        this.initializeCriteriaUsersData(criteriaKey);
      }
    });
  }

  initializeCriteriaUsersData(criteriaKey: string): void {
    this.criteriaUsersData[criteriaKey] = [
      {
        userType: 'General',
        selectedUserId: null,
        minAmount: null,
        maxAmount: null,
        percentage: null,
        isUseCredit: false,
        selectedMoneyTypeId: null,
        debitAmount: null,
        creditAmount: null,
        marginalCreditPercent: null,
        marginalCreditNonLimit: false,
        auctionAmountValue: null
      },
      {
        userType: 'Member',
        selectedUserId: null,
        minAmount: null,
        maxAmount: null,
        percentage: null,
        isUseCredit: false,
        selectedMoneyTypeId: null,
        debitAmount: null,
        creditAmount: null,
        marginalCreditPercent: null,
        marginalCreditNonLimit: false,
        auctionAmountValue: null
      },
      {
        userType: 'VIP',
        selectedUserId: null,
        minAmount: null,
        maxAmount: null,
        percentage: null,
        isUseCredit: false,
        selectedMoneyTypeId: null,
        debitAmount: null,
        creditAmount: null,
        marginalCreditPercent: null,
        marginalCreditNonLimit: false,
        auctionAmountValue: null
      }
    ];
  }

  loadAuctionTypes(): void {
    this.http.get<MetaAuctionType[]>(`${this.apiUrl}/MetaAuctionType`)
      .subscribe({
        next: (types) => {
          this.auctionTypes = types;
        },
        error: (error) => {
          console.error('Error loading auction types:', error);
          this.showMessage('เกิดข้อผิดพลาดในการโหลดประเภทการประมูล', false);
        }
      });
  }

  loadMetaCategories(): void {
    this.http.get<MetaCategory[]>(`${this.apiUrl}/MetaCategory`)
      .subscribe({
        next: (categories) => {
          this.metaCategories = categories;
          this.mainCategories = categories.filter(c => c.categoryHeaderId === null);
          // Update category names after loading meta data
          this.updateCategoryNames();
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.showMessage('เกิดข้อผิดพลาดในการโหลดหมวดหมู่', false);
        }
      });
  }

  updateCategoryNames(): void {
    this.auctionCategories.forEach(auctionCat => {
      const metaCategory = this.metaCategories.find(c => c.id === auctionCat.metaCategoryId);
      if (metaCategory) {
        auctionCat.categoryName = metaCategory.categoryName;
      }
    });
  }

  loadMetaCriteriaTypes(): void {
    this.http.get<MetaCriteriaType[]>(`${this.apiUrl}/MetaCriteriaType`)
      .subscribe({
        next: (types) => {
          this.metaCriteriaTypes = types;
        },
        error: (error) => {
          console.error('Error loading criteria types:', error);
          this.showMessage('เกิดข้อผิดพลาดในการโหลดประเภทเกณฑ์', false);
        }
      });
  }

  loadMetaUsers(): void {
    this.http.get<MetaUser[]>(`${this.apiUrl}/MetaUser`)
      .subscribe({
        next: (users) => {
          this.metaUsers = users;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.showMessage('เกิดข้อผิดพลาดในการโหลดผู้ใช้', false);
        }
      });
  }

  loadMetaMoneyTypes(): void {
    this.http.get<MetaMoneyType[]>(`${this.apiUrl}/MetaMoneyType`)
      .subscribe({
        next: (types) => {
          this.metaMoneyTypes = types;
        },
        error: (error) => {
          console.error('Error loading money types:', error);
          this.showMessage('เกิดข้อผิดพลาดในการโหลดประเภทเงิน', false);
        }
      });
  }

  onSubmit(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.message = '';

    // Prepare criteria data
    const criteria: any[] = [];
    
    const getCriteriaTypeId = (typeName: string): number => {
      const criteriaType = this.metaCriteriaTypes.find(ct => 
        ct.criteriaTypeName && ct.criteriaTypeName.toLowerCase().includes(typeName.toLowerCase())
      );
      return criteriaType ? criteriaType.id : 1;
    };

    Object.keys(this.selectedCriteria).forEach(key => {
      if (this.selectedCriteria[key]) {
        let criteriaTypeId: number;
        
        switch(key) {
          case 'debit':
            criteriaTypeId = getCriteriaTypeId('debit');
            break;
          case 'credit':
            criteriaTypeId = getCriteriaTypeId('credit');
            break;
          case 'marginalCredit':
            criteriaTypeId = getCriteriaTypeId('marginal');
            break;
          case 'auctionAmount':
            criteriaTypeId = getCriteriaTypeId('amount');
            break;
          default:
            criteriaTypeId = parseInt(key) || 1;
        }
        
        const usersData = this.criteriaUsersData[key] || [];
        const criteriaUsers: any[] = [];
        
        usersData.forEach((userData, index) => {
          const criteriaUser: any = {
            id: 0,
            criteriaId: 0,
            metaUserId: userData.metaUserId || null,
            isDelete: false,
            createBy: 'system',
            createDate: new Date().toISOString(),
            updateBy: null,
            updateDate: null
          };

          if (key === 'debit' && userData.debitAmount && userData.selectedMoneyTypeId) {
            criteriaUser.debits = [{
              id: 0,
              criteriaUserId: 0,
              metaMoneyTypeId: userData.selectedMoneyTypeId,
              cash: parseFloat(userData.debitAmount),
              isDelete: false,
              createBy: 'system',
              createDate: new Date().toISOString(),
              updateBy: null,
              updateDate: null
            }];
          }

          if (key === 'credit' && userData.creditAmount) {
            criteriaUser.credits = [{
              id: 0,
              criteriaUserId: 0,
              credit1: parseFloat(userData.creditAmount),
              isDelete: false,
              createBy: 'system',
              createDate: new Date().toISOString(),
              updateBy: null,
              updateDate: null
            }];
          }

          if (key === 'marginalCredit' && 
              (userData.marginalCreditPercent || userData.marginalCreditNonLimit)) {
            criteriaUser.marginalCredits = [{
              id: 0,
              criteriaUserId: 0,
              percent: userData.marginalCreditNonLimit ? null : parseFloat(userData.marginalCreditPercent),
              isNonLimit: userData.marginalCreditNonLimit || false,
              isDelete: false,
              createBy: 'system',
              createDate: new Date().toISOString(),
              updateBy: null,
              updateDate: null
            }];
          }

          if (key === 'auctionAmount' && userData.auctionAmountValue) {
            criteriaUser.auctionAmounts = [{
              id: 0,
              criteriaUserId: 0,
              amount: parseInt(userData.auctionAmountValue),
              isDelete: false,
              createBy: 'system',
              createDate: new Date().toISOString(),
              updateBy: null,
              updateDate: null
            }];
          }

          if (criteriaUser.debits || criteriaUser.credits || criteriaUser.marginalCredits || criteriaUser.auctionAmounts) {
            criteriaUsers.push(criteriaUser);
          }
        });

        criteria.push({
          id: 0,
          auctionCategoryId: 0,
          metaCriteriaTypeId: criteriaTypeId,
          isCheck: true,
          isDelete: false,
          createBy: 'system',
          createDate: new Date().toISOString(),
          updateBy: null,
          updateDate: null,
          criteriaUsers: criteriaUsers
        });
      }
    });

    // Prepare auction categories
    const auctionCategories: any[] = [];
    this.auctionCategories.forEach(mainCat => {
      auctionCategories.push({
        id: mainCat.id || 0,
        metaCategoryId: mainCat.metaCategoryId,
        isDelete: false,
        createBy: 'system',
        createDate: new Date().toISOString(),
        updateBy: 'system',
        updateDate: new Date().toISOString(),
        criteria: criteria
      });

      if (mainCat.subCategories && mainCat.subCategories.length > 0) {
        mainCat.subCategories.forEach((subCat: any) => {
          auctionCategories.push({
            id: subCat.id || 0,
            metaCategoryId: subCat.metaCategoryId,
            isDelete: false,
            createBy: 'system',
            createDate: new Date().toISOString(),
            updateBy: 'system',
            updateDate: new Date().toISOString(),
            criteria: []
          });
        });
      }
    });

    // Prepare auction data for update
    const auctionData = {
      ...this.auction,
      auctionCategories: auctionCategories,
      updateBy: 'system',
      updateDate: new Date().toISOString()
    };

    console.log('Data being sent for update:', JSON.stringify(auctionData, null, 2));

    this.auctionService.update(this.auctionId, auctionData)
      .subscribe({
        next: (response) => {
          this.showMessage('อัพเดทการประมูลสำเร็จ!', true);
          this.isLoading = false;
          // Navigate back to detail page after successful update
          setTimeout(() => {
            this.router.navigate(['/auction/detail', this.auctionId]);
          }, 2000);
        },
        error: (error) => {
          console.error('Error updating auction:', error);
          this.showMessage('เกิดข้อผิดพลาดในการอัพเดทการประมูล', false);
          this.isLoading = false;
        }
      });
  }

  showMessage(msg: string, success: boolean): void {
    this.message = msg;
    this.isSuccess = success;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  goBack(): void {
    this.router.navigate(['/auction/detail', this.auctionId]);
  }

  // Category management methods (same as create component)
  addMainCategory(): void {
    this.showMainCategoryForm = true;
  }

  onMainCategorySelect(categoryId: string): void {
    const id = parseInt(categoryId);
    if (!id) return;
    
    const selectedCategory = this.mainCategories.find(c => c.id === id);
    if (selectedCategory) {
      this.auctionCategories.push({
        id: 0,
        metaCategoryId: selectedCategory.id,
        categoryName: selectedCategory.categoryName,
        isMainCategory: true,
        subCategories: []
      });
      
      this.showMainCategoryForm = false;
    }
  }

  addSubCategory(mainCategoryIndex: number): void {
    const mainCategory = this.auctionCategories[mainCategoryIndex];
    this.subCategories = this.metaCategories.filter(c => c.categoryHeaderId === mainCategory.metaCategoryId);
    mainCategory.showSubCategoryForm = true;
  }

  onSubCategorySelect(mainCategoryIndex: number, subCategoryId: string): void {
    const id = parseInt(subCategoryId);
    if (!id) return;
    
    const selectedSubCategory = this.subCategories.find(c => c.id === id);
    if (selectedSubCategory) {
      this.auctionCategories[mainCategoryIndex].subCategories.push({
        id: 0,
        metaCategoryId: selectedSubCategory.id,
        categoryName: selectedSubCategory.categoryName
      });
      
      this.auctionCategories[mainCategoryIndex].showSubCategoryForm = false;
    }
  }

  removeMainCategory(index: number): void {
    this.auctionCategories.splice(index, 1);
  }

  removeSubCategory(mainIndex: number, subIndex: number): void {
    this.auctionCategories[mainIndex].subCategories.splice(subIndex, 1);
  }

  // Criteria management methods (same as create component)
  onCriteriaChange(criteriaKey: string | number, isChecked: boolean): void {
    this.selectedCriteria[criteriaKey] = isChecked;
    
    if (isChecked) {
      this.initializeCriteriaUsersData(criteriaKey.toString());
    } else {
      delete this.criteriaUsersData[criteriaKey];
    }
  }

  isCriteriaSelected(criteriaKey: string | number): boolean {
    return this.selectedCriteria[criteriaKey] || false;
  }

  getCriteriaUsersData(criteriaKey: string | number): any[] {
    return this.criteriaUsersData[criteriaKey] || [];
  }

  getUsersByType(userType: string): MetaUser[] {
    const userTypes = ['General', 'Member', 'VIP'];
    const typeIndex = userTypes.indexOf(userType);
    
    if (typeIndex === -1) return [];
    
    const usersPerType = Math.ceil(this.metaUsers.length / 3);
    const startIndex = typeIndex * usersPerType;
    const endIndex = startIndex + usersPerType;
    
    return this.metaUsers.slice(startIndex, endIndex);
  }

  updateCriteriaUserData(criteriaKey: string | number, userTypeIndex: number, field: string, value: any): void {
    if (this.criteriaUsersData[criteriaKey] && this.criteriaUsersData[criteriaKey][userTypeIndex]) {
      this.criteriaUsersData[criteriaKey][userTypeIndex][field] = value;
      
      const userTypes = ['General', 'Member', 'VIP'];
      if (userTypeIndex < userTypes.length) {
        const userType = userTypes[userTypeIndex];
        const usersForType = this.getUsersByType(userType);
        if (usersForType.length > 0) {
          this.criteriaUsersData[criteriaKey][userTypeIndex].metaUserId = usersForType[0].id;
        }
      }
    }
  }

  onMarginalCreditNonLimitChange(criteriaKey: string | number, userTypeIndex: number, isChecked: boolean): void {
    if (this.criteriaUsersData[criteriaKey] && this.criteriaUsersData[criteriaKey][userTypeIndex]) {
      this.criteriaUsersData[criteriaKey][userTypeIndex].marginalCreditNonLimit = isChecked;
      
      if (isChecked) {
        this.criteriaUsersData[criteriaKey][userTypeIndex].marginalCreditPercent = null;
      }
      
      const userTypes = ['General', 'Member', 'VIP'];
      if (userTypeIndex < userTypes.length) {
        const userType = userTypes[userTypeIndex];
        const usersForType = this.getUsersByType(userType);
        if (usersForType.length > 0) {
          this.criteriaUsersData[criteriaKey][userTypeIndex].metaUserId = usersForType[0].id;
        }
      }
    }
  }

  onDebitMoneyTypeChange(userTypeIndex: number, moneyTypeId: string): void {
    if (this.criteriaUsersData['debit'] && this.criteriaUsersData['debit'][userTypeIndex]) {
      const id = parseInt(moneyTypeId);
      this.criteriaUsersData['debit'][userTypeIndex].selectedMoneyTypeId = id || null;
      this.criteriaUsersData['debit'][userTypeIndex].debitAmount = null;
      
      const userTypes = ['General', 'Member', 'VIP'];
      if (userTypeIndex < userTypes.length) {
        const userType = userTypes[userTypeIndex];
        const usersForType = this.getUsersByType(userType);
        if (usersForType.length > 0) {
          this.criteriaUsersData['debit'][userTypeIndex].metaUserId = usersForType[0].id;
        }
      }
    }
  }

  getPlaceholderForDebit(userTypeIndex: number): string {
    if (!this.criteriaUsersData['debit'] || !this.criteriaUsersData['debit'][userTypeIndex]) {
      return 'เลือกประเภทก่อน';
    }

    const selectedMoneyTypeId = this.criteriaUsersData['debit'][userTypeIndex].selectedMoneyTypeId;
    if (!selectedMoneyTypeId) {
      return 'เลือกประเภทก่อน';
    }

    const selectedMoneyType = this.metaMoneyTypes.find(mt => mt.id === selectedMoneyTypeId);
    if (!selectedMoneyType || !selectedMoneyType.moneyTypeName) {
      return 'เลือกประเภทก่อน';
    }

    const moneyTypeName = selectedMoneyType.moneyTypeName.toLowerCase();
    if (moneyTypeName.includes('percent') || moneyTypeName.includes('%')) {
      return '15%';
    } else {
      return '20,000.00';
    }
  }

  getSelectedMoneyTypeName(userTypeIndex: number): string {
    if (!this.criteriaUsersData['debit'] || !this.criteriaUsersData['debit'][userTypeIndex]) {
      return '';
    }

    const selectedMoneyTypeId = this.criteriaUsersData['debit'][userTypeIndex].selectedMoneyTypeId;
    if (!selectedMoneyTypeId) {
      return '';
    }

    const selectedMoneyType = this.metaMoneyTypes.find(mt => mt.id === selectedMoneyTypeId);
    return selectedMoneyType && selectedMoneyType.moneyTypeName ? selectedMoneyType.moneyTypeName : '';
  }
}
