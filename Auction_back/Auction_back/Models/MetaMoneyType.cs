using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Auction_back.Models;

[Table("MetaMoneyType")]
public partial class MetaMoneyType
{
    [Key]
    [Column("ID")]
    public int Id { get; set; }

    public string? MoneyTypeName { get; set; }

    public string? CreateBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreateDate { get; set; }

    public string? UpdateBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdateDate { get; set; }

    public bool IsDelete { get; set; }

    [InverseProperty("MetaMoneyType")]
    public virtual ICollection<Debit> Debits { get; set; } = new List<Debit>();
}
