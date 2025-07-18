using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Auction_back.Models;

[Table("MetaCategory")]
public partial class MetaCategory
{
    [Key]
    [Column("ID")]
    public int Id { get; set; }

    public string? CategoryName { get; set; }

    [Column("CategoryHeaderID")]
    public int? CategoryHeaderId { get; set; }

    public string? CreateBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreateDate { get; set; }

    public string? UpdateBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdateDate { get; set; }

    public bool IsDelete { get; set; }

    [InverseProperty("MetaCategory")]
    public virtual ICollection<AuctionCategory> AuctionCategories { get; set; } = new List<AuctionCategory>();

    [ForeignKey("CategoryHeaderId")]
    [InverseProperty("InverseCategoryHeader")]
    public virtual MetaCategory? CategoryHeader { get; set; }

    [InverseProperty("CategoryHeader")]
    public virtual ICollection<MetaCategory> InverseCategoryHeader { get; set; } = new List<MetaCategory>();
}
