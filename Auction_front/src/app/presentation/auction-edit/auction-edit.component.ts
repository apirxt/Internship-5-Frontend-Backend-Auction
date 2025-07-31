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

/**
 * Interface for user criteria data structure
 */
interface CriteriaUserData {
  id?: number;
  userType?: string;
  selectedUserId?: number | null;
  minAmount?: number | null;
  maxAmount?: number | null;
  percentage?: number | null;
  isUseCredit?: boolean;
  selectedMoneyTypeId?: number | null;
  debitAmount?: number | null;
  creditAmount?: number | null;
  marginalCreditPercent?: number | null;
  marginalCreditNonLimit?: boolean;
  auctionAmountValue?: number | null;
  metaUserId?: number | null;
  debitId?: number | null;
  creditId?: number | null;
  marginalCreditId?: number | null;
  auctionAmountId?: number | null;
  [key: string]: any;
}

/**
 * Auction Edit Component
 * Handles editing of auction data including categories and criteria
 */
@Component({
  selector: 'app-auction-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './auction-edit.component.html',
  styleUrl: './auction-edit.component.css'
})
export class AuctionEditComponent implements OnInit {
  // ==================== PROPERTIES ====================
  
  // Main auction data
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

  // Data collections
  auctionTypes: MetaAuctionType[] = [];
  metaCategories: MetaCategory[] = [];
  mainCategories: MetaCategory[] = [];
  subCategories: MetaCategory[] = [];
  auctionCategories: any[] = [];
  metaCriteriaTypes: MetaCriteriaType[] = [];
  metaUsers: MetaUser[] = [];
  metaMoneyTypes: MetaMoneyType[] = [];

  // Criteria management
  selectedCriteria: { [key: string]: any } = {};
  criteriaUsersData: { [key: string]: any } = {};
  existingCriteriaIds: { [key: string]: { [key: string]: number } } = {};

  // UI state management
  showMainCategoryForm: boolean = false;
  isLoading: boolean = false;
  message: string = '';
  isSuccess: boolean = false;
  selectedCategoryIndex: number | null = null;
  selectedSubCategoryIndex: number | null = null;
  showCriteriaForCategory: string | null = null;

  // Configuration
  private readonly apiUrl = 'http://localhost:5186/api';
  auctionId: number = 0;

  // ==================== CONSTRUCTOR & LIFECYCLE ====================

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  /**
   * Navigate back to auction detail page
   */
  goBack(): void {
    this.router.navigate(['/auction/detail', this.auctionId]);
  }

  /**
   * Component initialization
   */
  ngOnInit(): void {
    this.loadAuctionTypes();
    this.loadMetaCategories();
    this.loadMetaCriteriaTypes();
    this.loadMetaUsers();
    this.loadMetaMoneyTypes();

    this.route.params.subscribe(params => {
      this.auctionId = +params['id'];
      this.loadAuctionDetails();
    });
  }

  // ==================== DATA LOADING METHODS ====================

  /**
   * Load auction types from API
   */
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

  /**
   * Load meta categories from API
   */
  loadMetaCategories(): void {
    this.http.get<MetaCategory[]>(`${this.apiUrl}/MetaCategory`)
      .subscribe({
        next: (categories) => {
          this.metaCategories = categories;
          this.mainCategories = categories.filter(c => c.categoryHeaderId === null);
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.showMessage('เกิดข้อผิดพลาดในการโหลดหมวดหมู่', false);
        }
      });
  }

  /**
   * Load meta criteria types from API
   */
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

  /**
   * Load meta users from API
   */
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

  /**
   * Load meta money types from API
   */
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

  /**
   * Load auction details from API
   */
  loadAuctionDetails(): void {
    if (!this.auctionId) {
      console.warn('No auction ID provided');
      return;
    }

    this.isLoading = true;
    this.http.get<any>(`${this.apiUrl}/Auction/${this.auctionId}`)
      .subscribe({
        next: (auctionData) => {
          this.auction = {
            id: auctionData.id || 0,
            metaAuctionTypeId: auctionData.metaAuctionTypeId || 0,
            auctionName: auctionData.auctionName || '',
            status: auctionData.status !== undefined ? auctionData.status : true,
            description: auctionData.description || '',
            startDate: auctionData.startDate ? new Date(auctionData.startDate).toISOString().slice(0, 16) : '',
            endDate: auctionData.endDate ? new Date(auctionData.endDate).toISOString().slice(0, 16) : '',
            isDelete: auctionData.isDelete || false,
            createBy: auctionData.createBy || 'system',
            createDate: auctionData.createDate || new Date().toISOString(),
            updateBy: auctionData.updateBy,
            updateDate: auctionData.updateDate
          };

          if (auctionData.auctionCategories && auctionData.auctionCategories.length > 0) {
            this.loadAuctionCategories(auctionData.auctionCategories);
          }

          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading auction details:', error);
          this.showMessage('เกิดข้อผิดพลาดในการโหลดข้อมูลการประมูล', false);
          this.isLoading = false;
        }
      });
  }

