import { CriteriaUser } from './criteria-user.model';

export interface Credit {
  id: number;
  criteriaUserId: number | null;
  credit: number | null;
  isDelete: boolean;
  createBy: string | null;
  createDate: string | null;
  updateBy: string | null;
  updateDate: string | null;
  criteriaUser?: CriteriaUser;
}
