import { AuctionCategory } from './auction-category.model';

// meta-category.model.ts
export interface MetaCategory {
  id: number;
  categoryName: string | null;
  categoryHeaderId: number | null;
  createBy: string | null;
  createDate: string | null;
  updateBy: string | null;
  updateDate: string | null;
  isDelete: boolean;
  categoryHeader?: MetaCategory | null;
  inverseCategoryHeader?: MetaCategory[] | null;
  auctionCategories?: AuctionCategory[];
}