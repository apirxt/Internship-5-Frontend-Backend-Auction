import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
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

@Component({
  selector: 'app-auction-create',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './auction-create.component.html',
  styleUrl: './auction-create.component.css'
})
export class AuctionCreateComponent implements OnInit {
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
  debits: Debit[] = [];
  credits: Credit[] = [];
  marginalCredits: MarginalCredit[] = [];
  auctionAmounts: AuctionAmount[] = [];
  selectedCriteria: { [key: string]: boolean } = {};
  criteriaUsersData: { [key: string]: any[] } = {};
  showMainCategoryForm: boolean = false;
  isLoading: boolean = false;
  message: string = '';
  isSuccess: boolean = false;

  private apiUrl = 'http://localhost:5186/api'; // ปรับ URL ตาม backend ของคุณ

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAuctionTypes();
    this.loadMetaCategories();
    this.loadMetaCriteriaTypes();
    this.loadMetaUsers();
    this.loadMetaMoneyTypes();
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

  onSubmit(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.message = '';

    // เตรียมข้อมูล criteria ก่อน
    const criteria: any[] = [];
    
    // Get criteria type IDs from metaCriteriaTypes
    const getCriteriaTypeId = (typeName: string): number => {
      const criteriaType = this.metaCriteriaTypes.find(ct => 
        ct.criteriaTypeName && ct.criteriaTypeName.toLowerCase().includes(typeName.toLowerCase())
      );
      return criteriaType ? criteriaType.id : 1; // Default to 1 if not found
    };

    Object.keys(this.selectedCriteria).forEach(key => {
      if (this.selectedCriteria[key]) {
        let criteriaTypeId: number;
        
        // Map criteria keys to actual MetaCriteriaType IDs
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
        
        // Create criteria users for each user type (General, Member, VIP)
        const criteriaUsers: any[] = [];
        usersData.forEach((userData, index) => {
          // สร้าง CriteriaUser พื้นฐาน
          const criteriaUser: any = {
            id: 0,
            criteriaId: 0, // จะถูกอัพเดทใน backend
            metaUserId: userData.metaUserId || null,
            isDelete: false,
            createBy: 'system',
            createDate: new Date().toISOString(),
            updateBy: null,
            updateDate: null
          };

          // เพิ่มข้อมูลตามประเภท criteria โดยสร้าง child objects
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

          // เพิ่ม CriteriaUser เฉพาะเมื่อมีข้อมูล
          if (criteriaUser.debits || criteriaUser.credits || criteriaUser.marginalCredits || criteriaUser.auctionAmounts) {
            criteriaUsers.push(criteriaUser);
          }
        });

        // สร้าง Criteria พร้อม CriteriaUsers
        criteria.push({
          id: 0,
          auctionCategoryId: 0, // จะถูกอัพเดทใน backend
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

    // เตรียมข้อมูล auction categories พร้อม criteria
    const auctionCategories: any[] = [];
    this.auctionCategories.forEach(mainCat => {
      // เพิ่ม main category พร้อม criteria
      auctionCategories.push({
        id: 0,
        metaCategoryId: mainCat.metaCategoryId,
        isDelete: false,
        createBy: 'system',
        createDate: new Date().toISOString(),
        updateBy: null,
        updateDate: null,
        criteria: criteria // เพิ่ม criteria ลงใน main category
      });

      // เพิ่ม sub categories (ไม่ต้องมี criteria ซ้ำ)
      if (mainCat.subCategories && mainCat.subCategories.length > 0) {
        mainCat.subCategories.forEach((subCat: any) => {
          auctionCategories.push({
            id: 0,
            metaCategoryId: subCat.metaCategoryId,
            isDelete: false,
            createBy: 'system',
            createDate: new Date().toISOString(),
            updateBy: null,
            updateDate: null,
            criteria: [] // sub categories ไม่มี criteria
          });
        });
      }
    });

    // เตรียมข้อมูล auction พร้อม categories ที่มี criteria
    const auctionData = {
      ...this.auction,
      auctionCategories: auctionCategories,
      createDate: new Date().toISOString(),
      updateDate: new Date().toISOString()
    };

    // Debug: Log the data being sent to the backend
    console.log('Data being sent to backend:', JSON.stringify(auctionData, null, 2));
    console.log('Criteria count:', criteria.length);
    console.log('Selected criteria:', this.selectedCriteria);
    console.log('Criteria users data:', this.criteriaUsersData);

    this.http.post<Auction>(`${this.apiUrl}/Auction`, auctionData)
      .subscribe({
        next: (response) => {
          this.showMessage('สร้างการประมูล หมวดหมู่ และเกณฑ์สำเร็จ!', true);
          this.resetForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating auction:', error);
          this.showMessage('เกิดข้อผิดพลาดในการสร้างการประมูล', false);
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
    this.showMainCategoryForm = false;
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
        id: 0,
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

  onCriteriaChange(criteriaKey: string | number, isChecked: boolean): void {
    this.selectedCriteria[criteriaKey] = isChecked;
    
    if (isChecked) {
      // สร้างข้อมูลเริ่มต้นสำหรับ criteria types
      this.criteriaUsersData[criteriaKey] = [
        {
          userType: 'General',
          selectedUserId: null,
          minAmount: null,
          maxAmount: null,
          percentage: null,
          isUseCredit: false,
          selectedMoneyTypeId: null,
          // ข้อมูลใหม่ตามรูปภาพ
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
          // ข้อมูลใหม่ตามรูปภาพ
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
          // ข้อมูลใหม่ตามรูปภาพ
          debitAmount: null,
          creditAmount: null,
          marginalCreditPercent: null,
          marginalCreditNonLimit: false,
          auctionAmountValue: null
        }
      ];
    } else {
      // ลบข้อมูลเมื่อไม่เลือก
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

  updateCriteriaUserData(criteriaKey: string | number, userTypeIndex: number, field: string, value: any): void {
    if (this.criteriaUsersData[criteriaKey] && this.criteriaUsersData[criteriaKey][userTypeIndex]) {
      this.criteriaUsersData[criteriaKey][userTypeIndex][field] = value;
      
      // Auto-assign metaUserId based on userType
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
      // Set the checkbox value
      this.criteriaUsersData[criteriaKey][userTypeIndex].marginalCreditNonLimit = isChecked;
      
      // If checkbox is checked, clear the percent value and disable input
      if (isChecked) {
        this.criteriaUsersData[criteriaKey][userTypeIndex].marginalCreditPercent = null;
      }
      
      // Auto-assign metaUserId based on userType
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

  // Methods for Debit Money Type handling
  onDebitMoneyTypeChange(userTypeIndex: number, moneyTypeId: string): void {
    if (this.criteriaUsersData['debit'] && this.criteriaUsersData['debit'][userTypeIndex]) {
      const id = parseInt(moneyTypeId);
      this.criteriaUsersData['debit'][userTypeIndex].selectedMoneyTypeId = id || null;
      
      // Clear the amount when changing money type
      this.criteriaUsersData['debit'][userTypeIndex].debitAmount = null;
      
      // Auto-assign metaUserId based on userType
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

    // Check if it's Amount or Percent based on the money type name
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
