using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Auction_back.Models;

[Table("MetaCriteriaType")]
public partial class MetaCriteriaType
{
    [Key]
    [Column("ID")]
    public int Id { get; set; }

    public string? CriteriaTypeName { get; set; }

    public string? CreateBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreateDate { get; set; }

    public string? UpdateBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdateDate { get; set; }

    public bool IsDelete { get; set; }

    [InverseProperty("MetaCriteriaType")]
    public virtual ICollection<Criterion> Criteria { get; set; } = new List<Criterion>();
}
