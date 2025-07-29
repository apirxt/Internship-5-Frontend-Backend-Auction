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

// Interface for user criteria data
interface CriteriaUserData {
  id?: number; // Add ID field for existing data
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
  // Add IDs for existing related data
  debitId?: number | null;
  creditId?: number | null;
  marginalCreditId?: number | null;
  auctionAmountId?: number | null;
  [key: string]: any; // Allow dynamic property access
}
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
    createBy: 'system', // ปรับตามระบบ authentication ของคุณ
    createDate: new Date().toISOString(),
    updateBy: null,
    updateDate: null
  };

  auctionTypes: MetaAuctionType[] = [];
  metaCategories: MetaCategory[] = [];
  mainCategories: MetaCategory[] = [];
  subCategories: MetaCategory[] = [];
  auctionCategories: any[] = [];
  metaCriteriaTypes: MetaCriteriaType[] = [];
  metaUsers: MetaUser[] = [];
  metaMoneyTypes: MetaMoneyType[] = [];
  selectedCriteria: { [key: string]: any } = {};
  criteriaUsersData: { [key: string]: any } = {};
  // Store existing criteria IDs for update
  existingCriteriaIds: { [key: string]: { [key: string]: number } } = {};
  showMainCategoryForm: boolean = false;
  isLoading: boolean = false;
  message: string = '';
  isSuccess: boolean = false;
  
  // For individual category criteria
  selectedCategoryIndex: number | null = null;
  selectedSubCategoryIndex: number | null = null;
  showCriteriaForCategory: string | null = null; // format: "main-0" or "sub-0-1"

  private apiUrl = 'http://localhost:5186/api'; // ปรับ URL ตาม backend ของคุณ
  auctionId: number = 0; // Add this property to store the auction ID

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  goBack(): void {
    this.router.navigate(['/auction/detail', this.auctionId]);
  }

  ngOnInit(): void {
    this.loadAuctionTypes();
    this.loadMetaCategories();
    this.loadMetaCriteriaTypes();
    this.loadMetaUsers();
    this.loadMetaMoneyTypes();

    // Get auction ID from route parameters
    this.route.params.subscribe(params => {
      this.auctionId = +params['id']; // Convert to number
      this.loadAuctionDetails();
    });
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
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.showMessage('เกิดข้อผิดพลาดในการโหลดหมวดหมู่', false);
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

  loadAuctionDetails(): void {
    if (!this.auctionId) {
      console.warn('No auction ID provided');
      return;
    }

    this.isLoading = true;
    this.http.get<any>(`${this.apiUrl}/Auction/${this.auctionId}`)
      .subscribe({
        next: (auctionData) => {
          // Load auction basic data
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

          // Load auction categories
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

  private loadAuctionCategories(auctionCategories: any[]): void {
    this.auctionCategories = [];
    const mainCategoriesMap = new Map();

    // Process auction categories
    auctionCategories.forEach(auctionCategory => {
      const categoryId = auctionCategory.metaCategoryId;
      const category = this.metaCategories.find(c => c.id === categoryId);
      
      if (!category) return;

      // Check if it's a main category (no parent)
      if (!category.categoryHeaderId) {
        // Main category
        if (!mainCategoriesMap.has(categoryId)) {
          const mainCategoryData = {
            id: auctionCategory.id || 0, // Keep original ID for update
            metaCategoryId: categoryId,
            categoryName: category.categoryName,
            isMainCategory: true,
            subCategories: []
          };
          
          mainCategoriesMap.set(categoryId, mainCategoryData);
          this.auctionCategories.push(mainCategoryData);
        }

        // Load criteria for main category
        if (auctionCategory.criteria && auctionCategory.criteria.length > 0) {
          const mainIndex = this.auctionCategories.findIndex(ac => ac.metaCategoryId === categoryId);
          this.loadCriteriaForCategory(`main-${mainIndex}`, auctionCategory.criteria);
        }
      } else {
        // Sub category - find its parent main category
        const parentCategory = this.metaCategories.find(c => c.id === category.categoryHeaderId);
        if (parentCategory) {
          let mainCategoryData = mainCategoriesMap.get(parentCategory.id);
          
          // If main category doesn't exist yet, create it
          if (!mainCategoryData) {
            mainCategoryData = {
              id: 0, // No existing main category ID
              metaCategoryId: parentCategory.id,
              categoryName: parentCategory.categoryName,
              isMainCategory: true,
              subCategories: []
            };
            
            mainCategoriesMap.set(parentCategory.id, mainCategoryData);
            this.auctionCategories.push(mainCategoryData);
          }

          // Add sub category
          const subCategoryData = {
            id: auctionCategory.id || 0, // Keep original ID for update
            metaCategoryId: categoryId,
            categoryName: category.categoryName
          };
          
          mainCategoryData.subCategories.push(subCategoryData);

          // Load criteria for sub category
          if (auctionCategory.criteria && auctionCategory.criteria.length > 0) {
            const mainIndex = this.auctionCategories.findIndex(ac => ac.metaCategoryId === parentCategory.id);
            const subIndex = mainCategoryData.subCategories.length - 1;
            this.loadCriteriaForCategory(`sub-${mainIndex}-${subIndex}`, auctionCategory.criteria);
          }
        }
      }
    });
  }

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
        // Mark criteria as selected
        this.selectedCriteria[categoryKey][criteriaTypeKey] = true;
        
        // Store existing criteria ID
        if (!this.existingCriteriaIds[categoryKey]) {
          this.existingCriteriaIds[categoryKey] = {};
        }
        this.existingCriteriaIds[categoryKey][criteriaTypeKey] = criterion.id;
        
        // Initialize criteria users data
        this.initializeCriteriaUsersForCategory(categoryKey, criteriaTypeKey);
        
        // Load criteria users data
        if (criterion.criteriaUsers && criterion.criteriaUsers.length > 0) {
          criterion.criteriaUsers.forEach((criteriaUser: any, userIndex: number) => {
            if (userIndex >= 3) return; // Only support 3 user types
            
            const userData = this.criteriaUsersData[categoryKey][criteriaTypeKey][userIndex];
            
            // Store criteriaUser ID
            userData.id = criteriaUser.id;
            
            // Load specific data based on criteria type
            if (criteriaTypeKey === 'debit' && criteriaUser.debits && criteriaUser.debits.length > 0) {
              const debit = criteriaUser.debits[0];
              userData.selectedMoneyTypeId = debit.metaMoneyTypeId;
              userData.debitAmount = debit.cash;
              userData.debitId = debit.id; // Store debit ID
            }
            
            if (criteriaTypeKey === 'credit' && criteriaUser.credits && criteriaUser.credits.length > 0) {
              const credit = criteriaUser.credits[0];
              userData.creditAmount = credit.credit1;
              userData.creditId = credit.id; // Store credit ID
            }
            
            if (criteriaTypeKey === 'marginalCredit' && criteriaUser.marginalCredits && criteriaUser.marginalCredits.length > 0) {
              const marginalCredit = criteriaUser.marginalCredits[0];
              userData.marginalCreditPercent = marginalCredit.percent;
              userData.marginalCreditNonLimit = marginalCredit.isNonLimit;
              userData.marginalCreditId = marginalCredit.id; // Store marginal credit ID
            }
            
            if (criteriaTypeKey === 'auctionAmount' && criteriaUser.auctionAmounts && criteriaUser.auctionAmounts.length > 0) {
              const auctionAmount = criteriaUser.auctionAmounts[0];
              userData.auctionAmountValue = auctionAmount.amount;
              userData.auctionAmountId = auctionAmount.id; // Store auction amount ID
            }
            
            userData.metaUserId = criteriaUser.metaUserId;
          });
        }
      }
    });
  }

  onSubmit(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.message = '';

    // เตรียมข้อมูล auction categories พร้อม criteria
    const auctionCategories: any[] = [];
    
    // Get criteria type IDs from metaCriteriaTypes
    const getCriteriaTypeId = (typeName: string): number => {
      const criteriaType = this.metaCriteriaTypes.find(ct => 
        ct.criteriaTypeName && ct.criteriaTypeName.toLowerCase().includes(typeName.toLowerCase())
      );
      return criteriaType ? criteriaType.id : 1; // Default to 1 if not found
    };

    // Process each main category
    this.auctionCategories.forEach((mainCat, mainIndex) => {
      // Create criteria for main category
      const mainCategoryCriteria: any[] = [];
      const mainCategoryKey = `main-${mainIndex}`;
      
      if (this.selectedCriteria[mainCategoryKey]) {
        Object.keys(this.selectedCriteria[mainCategoryKey]).forEach(criteriaType => {
          if (this.selectedCriteria[mainCategoryKey][criteriaType]) {
            // Map criteria type to ID
            let criteriaTypeId: number;
            switch(criteriaType) {
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
                criteriaTypeId = 1;
            }

            // Get users data for this criteria type
            const usersData = this.criteriaUsersData[mainCategoryKey]?.[criteriaType] || [];
            const criteriaUsers: any[] = [];

            // Process each user type (General, Member, VIP)
            usersData.forEach((userData: CriteriaUserData, userIndex: number) => {
              if (!userData) return;

              // Auto-assign metaUserId based on userType index
              const userTypes = ['General', 'Member', 'VIP'];
              if (userIndex < userTypes.length) {
                const userType = userTypes[userIndex];
                const usersForType = this.getUsersByType(userType);
                if (usersForType.length > 0) {
                  userData.metaUserId = usersForType[0].id;
                }
              }

              const criteriaUser: any = {
                id: userData.id || 0, // Use existing criteriaUser ID
                criteriaId: 0,
                metaUserId: userData.metaUserId || null,
                isDelete: false,
                createBy: 'system',
                createDate: new Date().toISOString(),
                updateBy: null,
                updateDate: null
              };

              // Add specific criteria data
              if (criteriaType === 'debit' && userData.debitAmount && userData.selectedMoneyTypeId) {
                criteriaUser.debits = [{
                  id: userData.debitId || 0, // Use existing debit ID
                  criteriaUserId: 0,
                  metaMoneyTypeId: userData.selectedMoneyTypeId,
                  cash: typeof userData.debitAmount === 'string' ? parseFloat(userData.debitAmount) : userData.debitAmount,
                  isDelete: false,
                  createBy: 'system',
                  createDate: new Date().toISOString(),
                  updateBy: null,
                  updateDate: null
                }];
              }

              if (criteriaType === 'credit' && userData.creditAmount) {
                criteriaUser.credits = [{
                  id: userData.creditId || 0, // Use existing credit ID
                  criteriaUserId: 0,
                  credit1: typeof userData.creditAmount === 'string' ? parseFloat(userData.creditAmount) : userData.creditAmount,
                  isDelete: false,
                  createBy: 'system',
                  createDate: new Date().toISOString(),
                  updateBy: null,
                  updateDate: null
                }];
              }

              if (criteriaType === 'marginalCredit' && 
                  (userData.marginalCreditPercent || userData.marginalCreditNonLimit)) {
                criteriaUser.marginalCredits = [{
                  id: userData.marginalCreditId || 0, // Use existing marginal credit ID
                  criteriaUserId: 0,
                  percent: userData.marginalCreditNonLimit ? null : 
                    (userData.marginalCreditPercent ? 
                      (typeof userData.marginalCreditPercent === 'string' ? parseFloat(userData.marginalCreditPercent) : userData.marginalCreditPercent) 
                      : null),
                  isNonLimit: userData.marginalCreditNonLimit || false,
                  isDelete: false,
                  createBy: 'system',
                  createDate: new Date().toISOString(),
                  updateBy: null,
                  updateDate: null
                }];
              }

              if (criteriaType === 'auctionAmount' && userData.auctionAmountValue) {
                criteriaUser.auctionAmounts = [{
                  id: userData.auctionAmountId || 0, // Use existing auction amount ID
                  criteriaUserId: 0,
                  amount: typeof userData.auctionAmountValue === 'string' ? parseInt(userData.auctionAmountValue) : userData.auctionAmountValue,
                  isDelete: false,
                  createBy: 'system',
                  createDate: new Date().toISOString(),
                  updateBy: null,
                  updateDate: null
                }];
              }

              // Add criteria user if it has data
              if (criteriaUser.debits || criteriaUser.credits || criteriaUser.marginalCredits || criteriaUser.auctionAmounts) {
                criteriaUsers.push(criteriaUser);
              }
            });

            // Add criteria with users
            if (criteriaUsers.length > 0) {
              mainCategoryCriteria.push({
                id: this.existingCriteriaIds[mainCategoryKey]?.[criteriaType] || 0, // Use existing criteria ID
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
          }
        });
      }

      // Add main category
      auctionCategories.push({
        id: mainCat.id || 0, // Use existing ID or 0 for new
        metaCategoryId: mainCat.metaCategoryId,
        isDelete: false,
        createBy: 'system',
        createDate: new Date().toISOString(),
        updateBy: null,
        updateDate: null,
        criteria: mainCategoryCriteria
      });

      // Process sub categories
      if (mainCat.subCategories && mainCat.subCategories.length > 0) {
        mainCat.subCategories.forEach((subCat: any, subIndex: number) => {
          const subCategoryCriteria: any[] = [];
          const subCategoryKey = `sub-${mainIndex}-${subIndex}`;
          
          if (this.selectedCriteria[subCategoryKey]) {
            Object.keys(this.selectedCriteria[subCategoryKey]).forEach(criteriaType => {
              if (this.selectedCriteria[subCategoryKey][criteriaType]) {
                // Similar logic as main category but for sub category
                let criteriaTypeId: number;
                switch(criteriaType) {
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
                    criteriaTypeId = 1;
                }

                const usersData = this.criteriaUsersData[subCategoryKey]?.[criteriaType] || [];
                const criteriaUsers: any[] = [];

                usersData.forEach((userData: CriteriaUserData, userIndex: number) => {
                  if (!userData) return;

                  // Auto-assign metaUserId based on userType index
                  const userTypes = ['General', 'Member', 'VIP'];
                  if (userIndex < userTypes.length) {
                    const userType = userTypes[userIndex];
                    const usersForType = this.getUsersByType(userType);
                    if (usersForType.length > 0) {
                      userData.metaUserId = usersForType[0].id;
                    }
                  }

                  const criteriaUser: any = {
                    id: userData.id || 0, // Use existing criteriaUser ID
                    criteriaId: 0,
                    metaUserId: userData.metaUserId || null,
                    isDelete: false,
                    createBy: 'system',
                    createDate: new Date().toISOString(),
                    updateBy: null,
                    updateDate: null
                  };

                  // Add specific criteria data for sub category (same logic as main)
                  if (criteriaType === 'debit' && userData.debitAmount && userData.selectedMoneyTypeId) {
                    criteriaUser.debits = [{
                      id: userData.debitId || 0, // Use existing debit ID
                      criteriaUserId: 0,
                      metaMoneyTypeId: userData.selectedMoneyTypeId,
                      cash: typeof userData.debitAmount === 'string' ? parseFloat(userData.debitAmount) : userData.debitAmount,
                      isDelete: false,
                      createBy: 'system',
                      createDate: new Date().toISOString(),
                      updateBy: null,
                      updateDate: null
                    }];
                  }

                  if (criteriaType === 'credit' && userData.creditAmount) {
                    criteriaUser.credits = [{
                      id: userData.creditId || 0, // Use existing credit ID
                      criteriaUserId: 0,
                      credit1: typeof userData.creditAmount === 'string' ? parseFloat(userData.creditAmount) : userData.creditAmount,
                      isDelete: false,
                      createBy: 'system',
                      createDate: new Date().toISOString(),
                      updateBy: null,
                      updateDate: null
                    }];
                  }

                  if (criteriaType === 'marginalCredit' && 
                      (userData.marginalCreditPercent || userData.marginalCreditNonLimit)) {
                    criteriaUser.marginalCredits = [{
                      id: userData.marginalCreditId || 0, // Use existing marginal credit ID
                      criteriaUserId: 0,
                      percent: userData.marginalCreditNonLimit ? null : 
                        (userData.marginalCreditPercent ? 
                          (typeof userData.marginalCreditPercent === 'string' ? parseFloat(userData.marginalCreditPercent) : userData.marginalCreditPercent) 
                          : null),
                      isNonLimit: userData.marginalCreditNonLimit || false,
                      isDelete: false,
                      createBy: 'system',
                      createDate: new Date().toISOString(),
                      updateBy: null,
                      updateDate: null
                    }];
                  }

                  if (criteriaType === 'auctionAmount' && userData.auctionAmountValue) {
                    criteriaUser.auctionAmounts = [{
                      id: userData.auctionAmountId || 0, // Use existing auction amount ID
                      criteriaUserId: 0,
                      amount: typeof userData.auctionAmountValue === 'string' ? parseInt(userData.auctionAmountValue) : userData.auctionAmountValue,
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

                if (criteriaUsers.length > 0) {
                  subCategoryCriteria.push({
                    id: this.existingCriteriaIds[subCategoryKey]?.[criteriaType] || 0, // Use existing criteria ID
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
              }
            });
          }

          // Add sub category
          auctionCategories.push({
            id: subCat.id || 0, // Use existing ID or 0 for new
            metaCategoryId: subCat.metaCategoryId,
            isDelete: false,
            createBy: 'system',
            createDate: new Date().toISOString(),
            updateBy: null,
            updateDate: null,
            criteria: subCategoryCriteria
          });
        });
      }
    });

    // เตรียมข้อมูล auction พร้อม categories ที่มี criteria
    const auctionData = {
      ...this.auction,
      auctionCategories: auctionCategories,
      updateDate: new Date().toISOString()
    };

    // Determine if this is create or update operation
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

  addMainCategory(): void {
    this.showMainCategoryForm = true;
  }

  onMainCategorySelect(categoryId: string): void {
    const id = parseInt(categoryId);
    if (!id) return;
    
    const selectedCategory = this.mainCategories.find(c => c.id === id);
    if (selectedCategory) {
      // เพิ่มประเภทหลักเข้าไปใน auctionCategories
      this.auctionCategories.push({
        id: 0,
        metaCategoryId: selectedCategory.id,
        categoryName: selectedCategory.categoryName,
        isMainCategory: true,
        subCategories: []
      });
      
      // รีเซ็ตฟอร์ม
      this.showMainCategoryForm = false;
    }
  }

  addSubCategory(mainCategoryIndex: number): void {
    const mainCategory = this.auctionCategories[mainCategoryIndex];
    this.subCategories = this.metaCategories.filter(c => c.categoryHeaderId === mainCategory.metaCategoryId);
    
    // เพิ่มฟอร์มประเภทรอง
    mainCategory.showSubCategoryForm = true;
  }

  onSubCategorySelect(mainCategoryIndex: number, subCategoryId: string): void {
    const id = parseInt(subCategoryId);
    if (!id) return;
    
    const selectedSubCategory = this.subCategories.find(c => c.id === id);
    if (selectedSubCategory) {
      this.auctionCategories[mainCategoryIndex].subCategories.push({
        id: selectedSubCategory.id, // ใช้ id จริงแทน 0
        metaCategoryId: selectedSubCategory.id,
        categoryName: selectedSubCategory.categoryName
      });
      
      // รีเซ็ตฟอร์ม
      this.auctionCategories[mainCategoryIndex].showSubCategoryForm = false;
    }
  }

  removeMainCategory(index: number): void {
    this.auctionCategories.splice(index, 1);
  }

  removeSubCategory(mainIndex: number, subIndex: number): void {
    this.auctionCategories[mainIndex].subCategories.splice(subIndex, 1);
  }

  getUsersByType(userType: string): MetaUser[] {
    // Return users based on their position in the array (assuming order: General, Member, VIP)
    const userTypes = ['General', 'Member', 'VIP'];
    const typeIndex = userTypes.indexOf(userType);
    
    if (typeIndex === -1) return [];
    
    // Return a subset of users based on the type index
    const usersPerType = Math.ceil(this.metaUsers.length / 3);
    const startIndex = typeIndex * usersPerType;
    const endIndex = startIndex + usersPerType;
    
    return this.metaUsers.slice(startIndex, endIndex);
  }

  // Handle main category click
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

  // Handle sub category click
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

  // Initialize criteria data for a specific category
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

  // Check if criteria is selected for current category
  isCriteriaSelectedForCategory(criteriaType: string): boolean {
    if (!this.showCriteriaForCategory) return false;
    return this.selectedCriteria[this.showCriteriaForCategory]?.[criteriaType] || false;
  }

  // Handle criteria change for current category
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

  // Initialize criteria users data for category
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

  // Get criteria users data for current category
  getCriteriaUsersDataForCategory(criteriaType: string): any[] {
    if (!this.showCriteriaForCategory) return [];
    return this.criteriaUsersData[this.showCriteriaForCategory]?.[criteriaType] || [];
  }

  // Update criteria user data for current category
  updateCriteriaUserDataForCategory(criteriaType: string, userIndex: number, field: string, value: any): void {
    if (!this.showCriteriaForCategory) return;
    
    if (!this.criteriaUsersData[this.showCriteriaForCategory]?.[criteriaType]?.[userIndex]) {
      this.initializeCriteriaUsersForCategory(this.showCriteriaForCategory, criteriaType);
    }
    
    this.criteriaUsersData[this.showCriteriaForCategory][criteriaType][userIndex][field] = value;
  }

  // Debit money type change for category
  onDebitMoneyTypeChangeForCategory(userIndex: number, moneyTypeId: string): void {
    if (!this.showCriteriaForCategory) return;
    this.updateCriteriaUserDataForCategory('debit', userIndex, 'selectedMoneyTypeId', moneyTypeId ? parseInt(moneyTypeId) : null);
  }

  // Marginal credit non-limit change for category
  onMarginalCreditNonLimitChangeForCategory(userIndex: number, isChecked: boolean): void {
    if (!this.showCriteriaForCategory) return;
    this.updateCriteriaUserDataForCategory('marginalCredit', userIndex, 'marginalCreditNonLimit', isChecked);
    if (isChecked) {
      this.updateCriteriaUserDataForCategory('marginalCredit', userIndex, 'marginalCreditPercent', null);
    }
  }

  // Get placeholder for debit for category
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

  // Get selected money type name for category
  getSelectedMoneyTypeNameForCategory(userIndex: number): string {
    if (!this.showCriteriaForCategory) return '';
    
    const criteriaData = this.criteriaUsersData[this.showCriteriaForCategory]?.debit?.[userIndex];
    if (!criteriaData) return '';

    const selectedMoneyTypeId = criteriaData.selectedMoneyTypeId;
    if (!selectedMoneyTypeId) return '';

    const selectedMoneyType = this.metaMoneyTypes.find(mt => mt.id === selectedMoneyTypeId);
    return selectedMoneyType && selectedMoneyType.moneyTypeName ? selectedMoneyType.moneyTypeName : '';
  }

  // Check if sub category is already selected in the main category
  isSubCategoryAlreadySelected(mainIndex: number, subCategoryId: number): boolean {
    if (!this.auctionCategories[mainIndex] || !this.auctionCategories[mainIndex].subCategories) {
      return false;
    }
    
    // Convert subCategoryId to number for comparison
    const categoryIdToCheck = Number(subCategoryId);
    
    return this.auctionCategories[mainIndex].subCategories.some((subCat: any) => Number(subCat.id) === categoryIdToCheck);
  }
}
