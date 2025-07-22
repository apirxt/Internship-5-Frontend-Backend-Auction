import { CriteriaUser } from './criteria-user.model';

export interface AuctionAmount {
  id: number;
  criteriaUserId: number | null;
  amount: number | null;
  isDelete: boolean;
  createBy: string | null;
  createDate: string | null;
  updateBy: string | null;
  updateDate: string | null;
  criteriaUser?: CriteriaUser;
}
