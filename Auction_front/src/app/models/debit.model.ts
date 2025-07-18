export interface Debit {
  id: number;
  criteriaUserId: number | null;
  metaMoneyTypeId: number | null;
  cash: number | null;
  isDelete: boolean;
  createBy: string | null;
  createDate: string | null;
  updateBy: string | null;
  updateDate: string | null;
}
