using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Auction_back.Models;

[Table("Credit")]
public partial class Credit
{
    [Key]
    [Column("ID")]
    public int Id { get; set; }

    [Column("CriteriaUserID")]
    public int? CriteriaUserId { get; set; }

    [Column("Credit")]
    public int? Credit1 { get; set; }

    public string? CreateBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreateDate { get; set; }

    public string? UpdateBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdateDate { get; set; }

    public bool IsDelete { get; set; }

    [System.Text.Json.Serialization.JsonIgnore]
    [ForeignKey("CriteriaUserId")]
    [InverseProperty("Credits")]
    public virtual CriteriaUser? CriteriaUser { get; set; }
}
