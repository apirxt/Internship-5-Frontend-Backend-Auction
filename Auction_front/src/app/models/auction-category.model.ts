import { Criterion } from './criteria.model';
import { MetaCategory } from './meta-category.model';
import { Auction } from './auction.model';

export interface AuctionCategory {
  id: number;
  auctionId: number | null;
  metaCategoryId: number | null;
  isDelete: boolean;
  createBy: string | null;
  createDate: string | null;
  updateBy: string | null;
  updateDate: string | null;
  auction?: Auction;
  metaCategory?: MetaCategory;
  criteria?: Criterion[];
}
