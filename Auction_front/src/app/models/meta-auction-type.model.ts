import { Auction } from './auction.model';

// meta-auction-type.model.ts
export interface MetaAuctionType {
  id: number;
  auctionTypeName: string | null;
  createBy: string | null;
  createDate: string | null;
  updateBy: string | null;
  updateDate: string | null;
  isDelete: boolean;
  auctions?: Auction[];
}