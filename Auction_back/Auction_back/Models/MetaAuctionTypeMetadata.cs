using System.ComponentModel.DataAnnotations;

namespace Auction_back.Models
{
    public class MetaAuctionTypeMetadata
    {
    }
    [MetadataType(typeof(AuctionMetadata))]
    public partial class MetaAuctionType
    {
        // public MetaAuctionType Create(AuctiondbContext context)
        // {
        //    return this;
        // }
    }
}
