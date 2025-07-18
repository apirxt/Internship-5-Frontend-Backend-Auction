using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Auction_back.Models
{
    public class MarginalCreditMetadata
    {
    }
    [MetadataType(typeof(AuctionMetadata))]
    public partial class MarginalCredit
    {
        public MarginalCredit Create(CriteriaUser criteriaUser, DateTime datenow)
        {
            this.CriteriaUser = criteriaUser;
            this.IsDelete = false;
            this.CreateBy = "Create";
            this.CreateDate = datenow;
            this.UpdateBy = "Create";
            this.UpdateDate = datenow;
            return this;
        }
        
        public MarginalCredit Edit(CriteriaUser criteriaUser, DateTime datenow, AuctiondbContext context, MarginalCredit updateData)
        {
            this.CriteriaUser = criteriaUser;
            this.UpdateBy = "Edit";
            this.UpdateDate = datenow;
            this.Percent = updateData.Percent;
            this.IsNonLimit = updateData.IsNonLimit;
            // ... เพิ่มเติม property ที่ต้องการ map
            context.MarginalCredits.Update(this);
            return this;
        }
    }
}
