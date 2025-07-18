using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Auction_back.Models;

[Table("AuctionAmount")]
public partial class AuctionAmount
{
    [Key]
    [Column("ID")]
    public int Id { get; set; }

    [Column("CriteriaUserID")]
    public int? CriteriaUserId { get; set; }

    public int? Amount { get; set; }

    public string? CreateBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreateDate { get; set; }

    public string? UpdateBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdateDate { get; set; }

    public bool IsDelete { get; set; }

    [System.Text.Json.Serialization.JsonIgnore]
    [ForeignKey("CriteriaUserId")]
    [InverseProperty("AuctionAmounts")]
    public virtual CriteriaUser? CriteriaUser { get; set; }
}
