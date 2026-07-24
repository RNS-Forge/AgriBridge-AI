import { MarketplaceRepository } from '../repository/marketplace.repository.js';
import { 
  CreateListingDto, 
  ListingResponseDto, 
  CreateOfferDto, 
  OfferResponseDto, 
  WishlistResponseDto, 
  QueryListingsParamsDto 
} from '../dto/marketplace.dto.js';
import { db } from '../../../database/index.js';
import { orders, pools, batches, marketplaceListings, marketplaceOffers, marketplaceWishlists } from '../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { AuditLogService } from '../../../services/audit.service.js';

export class MarketplaceService {
  private marketplaceRepository = new MarketplaceRepository();

  private formatListingResponse(data: any): ListingResponseDto {
    const { listing, tenant } = data;
    return {
      id: listing.id,
      tenantId: listing.tenantId,
      fpoName: tenant ? tenant.name : undefined,
      poolId: listing.poolId,
      batchId: listing.batchId,
      title: listing.title,
      description: listing.description,
      quantityKg: listing.quantityKg,
      pricePerKg: listing.pricePerKg,
      status: listing.status,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
    };
  }

  private formatOfferResponse(data: any): OfferResponseDto {
    const { offer, buyer, buyerUser } = data;
    return {
      id: offer.id,
      listingId: offer.listingId,
      buyerId: offer.buyerId,
      buyerName: buyer ? buyer.companyName : undefined,
      offerPricePerKg: offer.offerPricePerKg,
      quantityKg: offer.quantityKg,
      status: offer.status,
      counterPricePerKg: offer.counterPricePerKg,
      offeredBy: offer.offeredBy,
      createdAt: offer.createdAt.toISOString(),
      updatedAt: offer.updatedAt.toISOString(),
    };
  }

  // ==========================================
  // LISTINGS
  // ==========================================

  async createListing(dto: CreateListingDto, actorUserId: string): Promise<ListingResponseDto> {
    const listingData = {
      tenantId: dto.tenantId,
      poolId: dto.poolId || null,
      batchId: dto.batchId || null,
      title: dto.title,
      description: dto.description || null,
      quantityKg: dto.quantityKg.toString(),
      pricePerKg: dto.pricePerKg.toString(),
      status: 'active' as const,
    };

    const newListing = await this.marketplaceRepository.createListing(listingData);
    const fullData = await this.marketplaceRepository.findListingById(newListing.id);

    AuditLogService.log({
      userId: actorUserId,
      tenantId: dto.tenantId,
      action: 'marketplace.listing.create',
      entityName: 'marketplace_listings',
      entityId: newListing.id,
      changes: dto,
    });

    return this.formatListingResponse(fullData);
  }

  async getListingDetails(listingId: string): Promise<ListingResponseDto> {
    const data = await this.marketplaceRepository.findListingById(listingId);
    if (!data) {
      throw new Error('Listing not found');
    }
    return this.formatListingResponse(data);
  }

  async listListings(params: QueryListingsParamsDto): Promise<ListingResponseDto[]> {
    const list = await this.marketplaceRepository.listListings(params);
    return list.map((item) => this.formatListingResponse(item));
  }

  // ==========================================
  // OFFERS & NEGOTIATION STATE MACHINE
  // ==========================================

  async submitOffer(dto: CreateOfferDto, actorUserId: string): Promise<OfferResponseDto> {
    const listing = await this.marketplaceRepository.findListingById(dto.listingId);
    if (!listing) {
      throw new Error('Listing not found');
    }
    if (listing.listing.status !== 'active') {
      throw new Error('Listing is no longer active for offers.');
    }

    const offerData = {
      listingId: dto.listingId,
      buyerId: dto.buyerId,
      offerPricePerKg: dto.offerPricePerKg.toString(),
      quantityKg: dto.quantityKg.toString(),
      status: 'pending' as const,
      offeredBy: 'buyer' as const,
    };

    const newOffer = await this.marketplaceRepository.createOffer(offerData);
    const fullOffer = await this.marketplaceRepository.findOfferById(newOffer.id);

    AuditLogService.log({
      userId: actorUserId,
      action: 'marketplace.offer.submit',
      entityName: 'marketplace_offers',
      entityId: newOffer.id,
      changes: dto,
    });

    return this.formatOfferResponse(fullOffer);
  }

  async fpoCounterOffer(
    offerId: string,
    counterPricePerKg: number,
    actorUserId: string,
    actorTenantId: string | null
  ): Promise<OfferResponseDto> {
    const existing = await this.marketplaceRepository.findOfferById(offerId);
    if (!existing) {
      throw new Error('Offer not found');
    }

    // Tenant Isolation
    if (actorTenantId && existing.listing.tenantId !== actorTenantId) {
      throw new Error('Access denied to counter offer for listing owned by another tenant FPO');
    }

    const updated = await this.marketplaceRepository.updateOfferStatus(
      offerId,
      'countered',
      counterPricePerKg.toString(),
      'fpo'
    );

    const fullOffer = await this.marketplaceRepository.findOfferById(offerId);

    AuditLogService.log({
      userId: actorUserId,
      tenantId: existing.listing.tenantId,
      action: 'marketplace.offer.counter',
      entityName: 'marketplace_offers',
      entityId: offerId,
      changes: { counterPricePerKg },
    });

    return this.formatOfferResponse(fullOffer);
  }

