import { CriteriaUser } from './criteria-user.model';
import { AuctionCategory } from './auction-category.model';
import { MetaCriteriaType } from './meta-criteria-type.model';

export interface Criterion {
  id: number;
  auctionCategoryId: number | null;
  metaCriteriaTypeId: number | null;
  isCheck: boolean | null;
  isDelete: boolean;
  createBy: string | null;
  createDate: string | null;
  updateBy: string | null;
  updateDate: string | null;
  auctionCategory?: AuctionCategory;
  metaCriteriaType?: MetaCriteriaType;
  criteriaUsers?: CriteriaUser[];
}
