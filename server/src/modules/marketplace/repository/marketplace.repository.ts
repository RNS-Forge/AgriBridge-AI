import { db } from '../../../database/index.js';
import { 
  marketplaceListings, 
  marketplaceOffers, 
  marketplaceWishlists, 
  tenants, 
  buyers, 
  users 
} from '../../../db/schema.js';
import { eq, and, sql, gte, lte, like, asc, desc } from 'drizzle-orm';
import { QueryListingsParamsDto } from '../dto/marketplace.dto.js';

export class MarketplaceRepository {
  // ==========================================
  // LISTINGS
  // ==========================================

  async createListing(listingData: typeof marketplaceListings.$inferInsert) {
    const [newListing] = await db.insert(marketplaceListings).values(listingData).returning();
    return newListing;
  }

  async findListingById(id: string) {
    const result = await db
      .select({
        listing: marketplaceListings,
        tenant: tenants,
      })
      .from(marketplaceListings)
      .innerJoin(tenants, eq(marketplaceListings.tenantId, tenants.id))
      .where(eq(marketplaceListings.id, id))
      .limit(1);
    return result[0] || null;
  }

  async updateListingStatus(id: string, status: 'active' | 'sold' | 'cancelled') {
    const [updated] = await db
      .update(marketplaceListings)
      .set({ status, updatedAt: new Date() })
      .where(eq(marketplaceListings.id, id))
      .returning();
    return updated;
  }

  async listListings(params: QueryListingsParamsDto) {
    const conditions = [];

    if (params.status) {
      conditions.push(eq(marketplaceListings.status, params.status));
    } else {
      conditions.push(eq(marketplaceListings.status, 'active'));
    }

    if (params.search) {
      conditions.push(like(marketplaceListings.title, `%${params.search}%`));
    }

    if (params.minPrice) {
      conditions.push(gte(marketplaceListings.pricePerKg, params.minPrice.toString()));
    }

    if (params.maxPrice) {
      conditions.push(lte(marketplaceListings.pricePerKg, params.maxPrice.toString()));
    }

    if (params.minQuantity) {
      conditions.push(gte(marketplaceListings.quantityKg, params.minQuantity.toString()));
    }

    let query = db
      .select({
        listing: marketplaceListings,
        tenant: tenants,
      })
      .from(marketplaceListings)
      .innerJoin(tenants, eq(marketplaceListings.tenantId, tenants.id));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    // Sorting
    let sortColumn: any = marketplaceListings.createdAt;
    if (params.sortBy === 'price') {
      sortColumn = marketplaceListings.pricePerKg;
    } else if (params.sortBy === 'quantity') {
      sortColumn = marketplaceListings.quantityKg;
    }

    const sortOrder = params.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);
    query = query.orderBy(sortOrder) as any;

    // Pagination
    const limitVal = params.limit || 10;
    const pageVal = params.page || 1;
    const offsetVal = (pageVal - 1) * limitVal;

    return await query.limit(limitVal).offset(offsetVal);
  }

  // ==========================================
  // OFFERS & NEGOTIATIONS
  // ==========================================

  async createOffer(offerData: typeof marketplaceOffers.$inferInsert) {
    const [newOffer] = await db.insert(marketplaceOffers).values(offerData).returning();
    return newOffer;
  }

  async findOfferById(id: string) {
    const result = await db
      .select({
        offer: marketplaceOffers,
        buyer: buyers,
        buyerUser: users,
        listing: marketplaceListings,
      })
      .from(marketplaceOffers)
      .innerJoin(buyers, eq(marketplaceOffers.buyerId, buyers.id))
      .innerJoin(users, eq(buyers.userId, users.id))
      .innerJoin(marketplaceListings, eq(marketplaceOffers.listingId, marketplaceListings.id))
      .where(eq(marketplaceOffers.id, id))
      .limit(1);
    return result[0] || null;
  }

  async listOffersByListing(listingId: string) {
    return await db
      .select({
        offer: marketplaceOffers,
        buyer: buyers,
        buyerUser: users,
      })
      .from(marketplaceOffers)
      .innerJoin(buyers, eq(marketplaceOffers.buyerId, buyers.id))
      .innerJoin(users, eq(buyers.userId, users.id))
      .where(eq(marketplaceOffers.listingId, listingId))
      .orderBy(desc(marketplaceOffers.updatedAt));
  }

  async updateOfferStatus(
    offerId: string,
    status: 'pending' | 'accepted' | 'countered' | 'rejected' | 'cancelled',
    counterPricePerKg?: string,
    offeredBy?: 'buyer' | 'fpo'
  ) {
    const updateData: Partial<typeof marketplaceOffers.$inferInsert> = {
      status,
      updatedAt: new Date(),
    };

    if (counterPricePerKg !== undefined) {
      updateData.counterPricePerKg = counterPricePerKg;
    }
    if (offeredBy !== undefined) {
      updateData.offeredBy = offeredBy;
    }

    const [updated] = await db
      .update(marketplaceOffers)
      .set(updateData)
      .where(eq(marketplaceOffers.id, offerId))
      .returning();
    return updated;
  }

  // ==========================================
  // WISHLIST
  // ==========================================

  async addToWishlist(wishData: typeof marketplaceWishlists.$inferInsert) {
    const [newWish] = await db.insert(marketplaceWishlists).values(wishData).returning();
    return newWish;
  }

  async removeFromWishlist(buyerId: string, listingId: string) {
    await db
      .delete(marketplaceWishlists)
      .where(
        and(
          eq(marketplaceWishlists.buyerId, buyerId),
          eq(marketplaceWishlists.listingId, listingId)
        )
      );
    return true;
  }

  async getWishlistByBuyer(buyerId: string) {
    return await db
      .select({
        wishlist: marketplaceWishlists,
        listing: marketplaceListings,
        tenant: tenants,
      })
      .from(marketplaceWishlists)
      .innerJoin(marketplaceListings, eq(marketplaceWishlists.listingId, marketplaceListings.id))
      .innerJoin(tenants, eq(marketplaceListings.tenantId, tenants.id))
      .where(eq(marketplaceWishlists.buyerId, buyerId));
  }
}
