using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Auction_back.Models;

[Table("MetaUser")]
public partial class MetaUser
{
    [Key]
    [Column("ID")]
    public int Id { get; set; }

    public string? UserName { get; set; }

    public string? CreateBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreateDate { get; set; }

    public string? UpdateBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdateDate { get; set; }

    public bool IsDelete { get; set; }

    [InverseProperty("MetaUser")]
    public virtual ICollection<CriteriaUser> CriteriaUsers { get; set; } = new List<CriteriaUser>();
}
