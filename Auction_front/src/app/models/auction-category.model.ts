import { Criterion } from './criteria.model';

export interface AuctionCategory {
  id: number;
  auctionId: number | null;
  metaCategoryId: number | null;
  isDelete: boolean;
  createBy: string | null;
  createDate: string | null;
  updateBy: string | null;
  updateDate: string | null;
  criteria?: Criterion[];
}
