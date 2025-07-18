using System.ComponentModel.DataAnnotations;

namespace Auction_back.Models
{
    public class MetaMoneyTypeMetadata
    {
    }
    [MetadataType(typeof(AuctionMetadata))]
    public partial class MetaMoneyType
    {
        // public MetaMoneyType Create(AuctiondbContext context)
        // {
        //     return this;
        // }
    }
}
