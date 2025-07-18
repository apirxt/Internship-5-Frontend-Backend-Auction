import { Debit } from './debit.model';
import { Credit } from './credit.model';
import { MarginalCredit } from './marginal-credit.model';
import { AuctionAmount } from './auction-amount.model';

export interface CriteriaUser {
  id: number;
  criteriaId: number | null;
  metaUserId: number | null;
  isDelete: boolean;
  createBy: string | null;
  createDate: string | null;
  updateBy: string | null;
  updateDate: string | null;
  credits?: Credit[];
  debits?: Debit[];
  marginalCredits?: MarginalCredit[];
  auctionAmounts?: AuctionAmount[];
}
