import { AuctionCategory } from './auction-category.model';
import { MetaAuctionType } from './meta-auction-type.model';

export interface Auction {
  id: number;
  metaAuctionTypeId: number;
  auctionName: string | null;
  status: boolean;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  isDelete: boolean;
  createBy: string | null;
  createDate: string | null;
  updateBy: string | null;
  updateDate: string | null;
  metaAuctionType?: MetaAuctionType;
  auctionCategories?: AuctionCategory[];
}
