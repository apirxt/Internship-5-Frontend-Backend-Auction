using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Auction_back.Models;

[Table("MetaAuctionType")]
public partial class MetaAuctionType
{
    [Key]
    [Column("ID")]
    public int Id { get; set; }

    public string? AuctionTypeName { get; set; }

    public string? CreateBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreateDate { get; set; }

    public string? UpdateBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdateDate { get; set; }

    public bool IsDelete { get; set; }

    [InverseProperty("MetaAuctionType")]
    public virtual ICollection<Auction> Auctions { get; set; } = new List<Auction>();
}
