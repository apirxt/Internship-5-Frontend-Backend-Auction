using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Auction_back.Models;

[Table("CriteriaUser")]
public partial class CriteriaUser
{
    [Key]
    [Column("ID")]
    public int Id { get; set; }

    [Column("CriteriaID")]
    public int? CriteriaId { get; set; }

    [Column("MetaUserID")]
    public int? MetaUserId { get; set; }

    public string? CreateBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreateDate { get; set; }

    public string? UpdateBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdateDate { get; set; }

    public bool IsDelete { get; set; }

    [InverseProperty("CriteriaUser")]
    public virtual ICollection<AuctionAmount> AuctionAmounts { get; set; } = new List<AuctionAmount>();

    [InverseProperty("CriteriaUser")]
    public virtual ICollection<Credit> Credits { get; set; } = new List<Credit>();

    [System.Text.Json.Serialization.JsonIgnore]
    [ForeignKey("CriteriaId")]
    [InverseProperty("CriteriaUsers")]
    public virtual Criterion? Criteria { get; set; }

    [InverseProperty("CriteriaUser")]
    public virtual ICollection<Debit> Debits { get; set; } = new List<Debit>();

    [InverseProperty("CriteriaUser")]
    public virtual ICollection<MarginalCredit> MarginalCredits { get; set; } = new List<MarginalCredit>();

    [ForeignKey("MetaUserId")]
    [InverseProperty("CriteriaUsers")]
    public virtual MetaUser? MetaUser { get; set; }
}
