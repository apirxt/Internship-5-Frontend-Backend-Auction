// meta-money-type.model.ts
export interface MetaMoneyType {
  id: number;
  moneyTypeName: string | null;
  createBy: string | null;
  createDate: string | null;
  updateBy: string | null;
  updateDate: string | null;
  isDelete: boolean;
}