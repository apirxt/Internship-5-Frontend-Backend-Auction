import { Criterion } from './criteria.model';

// meta-criteria-type.model.ts
export interface MetaCriteriaType {
  id: number;
  criteriaTypeName: string | null;
  createBy: string | null;
  createDate: string | null;
  updateBy: string | null;
  updateDate: string | null;
  isDelete: boolean;
  criteria?: Criterion[];
}