export interface MarginalCredit {
  id: number;
  criteriaUserId: number | null;
  percent: number | null;
  isNonLimit: boolean | null;
  isDelete: boolean;
  createBy: string | null;
  createDate: string | null;
  updateBy: string | null;
  updateDate: string | null;
}
