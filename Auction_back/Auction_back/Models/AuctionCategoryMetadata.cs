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
                foreach (Criterion criteria in this.Criteria)
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