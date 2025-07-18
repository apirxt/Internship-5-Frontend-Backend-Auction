using Auction_back.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Auction_back.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuctionController : ControllerBase
    {
        private readonly AuctiondbContext _context;
        public AuctionController(AuctiondbContext context)
        {
            _context = context;
        }

        // POST: api/Auction
        [HttpPost]
        public ActionResult<Auction> CreateAuction([FromBody] Auction auction)
        {
            if (auction == null)
            {
                return BadRequest();
            }

            auction.Create(_context);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetAuctionById), new { id = auction.Id }, auction);
        }

        // GET: api/Auction/All
        [HttpGet("All")]
        public ActionResult<Auction> GetAuctionAll()
        {
            List<Auction> auctions = _context.Auctions
                .Include(a => a.AuctionCategories)
                    .ThenInclude(ac => ac.Criteria)
                        .ThenInclude(c => c.CriteriaUsers)
                            .ThenInclude(cu => cu.Credits)
                .Include(a => a.AuctionCategories)
                    .ThenInclude(ac => ac.Criteria)
                        .ThenInclude(c => c.CriteriaUsers)
                            .ThenInclude(cu => cu.Debits)
                .Include(a => a.AuctionCategories)
                    .ThenInclude(ac => ac.Criteria)
                        .ThenInclude(c => c.CriteriaUsers)
                            .ThenInclude(cu => cu.MarginalCredits)
                .Include(a => a.AuctionCategories)
                    .ThenInclude(ac => ac.Criteria)
                        .ThenInclude(c => c.CriteriaUsers)
                            .ThenInclude(cu => cu.AuctionAmounts)
                .Include(a => a.MetaAuctionType)
                .Where(a => !a.IsDelete)
                .ToList();

            return Ok(auctions);
        }

        // GET: api/Auction/{id}
        [HttpGet("{id}")]
        public ActionResult<Auction> GetAuctionById(int id)
        {
            Auction? auction = _context.Auctions
                .Include(a => a.AuctionCategories)
                    .ThenInclude(ac => ac.Criteria)
                        .ThenInclude(c => c.CriteriaUsers)
                            .ThenInclude(cu => cu.Credits)
                .Include(a => a.AuctionCategories)
                    .ThenInclude(ac => ac.Criteria)
                        .ThenInclude(c => c.CriteriaUsers)
                            .ThenInclude(cu => cu.Debits)
                .Include(a => a.AuctionCategories)
                    .ThenInclude(ac => ac.Criteria)
                        .ThenInclude(c => c.CriteriaUsers)
                            .ThenInclude(cu => cu.MarginalCredits)
                .Include(a => a.AuctionCategories)
                    .ThenInclude(ac => ac.Criteria)
                        .ThenInclude(c => c.CriteriaUsers)
                            .ThenInclude(cu => cu.AuctionAmounts)
                .Include(a => a.MetaAuctionType)
                .FirstOrDefault(a => a.Id == id && !a.IsDelete);

            if (auction == null)
            {
                return NotFound();
            }
            return Ok(auction);
        }

        // PUT: api/Auction/{id}
        [HttpPut("{id}")]
        public ActionResult UpdateAuction(int id, [FromBody] Auction auction)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Auction? existingAuction = _context.Auctions
                .Include(a => a.AuctionCategories)
                    .ThenInclude(ac => ac.Criteria)
                        .ThenInclude(c => c.CriteriaUsers)
                            .ThenInclude(cu => cu.Credits)
                .Include(a => a.AuctionCategories)
                    .ThenInclude(ac => ac.Criteria)
                        .ThenInclude(c => c.CriteriaUsers)
                            .ThenInclude(cu => cu.Debits)
                .Include(a => a.AuctionCategories)
                    .ThenInclude(ac => ac.Criteria)
                        .ThenInclude(c => c.CriteriaUsers)
                            .ThenInclude(cu => cu.MarginalCredits)
                .Include(a => a.AuctionCategories)
                    .ThenInclude(ac => ac.Criteria)
                        .ThenInclude(c => c.CriteriaUsers)
                            .ThenInclude(cu => cu.AuctionAmounts)
                .Include(a => a.MetaAuctionType)
                .FirstOrDefault(a => a.Id == id && !a.IsDelete);

            if (existingAuction == null)
            {
                return NotFound();
            }

            existingAuction.Edit(_context, auction);
            _context.SaveChanges();
            return Ok(existingAuction);
        }

        // DELETE: api/Auction/{id}
        [HttpDelete("{id}")]
        public ActionResult DeleteAuction(int id)
        {
            Auction? auction = _context.Auctions
                .Include(a => a.AuctionCategories)
                    .ThenInclude(ac => ac.Criteria)
                        .ThenInclude(c => c.CriteriaUsers)
                            .ThenInclude(cu => cu.Credits)
                .Include(a => a.AuctionCategories)
                    .ThenInclude(ac => ac.Criteria)
                        .ThenInclude(c => c.CriteriaUsers)
                            .ThenInclude(cu => cu.Debits)
                .Include(a => a.AuctionCategories)
                    .ThenInclude(ac => ac.Criteria)
                        .ThenInclude(c => c.CriteriaUsers)
                            .ThenInclude(cu => cu.MarginalCredits)
                .Include(a => a.AuctionCategories)
                    .ThenInclude(ac => ac.Criteria)
                        .ThenInclude(c => c.CriteriaUsers)
                            .ThenInclude(cu => cu.AuctionAmounts)
                .FirstOrDefault(a => a.Id == id);

            if (auction == null)
            {
                return NotFound();
            }

            auction.Delete(_context, auction);
            _context.SaveChanges();
            return Ok(new { message = "Deleted successfully" });
        }
    }
}
