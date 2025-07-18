using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Auction_back.Models;

[Table("Debit")]
public partial class Debit
{
    [Key]
    [Column("ID")]
    public int Id { get; set; }

    [Column("CriteriaUserID")]
    public int? CriteriaUserId { get; set; }

    [Column("MetaMoneyTypeID")]
    public int? MetaMoneyTypeId { get; set; }

    public int? Cash { get; set; }

    public string? CreateBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreateDate { get; set; }

    public string? UpdateBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdateDate { get; set; }

    public bool IsDelete { get; set; }

    [System.Text.Json.Serialization.JsonIgnore]
    [ForeignKey("CriteriaUserId")]
    [InverseProperty("Debits")]
    public virtual CriteriaUser? CriteriaUser { get; set; }

    [ForeignKey("MetaMoneyTypeId")]
    [InverseProperty("Debits")]
    public virtual MetaMoneyType? MetaMoneyType { get; set; }
}
