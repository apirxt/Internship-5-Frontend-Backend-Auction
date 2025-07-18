import { CriteriaUser } from './criteria-user.model';

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
  criteriaUsers?: CriteriaUser[];
}
