using System.ComponentModel.DataAnnotations;

namespace Auction_back.Models
{
    public class CriteriaUserMetadata
    {
    }
    [MetadataType(typeof(AuctionMetadata))]
    public partial class CriteriaUser
    {
        public CriteriaUser Create(Criterion criterion, DateTime datenow)
        {
            this.Criteria = criterion;
            this.IsDelete = false;
            this.CreateBy = "Create";
            this.CreateDate = datenow;
            this.UpdateBy = "Create";
            this.UpdateDate = datenow;

            if (this.Credits != null)
            {
                foreach (Credit credit in this.Credits)
                {
                    credit.Create(this, datenow);
                }
            }
            if (this.MarginalCredits != null)
            {
                foreach (MarginalCredit marginalCredit in this.MarginalCredits)
                {
                    marginalCredit.Create(this, datenow);
                }
            }
            if (this.Debits != null)
            {
                foreach (Debit debit in this.Debits)
                {
                    debit.Create(this, datenow);
                }
            }
            if (this.AuctionAmounts != null)
            {
                foreach (AuctionAmount auctionAmount in this.AuctionAmounts)
                {
                    auctionAmount.Create(this, datenow);
                }
            }
            return this;
        }
        
        public CriteriaUser Edit(Criterion criterion, DateTime datenow, AuctiondbContext context, CriteriaUser updateData)
        {
            this.Criteria = criterion;
            this.UpdateBy = "Edit";
            this.UpdateDate = datenow;
            this.MetaUserId = updateData.MetaUserId;
            // ... เพิ่มเติม property ที่ต้องการ map

            // Credits
            if (updateData.Credits != null)
            {
                foreach (Credit updateCredit in updateData.Credits)
                {
                    if (updateCredit.Id > 0)
                    {
                        Credit? existingCredit = this.Credits.FirstOrDefault(c => c.Id == updateCredit.Id);
                        if (existingCredit != null)
                        {
                            existingCredit.Edit(this, datenow, context, updateCredit);
                        }
                    }
                    else
                    {
                        updateCredit.CriteriaUserId = this.Id;
                        updateCredit.Create(this, datenow);
                        context.Credits.Add(updateCredit);
                    }
                }
            }
            // MarginalCredits
            if (updateData.MarginalCredits != null)
            {
                foreach (MarginalCredit updateMC in updateData.MarginalCredits)
                {
                    if (updateMC.Id > 0)
                    {
                        MarginalCredit? existingMC = this.MarginalCredits.FirstOrDefault(mc => mc.Id == updateMC.Id);
                        if (existingMC != null)
                        {
                            existingMC.Edit(this, datenow, context, updateMC);
                        }
                    }
                    else
                    {
                        updateMC.CriteriaUserId = this.Id;
                        updateMC.Create(this, datenow);
                        context.MarginalCredits.Add(updateMC);
                    }
                }
            }
            // Debits
            if (updateData.Debits != null)
            {
                foreach (Debit updateDebit in updateData.Debits)
                {
                    if (updateDebit.Id > 0)
                    {
                        Debit? existingDebit = this.Debits.FirstOrDefault(d => d.Id == updateDebit.Id);
                        if (existingDebit != null)
                        {
                            existingDebit.Edit(this, datenow, context, updateDebit);
                        }
                    }
                    else
                    {
                        updateDebit.CriteriaUserId = this.Id;
                        updateDebit.Create(this, datenow);
                        context.Debits.Add(updateDebit);
                    }
                }
            }
            // AuctionAmounts
            if (updateData.AuctionAmounts != null)
            {
                foreach (AuctionAmount updateAA in updateData.AuctionAmounts)
                {
                    if (updateAA.Id > 0)
                    {
                        AuctionAmount? existingAA = this.AuctionAmounts.FirstOrDefault(a => a.Id == updateAA.Id);
                        if (existingAA != null)
                        {
                            existingAA.Edit(this, datenow, context, updateAA);
                        }
                    }
                    else
                    {
                        updateAA.CriteriaUserId = this.Id;
                        updateAA.Create(this, datenow);
                        context.AuctionAmounts.Add(updateAA);
                    }
                }
            }
            context.CriteriaUsers.Update(this);
            return this;
        }
    }
}
