using System.ComponentModel.DataAnnotations;

namespace Auction_back.Models
{
    public class CriteriaMetadata
    {
    }
    [MetadataType(typeof(AuctionMetadata))]
    public partial class Criterion
    {
        public Criterion Create(AuctionCategory auctionCategory, DateTime datenow)
        {
            this.AuctionCategory = auctionCategory;
            this.IsCheck = this.IsCheck;
            this.IsDelete = false;
            this.CreateBy = "Create";
            this.CreateDate = datenow;
            this.UpdateBy = "Create";
            this.UpdateDate = datenow;

            if (this.CriteriaUsers != null)
            {
                foreach (CriteriaUser criteriaUser in this.CriteriaUsers)
                {
                    criteriaUser.Create(this, datenow);
                }
            }
            return this;
        }
        
        public Criterion Edit(AuctionCategory auctionCategory, DateTime datenow, AuctiondbContext context, Criterion updateData)
        {
            this.AuctionCategory = auctionCategory;
            this.UpdateBy = "Edit";
            this.UpdateDate = datenow;
            this.MetaCriteriaTypeId = updateData.MetaCriteriaTypeId;
            this.IsCheck = updateData.IsCheck;
            // ... เพิ่มเติม property ที่ต้องการ map

            if (this.CriteriaUsers != null && updateData.CriteriaUsers != null)
            {
                foreach (CriteriaUser criteriaUser in this.CriteriaUsers)
                {
                    CriteriaUser? updateCriteriaUser = updateData.CriteriaUsers.FirstOrDefault(cu => cu.Id == criteriaUser.Id);
                    if (criteriaUser.Id > 0 && updateCriteriaUser != null)
                    {
                        criteriaUser.Edit(this, datenow, context, updateCriteriaUser);
                    }
                }
                // Add new CriteriaUser (id == 0)
                foreach (CriteriaUser newCU in updateData.CriteriaUsers.Where(cu => cu.Id == 0))
                {
                    newCU.CriteriaId = this.Id;
                    newCU.Create(this, datenow);
                    context.CriteriaUsers.Add(newCU);
                }
            }
            context.Criteria.Update(this);
            return this;
        }
    }
}