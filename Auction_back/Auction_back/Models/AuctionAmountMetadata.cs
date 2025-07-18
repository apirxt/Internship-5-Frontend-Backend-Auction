using System.ComponentModel.DataAnnotations;

namespace Auction_back.Models
{
    public class AuctionAmountMetadata
    {
    }
    [MetadataType(typeof(AuctionMetadata))]
    public partial class AuctionAmount
    {
        public AuctionAmount Create(CriteriaUser criteriaUser, DateTime datenow)
        {
            this.CriteriaUser = criteriaUser;
            this.IsDelete = false;
            this.CreateBy = "Create";
            this.CreateDate = datenow;
            this.UpdateBy = "Create";
            this.UpdateDate = datenow;
            return this;
        }
        
        public AuctionAmount Edit(CriteriaUser criteriaUser, DateTime datenow, AuctiondbContext context, AuctionAmount updateData)
        {
            this.CriteriaUser = criteriaUser;
            this.UpdateBy = "Edit";
            this.UpdateDate = datenow;
            this.Amount = updateData.Amount;
            // ... เพิ่มเติม property ที่ต้องการ map
            context.AuctionAmounts.Update(this);
            return this;
        }
    }
}