  // ==================== CATEGORY MANAGEMENT METHODS ====================

  /**
   * Load auction categories and organize them into main and sub categories
   */
  private loadAuctionCategories(auctionCategories: any[]): void {
    this.auctionCategories = [];
    const mainCategoriesMap = new Map();

    auctionCategories.forEach(auctionCategory => {
      const categoryId = auctionCategory.metaCategoryId;
      const category = this.metaCategories.find(c => c.id === categoryId);
      
      if (!category) return;

      if (!category.categoryHeaderId) {
        // Main category
        if (!mainCategoriesMap.has(categoryId)) {
          const mainCategoryData = {
            id: auctionCategory.id || 0,
            metaCategoryId: categoryId,
            categoryName: category.categoryName,
            isMainCategory: true,
            subCategories: []
          };
          
          mainCategoriesMap.set(categoryId, mainCategoryData);
          this.auctionCategories.push(mainCategoryData);
        }

        if (auctionCategory.criteria && auctionCategory.criteria.length > 0) {
          const mainIndex = this.auctionCategories.findIndex(ac => ac.metaCategoryId === categoryId);
          this.loadCriteriaForCategory(`main-${mainIndex}`, auctionCategory.criteria);
        }
      } else {
        // Sub category
        const parentCategory = this.metaCategories.find(c => c.id === category.categoryHeaderId);
        if (parentCategory) {
          let mainCategoryData = mainCategoriesMap.get(parentCategory.id);
          
          if (!mainCategoryData) {
            mainCategoryData = {
              id: 0,
              metaCategoryId: parentCategory.id,
              categoryName: parentCategory.categoryName,
              isMainCategory: true,
              subCategories: []
            };
            
            mainCategoriesMap.set(parentCategory.id, mainCategoryData);
            this.auctionCategories.push(mainCategoryData);
          }

          const subCategoryData = {
            id: auctionCategory.id || 0,
            metaCategoryId: categoryId,
            categoryName: category.categoryName
          };
          
          mainCategoryData.subCategories.push(subCategoryData);

          if (auctionCategory.criteria && auctionCategory.criteria.length > 0) {
            const mainIndex = this.auctionCategories.findIndex(ac => ac.metaCategoryId === parentCategory.id);
            const subIndex = mainCategoryData.subCategories.length - 1;
            this.loadCriteriaForCategory(`sub-${mainIndex}-${subIndex}`, auctionCategory.criteria);
          }
        }
      }
    });
  }

  // ==================== CRITERIA MANAGEMENT METHODS ====================

  /**
   * Load criteria for a specific category
   */
  private loadCriteriaForCategory(categoryKey: string, criteria: any[]): void {
    this.initializeCriteriaForCategory(categoryKey);

    criteria.forEach(criterion => {
      const criteriaType = this.metaCriteriaTypes.find(ct => ct.id === criterion.metaCriteriaTypeId);
      if (!criteriaType || !criteriaType.criteriaTypeName) return;

      let criteriaTypeKey = '';
      const typeName = criteriaType.criteriaTypeName.toLowerCase();
      
      if (typeName.includes('debit')) {
        criteriaTypeKey = 'debit';
      } else if (typeName.includes('credit') && !typeName.includes('marginal')) {
        criteriaTypeKey = 'credit';
      } else if (typeName.includes('marginal')) {
        criteriaTypeKey = 'marginalCredit';
      } else if (typeName.includes('amount')) {
        criteriaTypeKey = 'auctionAmount';
      }

      if (criteriaTypeKey) {
        // Set selectedCriteria based on isCheck from API response
        this.selectedCriteria[categoryKey][criteriaTypeKey] = criterion.isCheck || false;
        
        if (!this.existingCriteriaIds[categoryKey]) {
          this.existingCriteriaIds[categoryKey] = {};
        }
        this.existingCriteriaIds[categoryKey][criteriaTypeKey] = criterion.id;
        
        // Only initialize criteria users if isCheck is true
        if (criterion.isCheck) {
          this.initializeCriteriaUsersForCategory(categoryKey, criteriaTypeKey);
          
          if (criterion.criteriaUsers && criterion.criteriaUsers.length > 0) {
            criterion.criteriaUsers.forEach((criteriaUser: any, userIndex: number) => {
              if (userIndex >= 3) return;
            
              const userData = this.criteriaUsersData[categoryKey][criteriaTypeKey][userIndex];
              userData.id = criteriaUser.id;
              
              // Load specific data based on criteria type
              if (criteriaTypeKey === 'debit' && criteriaUser.debits && criteriaUser.debits.length > 0) {
                const debit = criteriaUser.debits[0];
                userData.selectedMoneyTypeId = debit.metaMoneyTypeId;
                userData.debitAmount = debit.cash;
                userData.debitId = debit.id;
              }
              
              if (criteriaTypeKey === 'credit' && criteriaUser.credits && criteriaUser.credits.length > 0) {
                const credit = criteriaUser.credits[0];
                userData.creditAmount = credit.credit1;
                userData.creditId = credit.id;
              }
              
              if (criteriaTypeKey === 'marginalCredit' && criteriaUser.marginalCredits && criteriaUser.marginalCredits.length > 0) {
                const marginalCredit = criteriaUser.marginalCredits[0];
                userData.marginalCreditPercent = marginalCredit.percent;
                userData.marginalCreditNonLimit = marginalCredit.isNonLimit;
                userData.marginalCreditId = marginalCredit.id;
              }
              
              if (criteriaTypeKey === 'auctionAmount' && criteriaUser.auctionAmounts && criteriaUser.auctionAmounts.length > 0) {
                const auctionAmount = criteriaUser.auctionAmounts[0];
                userData.auctionAmountValue = auctionAmount.amount;
                userData.auctionAmountId = auctionAmount.id;
              }
              userData.metaUserId = criteriaUser.metaUserId;
            });
          }
        }
      }
    });
  }

