using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Auction_back.Models;

public partial class Criterion
{
    [Key]
    [Column("ID")]
    public int Id { get; set; }

    [Column("AuctionCategoryID")]
    public int? AuctionCategoryId { get; set; }

    [Column("MetaCriteriaTypeID")]
    public int? MetaCriteriaTypeId { get; set; }

    public bool? IsCheck { get; set; }

    public string? CreateBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreateDate { get; set; }

    public string? UpdateBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdateDate { get; set; }

    public bool IsDelete { get; set; }

    [System.Text.Json.Serialization.JsonIgnore]
    [ForeignKey("AuctionCategoryId")]
    [InverseProperty("Criteria")]
    public virtual AuctionCategory? AuctionCategory { get; set; }

    [InverseProperty("Criteria")]
    public virtual ICollection<CriteriaUser> CriteriaUsers { get; set; } = new List<CriteriaUser>();

    [ForeignKey("MetaCriteriaTypeId")]
    [InverseProperty("Criteria")]
    public virtual MetaCriteriaType? MetaCriteriaType { get; set; }
}