  async acceptOffer(
    offerId: string,
    actorUserId: string,
    actorTenantId: string | null
  ): Promise<OfferResponseDto> {
    const existing = await this.marketplaceRepository.findOfferById(offerId);
    if (!existing) {
      throw new Error('Offer not found');
    }

    if (existing.listing.status !== 'active') {
      throw new Error('Listing is no longer active.');
    }

    // Determine target price (either the original offer price or FPO counter price)
    const finalPrice = parseFloat(
      existing.offer.status === 'countered' && existing.offer.offeredBy === 'fpo'
        ? (existing.offer.counterPricePerKg || existing.offer.offerPricePerKg)
        : existing.offer.offerPricePerKg
    );

    const quantity = parseFloat(existing.offer.quantityKg);
    const totalPrice = finalPrice * quantity;

    // Resolve poolId (which is mandatory in order table)
    let poolId = existing.listing.poolId;
    if (!poolId) {
      if (existing.listing.batchId) {
        const batchRecord = await db
          .select().from(batches).where(eq(batches.id, existing.listing.batchId)).limit(1);
        poolId = batchRecord[0]?.poolId || null;
      }
    }

    if (!poolId) {
      // Create a temporary pool if none exists
      const [tempPool] = await db
        .insert(pools)
        .values({
          tenantId: existing.listing.tenantId,
          name: `Marketplace Order Pool - Listing: ${existing.listing.title}`,
          status: 'collecting',
        })
        .returning();
      poolId = tempPool.id;
    }

    // Execute order creation & listings update in transaction
    await db.transaction(async (tx) => {
      // 1. Accept this offer
      await tx
        .update(marketplaceOffers)
        .set({ status: 'accepted', updatedAt: new Date() })
        .where(eq(marketplaceOffers.id, offerId));

      // 2. Reject all other offers on this listing
      await tx
        .update(marketplaceOffers)
        .set({ status: 'rejected', updatedAt: new Date() })
        .where(eq(marketplaceOffers.listingId, existing.offer.listingId));

      // Re-set this offer back to accepted (since the previous batch update marks everything rejected)
      await tx
        .update(marketplaceOffers)
        .set({ status: 'accepted' })
        .where(eq(marketplaceOffers.id, offerId));

      // 3. Mark listing as sold
      await tx
        .update(marketplaceListings)
        .set({ status: 'sold', updatedAt: new Date() })
        .where(eq(marketplaceListings.id, existing.offer.listingId));

      // 4. Generate Purchase Order
      await tx.insert(orders).values({
        buyerId: existing.offer.buyerId,
        poolId: poolId as string,
        totalPriceUsd: totalPrice.toString(),
        currency: 'USD',
        status: 'pending',
      });
    });

    const fullOffer = await this.marketplaceRepository.findOfferById(offerId);

    AuditLogService.log({
      userId: actorUserId,
      tenantId: existing.listing.tenantId,
      action: 'marketplace.offer.accept',
      entityName: 'marketplace_offers',
      entityId: offerId,
    });

    return this.formatOfferResponse(fullOffer);
  }

  async rejectOffer(offerId: string, actorUserId: string): Promise<OfferResponseDto> {
    const existing = await this.marketplaceRepository.findOfferById(offerId);
    if (!existing) {
      throw new Error('Offer not found');
    }

    await this.marketplaceRepository.updateOfferStatus(offerId, 'rejected');
    const fullOffer = await this.marketplaceRepository.findOfferById(offerId);

    AuditLogService.log({
      userId: actorUserId,
      action: 'marketplace.offer.reject',
      entityName: 'marketplace_offers',
      entityId: offerId,
    });

    return this.formatOfferResponse(fullOffer);
  }

  // ==========================================
  // WISHLIST
  // ==========================================

  async addToWishlist(buyerId: string, listingId: string): Promise<boolean> {
    const listing = await this.marketplaceRepository.findListingById(listingId);
    if (!listing) {
      throw new Error('Listing not found');
    }

    // Verify if already wishlisted
    const existing = await db
      .select()
      .from(marketplaceWishlists)
      .where(
        and(
          eq(marketplaceWishlists.buyerId, buyerId),
          eq(marketplaceWishlists.listingId, listingId)
        )
      )
      .limit(1);

    if (!existing[0]) {
      await this.marketplaceRepository.addToWishlist({ buyerId, listingId });
    }
    return true;
  }

  async removeFromWishlist(buyerId: string, listingId: string): Promise<boolean> {
    await this.marketplaceRepository.removeFromWishlist(buyerId, listingId);
    return true;
  }

  async getWishlist(buyerId: string): Promise<WishlistResponseDto[]> {
    const list = await this.marketplaceRepository.getWishlistByBuyer(buyerId);
    return list.map((item) => ({
      id: item.wishlist.id,
      buyerId: item.wishlist.buyerId,
      listingId: item.wishlist.listingId,
      listing: this.formatListingResponse({ listing: item.listing, tenant: item.tenant }),
      createdAt: item.wishlist.createdAt.toISOString(),
    }));
  }
}
