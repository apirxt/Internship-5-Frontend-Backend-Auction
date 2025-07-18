using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Auction_back.Models;

[Table("AuctionCategory")]
public partial class AuctionCategory
{
    [Key]
    [Column("ID")]
    public int Id { get; set; }

    [Column("AuctionID")]
    public int? AuctionId { get; set; }

    [Column("MetaCategoryID")]
    public int? MetaCategoryId { get; set; }

    public string? CreateBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreateDate { get; set; }

    public string? UpdateBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdateDate { get; set; }

    public bool IsDelete { get; set; }

    [JsonIgnore]
    [ForeignKey("AuctionId")]
    [InverseProperty("AuctionCategories")]
    public virtual Auction? Auction { get; set; }

    [InverseProperty("AuctionCategory")]
    public virtual ICollection<Criterion> Criteria { get; set; } = new List<Criterion>();

    [ForeignKey("MetaCategoryId")]
    [InverseProperty("AuctionCategories")]
    public virtual MetaCategory? MetaCategory { get; set; }
}
