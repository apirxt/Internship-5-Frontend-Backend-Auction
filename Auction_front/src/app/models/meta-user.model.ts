import { CriteriaUser } from './criteria-user.model';

// meta-user.model.ts
export interface MetaUser {
  id: number;
  userName: string | null;
  createBy: string | null;
  createDate: string | null;
  updateBy: string | null;
  updateDate: string | null;
  isDelete: boolean;
  criteriaUsers?: CriteriaUser[];
}