  // ==================== FORM SUBMISSION METHODS ====================

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.isLoading) return;

    // ตรวจสอบฟอร์มก่อนส่ง
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.message = '';

    const auctionCategories = this.prepareAuctionCategories();
    const auctionData = this.prepareAuctionData(auctionCategories);
    
    this.submitAuctionData(auctionData);
  }

  /**
   * Prepare auction categories data for submission
   */
  private prepareAuctionCategories(): any[] {
    const auctionCategories: any[] = [];

    this.auctionCategories.forEach((mainCat, mainIndex) => {
      // Process main category
      const mainCategoryCriteria = this.prepareCriteriaForCategory(`main-${mainIndex}`);
      auctionCategories.push(this.createCategoryData(mainCat, mainCategoryCriteria));

      // Process sub categories
      if (mainCat.subCategories && mainCat.subCategories.length > 0) {
        mainCat.subCategories.forEach((subCat: any, subIndex: number) => {
          const subCategoryCriteria = this.prepareCriteriaForCategory(`sub-${mainIndex}-${subIndex}`);
          auctionCategories.push(this.createCategoryData(subCat, subCategoryCriteria));
        });
      }
    });

    return auctionCategories;
  }

  /**
   * Prepare criteria for a specific category
   */
  private prepareCriteriaForCategory(categoryKey: string): any[] {
    const criteriaList: any[] = [];
    
    if (!this.selectedCriteria[categoryKey]) return criteriaList;

    Object.keys(this.selectedCriteria[categoryKey]).forEach(criteriaType => {
      if (this.selectedCriteria[categoryKey][criteriaType]) {
        const criteriaTypeId = this.getCriteriaTypeId(criteriaType);
        const criteriaUsers = this.prepareCriteriaUsers(categoryKey, criteriaType);
        
        if (criteriaUsers.length > 0) {
          criteriaList.push(this.createCriteriaData(categoryKey, criteriaType, criteriaTypeId, criteriaUsers));
        }
      }
    });

    return criteriaList;
  }

  /**
   * Get criteria type ID by type name
   */
  private getCriteriaTypeId(criteriaType: string): number {
    const typeNameMap: { [key: string]: string } = {
      'debit': 'debit',
      'credit': 'credit',
      'marginalCredit': 'marginal',
      'auctionAmount': 'amount'
    };

    const searchTerm = typeNameMap[criteriaType] || criteriaType;
    const criteriaTypeObj = this.metaCriteriaTypes.find(ct => 
      ct.criteriaTypeName && ct.criteriaTypeName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return criteriaTypeObj ? criteriaTypeObj.id : 1;
  }

  /**
   * Prepare criteria users data
   */
  private prepareCriteriaUsers(categoryKey: string, criteriaType: string): any[] {
    const criteriaUsers: any[] = [];
    const usersData = this.criteriaUsersData[categoryKey]?.[criteriaType] || [];

    usersData.forEach((userData: CriteriaUserData, userIndex: number) => {
      if (!userData) return;

      this.assignMetaUserId(userData, userIndex);
      const criteriaUser = this.createCriteriaUserData(userData, criteriaType);
      
      if (this.hasCriteriaData(criteriaUser)) {
        criteriaUsers.push(criteriaUser);
      }
    });

    return criteriaUsers;
  }

  /**
   * Assign meta user ID based on user type index
   */
  private assignMetaUserId(userData: CriteriaUserData, userIndex: number): void {
    const userTypes = ['General', 'Member', 'VIP'];
    if (userIndex < userTypes.length) {
      const userType = userTypes[userIndex];
      const usersForType = this.getUsersByType(userType);
      if (usersForType.length > 0) {
        userData.metaUserId = usersForType[0].id;
      }
    }
  }

  /**
   * Create criteria user data structure
   */
  private createCriteriaUserData(userData: CriteriaUserData, criteriaType: string): any {
    const criteriaUser: any = {
      id: userData.id || 0,
      criteriaId: 0,
      metaUserId: userData.metaUserId || null,
      isDelete: false,
      createBy: 'system',
      createDate: new Date().toISOString(),
      updateBy: null,
      updateDate: null
    };

    this.addSpecificCriteriaData(criteriaUser, userData, criteriaType);
    return criteriaUser;
  }

  /**
   * Add specific criteria data based on type
   */
  private addSpecificCriteriaData(criteriaUser: any, userData: CriteriaUserData, criteriaType: string): void {
    switch (criteriaType) {
      case 'debit':
        this.addDebitData(criteriaUser, userData);
        break;
      case 'credit':
        this.addCreditData(criteriaUser, userData);
        break;
      case 'marginalCredit':
        this.addMarginalCreditData(criteriaUser, userData);
        break;
      case 'auctionAmount':
        this.addAuctionAmountData(criteriaUser, userData);
        break;
    }
  }

  /**
   * Add debit data to criteria user
   */
  private addDebitData(criteriaUser: any, userData: CriteriaUserData): void {
    if (userData.debitAmount && userData.selectedMoneyTypeId) {
      criteriaUser.debits = [{
        id: userData.debitId || 0,
        criteriaUserId: 0,
        metaMoneyTypeId: userData.selectedMoneyTypeId,
        cash: this.parseNumericValue(userData.debitAmount),
        isDelete: false,
        createBy: 'system',
        createDate: new Date().toISOString(),
        updateBy: null,
        updateDate: null
      }];
    }
  }

  /**
   * Add credit data to criteria user
   */
  private addCreditData(criteriaUser: any, userData: CriteriaUserData): void {
    if (userData.creditAmount) {
      criteriaUser.credits = [{
        id: userData.creditId || 0,
        criteriaUserId: 0,
        credit1: this.parseNumericValue(userData.creditAmount),
        isDelete: false,
        createBy: 'system',
        createDate: new Date().toISOString(),
        updateBy: null,
        updateDate: null
      }];
    }
  }

  /**
   * Add marginal credit data to criteria user
   */
  private addMarginalCreditData(criteriaUser: any, userData: CriteriaUserData): void {
    if (userData.marginalCreditPercent || userData.marginalCreditNonLimit) {
      criteriaUser.marginalCredits = [{
        id: userData.marginalCreditId || 0,
        criteriaUserId: 0,
        percent: userData.marginalCreditNonLimit ? null : this.parseNumericValue(userData.marginalCreditPercent),
        isNonLimit: userData.marginalCreditNonLimit || false,
        isDelete: false,
        createBy: 'system',
        createDate: new Date().toISOString(),
        updateBy: null,
        updateDate: null
      }];
    }
  }

  /**
   * Add auction amount data to criteria user
   */
  private addAuctionAmountData(criteriaUser: any, userData: CriteriaUserData): void {
    if (userData.auctionAmountValue) {
      criteriaUser.auctionAmounts = [{
        id: userData.auctionAmountId || 0,
        criteriaUserId: 0,
        amount: this.parseIntegerValue(userData.auctionAmountValue),
        isDelete: false,
        createBy: 'system',
        createDate: new Date().toISOString(),
        updateBy: null,
        updateDate: null
      }];
    }
  }

  /**
   * Parse numeric value from string or number
   */
  private parseNumericValue(value: any): number {
    return typeof value === 'string' ? parseFloat(value) : value;
  }

  /**
   * Parse integer value from string or number
   */
  private parseIntegerValue(value: any): number {
    return typeof value === 'string' ? parseInt(value) : value;
  }

  /**
   * Check if criteria user has any data
   */
  private hasCriteriaData(criteriaUser: any): boolean {
    return criteriaUser.debits || criteriaUser.credits || 
           criteriaUser.marginalCredits || criteriaUser.auctionAmounts;
  }

  /**
   * Create category data structure
   */
  private createCategoryData(category: any, criteria: any[]): any {
    return {
      id: category.id || 0,
      metaCategoryId: category.metaCategoryId,
      isDelete: false,
      createBy: 'system',
      createDate: new Date().toISOString(),
      updateBy: null,
      updateDate: null,
      criteria: criteria
    };
  }

  /**
   * Create criteria data structure
   */
  private createCriteriaData(categoryKey: string, criteriaType: string, criteriaTypeId: number, criteriaUsers: any[]): any {
    return {
      id: this.existingCriteriaIds[categoryKey]?.[criteriaType] || 0,
      auctionCategoryId: 0,
      metaCriteriaTypeId: criteriaTypeId,
      isCheck: true,
      isDelete: false,
      createBy: 'system',
      createDate: new Date().toISOString(),
      updateBy: null,
      updateDate: null,
      criteriaUsers: criteriaUsers
    };
  }

  /**
   * Prepare final auction data for submission
   */
  private prepareAuctionData(auctionCategories: any[]): any {
    return {
      ...this.auction,
      auctionCategories: auctionCategories,
      updateDate: new Date().toISOString()
    };
  }

  /**
   * Submit auction data to API
   */
  private submitAuctionData(auctionData: any): void {
    const isUpdate = this.auctionId && this.auctionId > 0;
    const httpMethod = isUpdate ? 
      this.http.put<Auction>(`${this.apiUrl}/Auction/${this.auctionId}`, auctionData) :
      this.http.post<Auction>(`${this.apiUrl}/Auction`, auctionData);

    httpMethod.subscribe({
      next: (response) => {
        const message = isUpdate ? 
          'แก้ไขการประมูล หมวดหมู่ และเกณฑ์สำเร็จ!' : 
          'สร้างการประมูล หมวดหมู่ และเกณฑ์สำเร็จ!';
        this.showMessage(message, true);
        
        if (!isUpdate) {
          this.resetForm();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error saving auction:', error);
        const message = isUpdate ? 
          'เกิดข้อผิดพลาดในการแก้ไขการประมูล' : 
          'เกิดข้อผิดพลาดในการสร้างการประมูล';
        this.showMessage(message, false);
      }
    });
  }

  // ==================== UI HELPER METHODS ====================

  /**
   * Show message to user
   */
  showMessage(msg: string, success: boolean): void {
    this.message = msg;
    this.isSuccess = success;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  /**
   * Reset form to initial state
   */
  resetForm(): void {
    this.auction = {
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
    this.auctionCategories = [];
    this.selectedCriteria = {};
    this.criteriaUsersData = {};
    this.existingCriteriaIds = {}; // Reset existing criteria IDs
    this.showMainCategoryForm = false;
    this.showCriteriaForCategory = null;
    this.selectedCategoryIndex = null;
    this.selectedSubCategoryIndex = null;
  }

  // ==================== CATEGORY MANAGEMENT UI METHODS ====================

  /**
   * Show main category form
   */
  addMainCategory(): void {
    this.showMainCategoryForm = true;
  }

  /**
   * Handle main category selection
   */
  onMainCategorySelect(categoryId: string): void {
    const id = parseInt(categoryId);
    if (!id) return;
    
    // ตรวจสอบว่าประเภทหลักนี้ยังไม่เคยถูกเลือกไว้
    if (this.isMainCategoryAlreadySelected(id)) {
      this.showMessage('ประเภทหลักนี้ถูกเลือกไว้แล้ว', false);
      return;
    }
    
    const selectedCategory = this.mainCategories.find(c => c.id === id);
    if (selectedCategory) {
      // เพิ่มประเภทหลักเข้าไปใน auctionCategories
      this.auctionCategories.push({
        id: 0, // ใช้ 0 สำหรับการสร้างใหม่
        metaCategoryId: selectedCategory.id,
        categoryName: selectedCategory.categoryName,
        isMainCategory: true,
        subCategories: []
      });
      
      // รีเซ็ตฟอร์ม
      this.showMainCategoryForm = false;
      
      // รีเซ็ตค่าใน select
      const selectElement = document.getElementById('mainCategorySelect') as HTMLSelectElement;
      if (selectElement) {
        selectElement.value = '';
      }
    }
  }

  /**
   * Add sub category form
   */
  addSubCategory(mainCategoryIndex: number): void {
    const mainCategory = this.auctionCategories[mainCategoryIndex];
    this.subCategories = this.metaCategories.filter(c => c.categoryHeaderId === mainCategory.metaCategoryId);
    
    // เพิ่มฟอร์มประเภทรอง
    mainCategory.showSubCategoryForm = true;
  }

  /**
   * Handle sub category selection
   */
  onSubCategorySelect(mainCategoryIndex: number, subCategoryId: string): void {
    const id = parseInt(subCategoryId);
    if (!id) return;
    
    const selectedSubCategory = this.subCategories.find(c => c.id === id);
    if (selectedSubCategory) {
      // ตรวจสอบว่าประเภทรองนี้ยังไม่เคยถูกเลือกไว้
      if (!this.isSubCategoryAlreadySelected(mainCategoryIndex, id)) {
        this.auctionCategories[mainCategoryIndex].subCategories.push({
          id: 0, // ใช้ 0 สำหรับการสร้างใหม่
          metaCategoryId: selectedSubCategory.id,
          categoryName: selectedSubCategory.categoryName
        });
      }
      
      // รีเซ็ตฟอร์ม
      this.auctionCategories[mainCategoryIndex].showSubCategoryForm = false;
      
      // รีเซ็ตค่าใน select
      const selectElement = document.getElementById(`subCategorySelect-${mainCategoryIndex}`) as HTMLSelectElement;
      if (selectElement) {
        selectElement.value = '';
      }
    }
  }

  /**
   * Cancel adding main category
   */
  cancelAddMainCategory(): void {
    this.showMainCategoryForm = false;
  }

  /**
   * Cancel adding sub category
   */
  cancelAddSubCategory(mainIndex: number): void {
    this.auctionCategories[mainIndex].showSubCategoryForm = false;
  }

  /**
   * Check if main category is already selected
   */
  isMainCategoryAlreadySelected(categoryId: number): boolean {
    return this.auctionCategories.some(cat => cat.metaCategoryId === categoryId);
  }

  /**
   * Remove main category
   */
  removeMainCategory(index: number): void {
    // Remove criteria data for this category and its subcategories
    const mainCategoryKey = `main-${index}`;
    delete this.selectedCriteria[mainCategoryKey];
    delete this.criteriaUsersData[mainCategoryKey];
    delete this.existingCriteriaIds[mainCategoryKey];

    // Remove criteria data for subcategories
    const mainCategory = this.auctionCategories[index];
    if (mainCategory.subCategories) {
      mainCategory.subCategories.forEach((_: any, subIndex: number) => {
        const subCategoryKey = `sub-${index}-${subIndex}`;
        delete this.selectedCriteria[subCategoryKey];
        delete this.criteriaUsersData[subCategoryKey];
        delete this.existingCriteriaIds[subCategoryKey];
      });
    }

    // Remove from array
    this.auctionCategories.splice(index, 1);

    // Reset criteria display if it was showing criteria for this category
    if (this.showCriteriaForCategory && this.showCriteriaForCategory.startsWith(`main-${index}`)) {
      this.showCriteriaForCategory = null;
      this.selectedCategoryIndex = null;
      this.selectedSubCategoryIndex = null;
    }
  }

  /**
   * Remove sub category
   */
  removeSubCategory(mainIndex: number, subIndex: number): void {
    // Remove criteria data for this subcategory
    const subCategoryKey = `sub-${mainIndex}-${subIndex}`;
    delete this.selectedCriteria[subCategoryKey];
    delete this.criteriaUsersData[subCategoryKey];
    delete this.existingCriteriaIds[subCategoryKey];

    // Remove from array
    this.auctionCategories[mainIndex].subCategories.splice(subIndex, 1);

    // Reset criteria display if it was showing criteria for this subcategory
    if (this.showCriteriaForCategory === subCategoryKey) {
      this.showCriteriaForCategory = null;
      this.selectedCategoryIndex = null;
      this.selectedSubCategoryIndex = null;
    }
  }

  /**
   * Get users by type
   */
  getUsersByType(userType: string): MetaUser[] {
    // Return users based on their userName that indicates type
    const userTypes = ['General', 'Member', 'VIP'];
    const typeIndex = userTypes.indexOf(userType);
    
    if (typeIndex === -1) return [];
    
    // Filter users by userName that contains the user type
    const filteredUsers = this.metaUsers.filter(user => {
      if (user.userName) {
        const userName = user.userName.toLowerCase();
        return userName.includes(userType.toLowerCase()) || 
               userName.includes(userTypes[typeIndex].toLowerCase());
      }
      return false;
    });
    
    // If we found specific users for this type, return them
    if (filteredUsers.length > 0) {
      return filteredUsers;
    }
    
    // Otherwise, return a subset based on position (fallback)
    const usersPerType = Math.ceil(this.metaUsers.length / 3);
    const startIndex = typeIndex * usersPerType;
    const endIndex = startIndex + usersPerType;
    
    return this.metaUsers.slice(startIndex, endIndex);
  }

  // ==================== CRITERIA UI MANAGEMENT ====================

  /**
   * Handle main category click
   */
  onMainCategoryClick(mainIndex: number): void {
    // Toggle criteria display for main category
    const categoryKey = `main-${mainIndex}`;
    if (this.showCriteriaForCategory === categoryKey) {
      this.showCriteriaForCategory = null;
    } else {
      this.showCriteriaForCategory = categoryKey;
      this.selectedCategoryIndex = mainIndex;
      this.selectedSubCategoryIndex = null;
      
      // Initialize criteria data for this category if not exists
      this.initializeCriteriaForCategory(categoryKey);
    }
  }

  /**
   * Handle sub category click
   */
  onSubCategoryClick(mainIndex: number, subIndex: number): void {
    // Toggle criteria display for sub category
    const categoryKey = `sub-${mainIndex}-${subIndex}`;
    if (this.showCriteriaForCategory === categoryKey) {
      this.showCriteriaForCategory = null;
    } else {
      this.showCriteriaForCategory = categoryKey;
      this.selectedCategoryIndex = mainIndex;
      this.selectedSubCategoryIndex = subIndex;
      
      // Initialize criteria data for this category if not exists
      this.initializeCriteriaForCategory(categoryKey);
    }
  }

  /**
   * Initialize criteria data for a specific category
   */
  initializeCriteriaForCategory(categoryKey: string): void {
    if (!this.selectedCriteria[categoryKey]) {
      this.selectedCriteria[categoryKey] = {};
    }
    if (!this.criteriaUsersData[categoryKey]) {
      this.criteriaUsersData[categoryKey] = {};
    }
    if (!this.existingCriteriaIds[categoryKey]) {
      this.existingCriteriaIds[categoryKey] = {};
    }
  }

  /**
   * Check if criteria is selected for current category
   */
  isCriteriaSelectedForCategory(criteriaType: string): boolean {
    if (!this.showCriteriaForCategory) return false;
    return this.selectedCriteria[this.showCriteriaForCategory]?.[criteriaType] || false;
  }

  /**
   * Handle criteria change for current category
   */
  onCriteriaChangeForCategory(criteriaType: string, isChecked: boolean): void {
    if (!this.showCriteriaForCategory) return;
    
    if (!this.selectedCriteria[this.showCriteriaForCategory]) {
      this.selectedCriteria[this.showCriteriaForCategory] = {};
    }
    
    this.selectedCriteria[this.showCriteriaForCategory][criteriaType] = isChecked;
    
    if (isChecked) {
      this.initializeCriteriaUsersForCategory(this.showCriteriaForCategory, criteriaType);
    }
  }

  /**
   * Initialize criteria users data for category
   */
  initializeCriteriaUsersForCategory(categoryKey: string, criteriaType: string): void {
    if (!this.criteriaUsersData[categoryKey]) {
      this.criteriaUsersData[categoryKey] = {};
    }
    if (!this.criteriaUsersData[categoryKey][criteriaType]) {
      this.criteriaUsersData[categoryKey][criteriaType] = [
        { 
          id: 0,
          selectedMoneyTypeId: null, 
          debitAmount: null, 
          creditAmount: null, 
          marginalCreditPercent: null, 
          marginalCreditNonLimit: false, 
          auctionAmountValue: null,
          debitId: 0,
          creditId: 0,
          marginalCreditId: 0,
          auctionAmountId: 0
        },
        { 
          id: 0,
          selectedMoneyTypeId: null, 
          debitAmount: null, 
          creditAmount: null, 
          marginalCreditPercent: null, 
          marginalCreditNonLimit: false, 
          auctionAmountValue: null,
          debitId: 0,
          creditId: 0,
          marginalCreditId: 0,
          auctionAmountId: 0
        },
        { 
          id: 0,
          selectedMoneyTypeId: null, 
          debitAmount: null, 
          creditAmount: null, 
          marginalCreditPercent: null, 
          marginalCreditNonLimit: false, 
          auctionAmountValue: null,
          debitId: 0,
          creditId: 0,
          marginalCreditId: 0,
          auctionAmountId: 0
        }
      ];
    }
  }

  /**
   * Get criteria users data for current category
   */
  getCriteriaUsersDataForCategory(criteriaType: string): any[] {
    if (!this.showCriteriaForCategory) return [];
    return this.criteriaUsersData[this.showCriteriaForCategory]?.[criteriaType] || [];
  }

  /**
   * Update criteria user data for current category
   */
  updateCriteriaUserDataForCategory(criteriaType: string, userIndex: number, field: string, value: any): void {
    if (!this.showCriteriaForCategory) return;
    
    if (!this.criteriaUsersData[this.showCriteriaForCategory]?.[criteriaType]?.[userIndex]) {
      this.initializeCriteriaUsersForCategory(this.showCriteriaForCategory, criteriaType);
    }
    
    // Parse numeric values properly
    let parsedValue = value;
    if (field === 'debitAmount' || field === 'creditAmount' || field === 'marginalCreditPercent') {
      parsedValue = value && value !== '' ? parseFloat(value) : null;
    } else if (field === 'auctionAmountValue') {
      parsedValue = value && value !== '' ? parseInt(value) : null;
    } else if (field === 'selectedMoneyTypeId') {
      parsedValue = value && value !== '' ? parseInt(value) : null;
    }
    
    this.criteriaUsersData[this.showCriteriaForCategory][criteriaType][userIndex][field] = parsedValue;
  }

  /**
   * Handle debit money type change for category
   */
  onDebitMoneyTypeChangeForCategory(userIndex: number, moneyTypeId: string): void {
    if (!this.showCriteriaForCategory) return;
    this.updateCriteriaUserDataForCategory('debit', userIndex, 'selectedMoneyTypeId', moneyTypeId ? parseInt(moneyTypeId) : null);
  }

  /**
   * Handle marginal credit non-limit change for category
   */
  onMarginalCreditNonLimitChangeForCategory(userIndex: number, isChecked: boolean): void {
    if (!this.showCriteriaForCategory) return;
    this.updateCriteriaUserDataForCategory('marginalCredit', userIndex, 'marginalCreditNonLimit', isChecked);
    if (isChecked) {
      this.updateCriteriaUserDataForCategory('marginalCredit', userIndex, 'marginalCreditPercent', null);
    }
  }

  /**
   * Get placeholder for debit for category
   */
  getPlaceholderForDebitForCategory(userIndex: number): string {
    if (!this.showCriteriaForCategory) return '';
    
    const criteriaData = this.criteriaUsersData[this.showCriteriaForCategory]?.debit?.[userIndex];
    if (!criteriaData) {
      return 'เลือกประเภทก่อน';
    }

    const selectedMoneyTypeId = criteriaData.selectedMoneyTypeId;
    if (!selectedMoneyTypeId) {
      return 'เลือกประเภทก่อน';
    }

    const selectedMoneyType = this.metaMoneyTypes.find(mt => mt.id === selectedMoneyTypeId);
    if (!selectedMoneyType || !selectedMoneyType.moneyTypeName) {
      return 'เลือกประเภทก่อน';
    }

    // Check if it's Amount or Percent based on the money type name
    const moneyTypeName = selectedMoneyType.moneyTypeName.toLowerCase();
    if (moneyTypeName.includes('percent') || moneyTypeName.includes('%')) {
      return '15%';
    } else {
      return '20,000.00';
    }
  }

  /**
   * Get selected money type name for category
   */
  getSelectedMoneyTypeNameForCategory(userIndex: number): string {
    if (!this.showCriteriaForCategory) return '';
    
    const criteriaData = this.criteriaUsersData[this.showCriteriaForCategory]?.debit?.[userIndex];
    if (!criteriaData) return '';

    const selectedMoneyTypeId = criteriaData.selectedMoneyTypeId;
    if (!selectedMoneyTypeId) return '';

    const selectedMoneyType = this.metaMoneyTypes.find(mt => mt.id === selectedMoneyTypeId);
    return selectedMoneyType && selectedMoneyType.moneyTypeName ? selectedMoneyType.moneyTypeName : '';
  }

  /**
   * Get criteria user data value for current category
   */
  getCriteriaUserDataValueForCategory(criteriaType: string, userIndex: number, field: string): any {
    if (!this.showCriteriaForCategory) return null;
    return this.criteriaUsersData[this.showCriteriaForCategory]?.[criteriaType]?.[userIndex]?.[field] || null;
  }

  /**
   * Handle debit amount change for category
   */
  onDebitAmountChangeForCategory(userIndex: number, value: string): void {
    if (!this.showCriteriaForCategory) return;
    const numericValue = value ? parseFloat(value) : null;
    this.updateCriteriaUserDataForCategory('debit', userIndex, 'debitAmount', numericValue);
  }

  /**
   * Handle credit amount change for category
   */
  onCreditAmountChangeForCategory(userIndex: number, value: string): void {
    if (!this.showCriteriaForCategory) return;
    const numericValue = value ? parseFloat(value) : null;
    this.updateCriteriaUserDataForCategory('credit', userIndex, 'creditAmount', numericValue);
  }

  /**
   * Handle marginal credit percent change for category
   */
  onMarginalCreditPercentChangeForCategory(userIndex: number, value: string): void {
    if (!this.showCriteriaForCategory) return;
    const numericValue = value ? parseFloat(value) : null;
    this.updateCriteriaUserDataForCategory('marginalCredit', userIndex, 'marginalCreditPercent', numericValue);
  }

  /**
   * Handle auction amount change for category
   */
  onAuctionAmountChangeForCategory(userIndex: number, value: string): void {
    if (!this.showCriteriaForCategory) return;
    const numericValue = value ? parseInt(value) : null;
    this.updateCriteriaUserDataForCategory('auctionAmount', userIndex, 'auctionAmountValue', numericValue);
  }

  /**
   * Check if marginal credit non-limit is checked for category
   */
  isMarginalCreditNonLimitCheckedForCategory(userIndex: number): boolean {
    if (!this.showCriteriaForCategory) return false;
    return this.criteriaUsersData[this.showCriteriaForCategory]?.marginalCredit?.[userIndex]?.marginalCreditNonLimit || false;
  }

  /**
   * Validate form before submission
   */
  private validateForm(): boolean {
    // ตรวจสอบข้อมูลพื้นฐานของการประมูล
    if (!this.auction.auctionName || this.auction.auctionName.trim() === '') {
      this.showMessage('กรุณาใส่ชื่อการประมูล', false);
      return false;
    }

    if (!this.auction.metaAuctionTypeId || this.auction.metaAuctionTypeId === 0) {
      this.showMessage('กรุณาเลือกประเภทการประมูล', false);
      return false;
    }

    if (!this.auction.startDate) {
      this.showMessage('กรุณาเลือกวันที่เริ่มต้น', false);
      return false;
    }

    if (!this.auction.endDate) {
      this.showMessage('กรุณาเลือกวันที่สิ้นสุด', false);
      return false;
    }

    // ตรวจสอบว่าวันที่เริ่มต้นไม่เกินวันที่สิ้นสุด
    if (new Date(this.auction.startDate) >= new Date(this.auction.endDate)) {
      this.showMessage('วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด', false);
      return false;
    }

    // ตรวจสอบว่ามีการเลือกหมวดหมู่อย่างน้อยหนึ่งหมวดหมู่
    if (this.auctionCategories.length === 0) {
      this.showMessage('กรุณาเลือกหมวดหมู่อย่างน้อยหนึ่งหมวดหมู่', false);
      return false;
    }

    return true;
  }

  /**
   * Check if sub category is already selected in the main category
   */
  isSubCategoryAlreadySelected(mainIndex: number, subCategoryId: number): boolean {
    if (!this.auctionCategories[mainIndex] || !this.auctionCategories[mainIndex].subCategories) {
      return false;
    }
    
    // Convert subCategoryId to number for comparison
    const categoryIdToCheck = Number(subCategoryId);
    
    return this.auctionCategories[mainIndex].subCategories.some((subCat: any) => 
      Number(subCat.metaCategoryId) === categoryIdToCheck
    );
  }
}
