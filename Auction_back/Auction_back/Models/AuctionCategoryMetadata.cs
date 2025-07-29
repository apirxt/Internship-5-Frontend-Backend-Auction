using System.ComponentModel.DataAnnotations;

namespace Auction_back.Models
{
    public class AuctionCategoryMetadata
    {
    }
    [MetadataType(typeof(AuctionMetadata))]
    public partial class AuctionCategory
    {
        public AuctionCategory Create(Auction auction, DateTime datenow)
        {
            this.Auction = auction;
            this.IsDelete = false;
            this.CreateBy = "Create";
            this.CreateDate = datenow;
            this.UpdateBy = "Create";
            this.UpdateDate = datenow;

            if (this.Criteria != null)
            {
                foreach (Criterion criteria in this.Criteria)
                {
                    criteria.Create(this, datenow);
                }
            }
            return this;
        }
        
        public AuctionCategory Edit(Auction auction, DateTime datenow, AuctiondbContext context, AuctionCategory updateData)
        {
            this.Auction = auction;
            this.UpdateBy = "Edit";
            this.UpdateDate = datenow;
            this.MetaCategoryId = updateData.MetaCategoryId;
            // ... เพิ่มเติม property ที่ต้องการ map

            if (this.Criteria != null && updateData.Criteria != null)
            {
                // Get IDs of criteria that should remain
                var updateCriteriaIds = updateData.Criteria.Where(c => c.Id > 0).Select(c => c.Id).ToList();
                
                // Soft delete criteria that are not in the update request
                foreach (Criterion existingCriteria in this.Criteria.Where(c => c.Id > 0 && !updateCriteriaIds.Contains(c.Id)))
                {
                    existingCriteria.IsDelete = true;
                    existingCriteria.UpdateBy = "Edit";
                    existingCriteria.UpdateDate = datenow;
                    
                    // Also soft delete all related CriteriaUsers and their sub-entities
                    foreach (var criteriaUser in existingCriteria.CriteriaUsers)
                    {
                        criteriaUser.IsDelete = true;
                        criteriaUser.UpdateBy = "Edit";
                        criteriaUser.UpdateDate = datenow;
                        
                        // Soft delete all related sub-entities
                        foreach (var credit in criteriaUser.Credits)
                        {
                            credit.IsDelete = true;
                            credit.UpdateBy = "Edit";
                            credit.UpdateDate = datenow;
                        }
                        foreach (var debit in criteriaUser.Debits)
                        {
                            debit.IsDelete = true;
                            debit.UpdateBy = "Edit";
                            debit.UpdateDate = datenow;
                        }
                        foreach (var marginal in criteriaUser.MarginalCredits)
                        {
                            marginal.IsDelete = true;
                            marginal.UpdateBy = "Edit";
                            marginal.UpdateDate = datenow;
                        }
                        foreach (var amount in criteriaUser.AuctionAmounts)
                        {
                            amount.IsDelete = true;
                            amount.UpdateBy = "Edit";
                            amount.UpdateDate = datenow;
                        }
                    }
                    
                    context.Criteria.Update(existingCriteria);
                }

                // Update existing criteria
                foreach (Criterion criteria in this.Criteria.Where(c => !c.IsDelete))
                {
                    Criterion? updateCriteria = updateData.Criteria.FirstOrDefault(c => c.Id == criteria.Id);
                    if (criteria.Id > 0 && updateCriteria != null)
                    {
                        criteria.Edit(this, datenow, context, updateCriteria);
                    }
                }
                
                // Add new Criteria (id == 0)
                foreach (Criterion newCriteria in updateData.Criteria.Where(c => c.Id == 0))
                {
                    newCriteria.AuctionCategoryId = this.Id;
                    newCriteria.Create(this, datenow);
                    context.Criteria.Add(newCriteria);
                }
            }
            context.AuctionCategories.Update(this);
            return this;
        }
    }
}